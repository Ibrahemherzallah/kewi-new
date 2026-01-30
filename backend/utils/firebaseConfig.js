import admin from "firebase-admin";
import {getStorage} from "firebase-admin/storage";
import fs from "fs";
const serviceAccount = JSON.parse(fs.readFileSync(new URL("../fitrack-efd01-d008a835db52.json", import.meta.url)));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "fitrack-efd01.appspot.com",
});

const bucket = getStorage().bucket();

export {bucket};