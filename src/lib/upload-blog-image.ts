"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadBlogImage(file: File, folder: "covers" | "content" = "covers") {
  const path = `blog/${folder}/${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}