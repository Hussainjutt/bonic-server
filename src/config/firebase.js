import admin from "firebase-admin";
import serviceAccount from "../json/firebase.json" assert { type: "json" };

export const storage = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://bonic-70afd.appspot.com",
});
