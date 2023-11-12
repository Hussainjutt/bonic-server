import admin from "firebase-admin";
import serviceAccount from "../json/firebase.json";

export const storage = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: "gs://bonic-70afd.appspot.com",
});
