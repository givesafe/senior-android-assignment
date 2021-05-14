import * as functions from "firebase-functions";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

// tslint:disable-next-line
import "./initialize";
import activityJson from "../data/activity.json";
import { fetchCaptured, fetchTeam, newCapture, removeCapture } from "./db";
import { validateCapture } from "./validations";
import validator from "validator";
import { middleWareConfig, middlewares } from "./middleware";

export const cors = require("cors")({ origin: true });

/**
 * type merging
 */

// auth constant
const auth = admin.auth();

const onRequest =
  (config: middleWareConfig) =>
  (handler: (req: functions.Request, res: functions.Response) => unknown) => {
    return functions.https.onRequest(middlewares(config)(handler));
  };

export const token = onRequest({ method: "POST", skipAuth: true })(
  async (req, res) => {
    if (!validator.isEmail(req.query.email as string)) {
      res.sendBadRequestStatus("email query must be a valid email");
      return;
    }

    let user;
    try {
      user = await auth.getUserByEmail(req.query.email as string);
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        res.sendBadRequestStatus("user not found");
        return;
      }
      console.error(e);
      return res.sendStatus(500);
    }

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
    res.sendBadRequestStatus(validationErrors.join(", "));
    return;
  }

  try {
    await newCapture(req.uid, req.body.pokemon);
  } catch (e) {
    if (e.message === "id exists") {
      res.sendBadRequestStatus(
        `pokemon of id=${req.body.pokemon.id} is already captured`
      );
      return;
    }
  }

  return res.send({ success: true });
});

export const release = onRequest({ method: "delete" })(async (req, res) => {
  if (!req.query.id) {
    res.sendBadRequestStatus("missing id query");
    return;
  }
  const id = Number(req.query.id);

  if (isNaN(id) || !validator.isInt(id + "")) {
    res.sendBadRequestStatus("id must be an integer");
    return;
  }

  if ([1, 4, 7, 10].includes(id)) {
    res.sendBadRequestStatus("cannot release a pokemon that is in team");
    return;
  }

  try {
    await removeCapture(req.uid, id);
  } catch (e) {
    if (e.message === "nothing to delete") {
      res.sendBadRequestStatus("nothing to release");
      return;
    }
  }

  return res.send({ success: true });
});
