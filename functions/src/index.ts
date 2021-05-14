import * as functions from "firebase-functions";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

// tslint:disable-next-line
import "./initialize";
import activityJson from "../data/activity.json";
import {
  fetchCaptured,
  fetchTeam,
  isUserInitialized,
  newCapture,
  removeCapture,
  setDefaultList,
} from "./db";
import { validateCapture } from "./validations";
import validator from "validator";

const cors = require("cors")({ origin: true });

/**
 * type merging
 */
declare module "firebase-functions" {
  export interface Request {
    token: Record<any, any>;
    uid: string;
  }
}

// auth constant
const auth = admin.auth();

/**
 * Middleware stuff
 */

const allowMethod = (method: string) => {
  return (req: functions.Request, res: functions.Response, next: Function) => {
    if (!req.method.match(new RegExp(method, "i"))) {
      res.sendStatus(404);
    } else {
      next(req, res);
    }
  };
};

const allowMethods = (...methods: string[]) => {
  return (req: functions.Request, res: functions.Response, next: Function) => {
    if (methods.some((m) => req.method.match(new RegExp(m, "i")))) {
      next(req, res);
    } else {
      res.sendStatus(404);
    }
  };
};

const authMiddleware = (
  req: functions.Request,
  res: functions.Response,
  next: Function
) => {
  if (req.headers.authorization) {
    try {
      const reqToken = jwt.verify(
        req.headers.authorization.split(" ")[1],
        functions.config().jwt.secret
      );
      req.token = reqToken as object;
      req.uid = (reqToken as Record<any, any>).uid;
    } catch (e) {
      req.token = {};
      req.uid = "";
      console.error(e);
      res.status(401).send(e);
    }
    next(req, res);
  } else {
    res.status(401).send("missing authentication bearer token");
  }
};

const initializeUserMiddleware = async (
  req: functions.Request,
  res: functions.Response,
  next: Function
) => {
  if (!(await isUserInitialized(req.uid))) {
    await setDefaultList(req.uid);
  }
  next(req, res);
};

interface middleWareConfig {
  method?: string;
  methods?: string[];
  skipAuth?: boolean;
}

const middlewares = (config: middleWareConfig) => {
  return (
    next: (req: functions.Request, res: functions.Response) => unknown
  ) => {
    return (req: functions.Request, res: functions.Response) => {
      const afterMethodCheck = () => {
        cors(req, res, () => {
          if (config.skipAuth) {
            next(req, res);
          } else {
            authMiddleware(req, res, async () => {
              await initializeUserMiddleware(req, res, next);
            });
          }
        });
      };

      if (config.method) {
        allowMethod(config.method)(req, res, afterMethodCheck);
      } else if (config.methods) {
        allowMethods(...config.methods)(req, res, afterMethodCheck);
      }
    };
  };
};

const onRequest =
  (config: middleWareConfig) =>
  (handler: (req: functions.Request, res: functions.Response) => unknown) => {
    return functions.https.onRequest(middlewares(config)(handler));
  };

/**
 * Actual code starts here
 */

export const token = onRequest({ method: "POST", skipAuth: true })(
  async (req, res) => {
    if (!req.query.email) {
      return res.sendStatus(400);
    }
    try {
      const user = await auth.getUserByEmail(req.query.email as string);
      const userToken = jwt.sign(
        {
          uid: user.uid,
        },
        functions.config().jwt.secret,
        {
          expiresIn: "1h",
        }
      );

      return res.send({
        token: userToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
    } catch (e) {
      console.log(e);
      return res.sendStatus(400);
    }
  }
);

export const activity = onRequest({ method: "get" })((req, res) => {
  res.send(activityJson);
});

// do this funky thing to make endpoint named `my-team`
export const my = {
  team: onRequest({ method: "get" })(async (req, res) => {
    res.send(await fetchTeam(req.uid));
  }),
};

export const captured = onRequest({ method: "get" })(async (req, res) => {
  res.send(await fetchCaptured(req.uid));
});

export const capture = onRequest({ method: "post" })(async (req, res) => {
  const validationErrors = validateCapture(req);

  if (validationErrors.length) {
    return res.status(400).send({
      error: validationErrors.join(", "),
    });
  }

  try {
    await newCapture(req.uid, req.body.pokemon);
  } catch (e) {
    if (e.message === "id exists")
      return res.status(400).send({
        error: `pokemon of id=${req.body.pokemon.id} is already captured`,
      });
  }

  return res.send({ success: true });
});

export const release = onRequest({ method: "delete" })(async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ error: "missing id query" });
  }
  const id = Number(req.query.id);

  if (isNaN(id) || !validator.isInt(id + "")) {
    return res.status(400).send("id must be an integer");
  }

  if ([1, 4, 7, 10].includes(id)) {
    return res
      .status(400)
      .send({ error: "cannot release a pokemon that is in team" });
  }

  try {
    await removeCapture(req.uid, id);
  } catch (e) {
    if (e.message === "nothing to delete") {
      return res.status(400).send({ error: "nothing to release" });
    }
  }

  return res.send({ success: true });
});
