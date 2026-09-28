"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadSchoolImage(
  file: File,
  folder: "covers" | "gallery" | "courses" | "logos" = "covers"
) {
  const path = `schools/${folder}/${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}