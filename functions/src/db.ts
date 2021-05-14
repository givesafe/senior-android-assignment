import admin from "firebase-admin";
import defaultCaptured from "../data/defaultCaptured";

const db = admin.firestore();

const uidCapturedRef = (uid: string) =>
  db.collection("users").doc(uid).collection("captured");

export const isUserInitialized = (uid: string) => {
  return uidCapturedRef(uid)
    .limit(1)
    .get()
    .then((snap) => {
      return !snap.empty;
    });
};

export const fetchTeam = async (uid: string) => {
  const teamSnap = await uidCapturedRef(uid)
    .where("id", "in", [1, 4, 7, 10])
    .get();

  return teamSnap.docs
    .map((d) => d.data())
    .map((d) => ({ ...d, captured_at: d.captured_at.toDate().toISOString() }));
};

export const fetchCaptured = (uid: string) =>
  uidCapturedRef(uid)
    .get()
    .then((querySnapshot) => {
      return querySnapshot.docs.map((d) => d.data());
    })
    .then((docs) => {
      return docs.map((d) => ({
        ...d,
        captured_at: d.captured_at.toDate().toISOString(),
      }));
    });

export const setDefaultList = async (uid: string) => {
  // @ts-expect-error
  const capturePromises = defaultCaptured.map((each) => newCapture(uid, each));

  await Promise.all(capturePromises);
};

interface newCaptureData {
  id: number;
  name: string;
  // this should be a utc string
  captured_at?: string;
  lat: number;
  long: number;
}

export const newCapture = async (uid: string, data: newCaptureData) => {
  const docRef = uidCapturedRef(uid).doc(data.id + "");

  const doc = await docRef.get();

  if (doc.exists) {
    throw new Error("id exists");
  }

  await docRef.set({
    id: data.id,
    name: data.name,
    captured_at: data.captured_at
      ? admin.firestore.Timestamp.fromDate(new Date(data.captured_at))
      : admin.firestore.Timestamp.now(),
    captured_lat_at: data.lat,
    captured_long_at: data.long,
  });
};

export const removeCapture = async (uid: string, id: number) => {
  const capturedSnap = await uidCapturedRef(uid).where("id", "==", id).get();

  if (capturedSnap.empty) {
    throw new Error("nothing to delete");
  }

  const deletePromises = capturedSnap.docs.map((doc) => doc.ref.delete());

  return Promise.all(deletePromises);
};
