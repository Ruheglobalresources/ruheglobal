"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";


export async function uploadSalonImage(file: File, folder: "categories" | "services") {
  const path = `salon/${folder}/${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}