import * as functions from "firebase-functions";
import jwt from "jsonwebtoken";
import { isUserInitialized, setDefaultList } from "./db";
import { cors } from "./index";

type NextFn = () => unknown;

type MiddlewareFn = (
  req: functions.Request,
  res: functions.Response,
  next: NextFn
) => unknown;

/**
 * Middleware stuff
 */
const allowMethod = (methods: string | string[]): MiddlewareFn => {
  let methodsArr: string[] = [];
  if (typeof methods === "string") methodsArr = [methods];
  else methodsArr = methods;

  return (req: functions.Request, res: functions.Response, next: Function) => {
    if (methodsArr.some((m) => req.method.match(new RegExp(m, "i")))) {
      next();
    } else {
      res.sendStatus(404);
    }
  };
};

declare module "firebase-functions" {
  export interface Request {
    token: Record<any, any>;
    uid: string;
  }
}

const authMiddleware: MiddlewareFn = (req, res, next) => {
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
    next();
  } else {
    res.status(401).send("missing authentication bearer token");
  }
};

const initializeUserMiddleware: MiddlewareFn = async (req, res, next) => {
  if (!req.uid) return next();

  if (!(await isUserInitialized(req.uid))) {
    await setDefaultList(req.uid);
  }
  next();
};

declare module "firebase-functions" {
  export interface Response {
    sendBadRequestStatus: (error: string) => void;
  }
}

const badRequestHelperMiddleware: MiddlewareFn = (req, res, next) => {
  res.sendBadRequestStatus = (error) => res.status(400).send({ error });
  next();
};

const handleMiddleware = (
  fn: MiddlewareFn,
  req: functions.Request,
  res: functions.Response
) =>
  new Promise<void>((resolve, reject) => {
    try {
      fn(req, res, () => {
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });

const handleMiddlewares = (...middlewareFns: MiddlewareFn[]) => {
  return async (req: functions.Request, res: functions.Response) => {
    for (const middlewareFn of middlewareFns) {
      await handleMiddleware(middlewareFn, req, res);

      if (res.headersSent) {
        return;
      }
    }
  };
};

export interface middleWareConfig {
  method: string | string[];
  skipAuth?: boolean;
}

export const middlewares = (config: middleWareConfig) => {
  return (
    last: (req: functions.Request, res: functions.Response) => unknown
  ) => {
    return async (req: functions.Request, res: functions.Response) => {
      if (config.skipAuth) {
        await handleMiddlewares(
          cors,
          badRequestHelperMiddleware,
          allowMethod(config.method),
          initializeUserMiddleware
        )(req, res);
      } else {
        await handleMiddlewares(
          cors,
          badRequestHelperMiddleware,
          authMiddleware,
          allowMethod(config.method),
          initializeUserMiddleware
        )(req, res);
      }

      if (!res.headersSent) last(req, res);
    };
  };
};
