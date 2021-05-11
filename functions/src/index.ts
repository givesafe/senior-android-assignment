import * as functions from "firebase-functions";
import admin from "firebase-admin";
import activityJson from "../data/activity.json";

const cors = require("cors")({ origin: true });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const allowMethod = (method: string) => {
  return (req: functions.Request, res: functions.Response, next: Function) => {
    if (!req.method.match(new RegExp(method, "i"))) {
      res.sendStatus(404);
    } else {
      next();
    }
  };
};

export const login = functions.https.onRequest((req, res) => {
  return allowMethod("post")(req, res, () => {
    cors(req, res, () => {
      if (!req.query.email) {
        return;
      }
      auth.getUserByEmail(req.query.email as string);
    });
  });
});

export const activity = functions.https.onRequest((req, res) => {
  return allowMethod("get")(req, res, () =>
    cors(req, res, () => {
      res.send(activityJson);
    })
  );
});

// do this funky thing to make endpoint named `my-team`
export const my = {
  team: functions.https.onRequest((req, res) => {
    return allowMethod("get")(req, res, () => {
      cors(req, res, () => {
        res.send("test");
      });
    });
  }),
};

export const captured = functions.https.onRequest((req, res) => {
  return allowMethod("get")(req, res, () => {
    cors(req, res, async () => {
      await db.collection("users").doc("1").set({ captured: Date.now() });
      console.log((await db.collection("users").doc("1").get()).data());
      res.send("test");
    });
  });
});

export const capture = functions.https.onRequest((req, res) => {
  return allowMethod("post")(req, res, () =>
    cors(req, res, () => {
      res.send({ success: true });
    })
  );
});
