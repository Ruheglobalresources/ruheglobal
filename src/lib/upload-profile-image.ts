"use client";
// src/lib/upload-profile-image.ts
// Profile photo upload: straight from the browser to Firebase Storage, same approach as
// every other image in the app. The path starts with profile/<userId>/, which is exactly
// what the updateProfilePhoto server action checks before it saves the URL.
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > MAX_BYTES) throw new Error("The image must be 5 MB or smaller");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageRef = ref(storage, `profile/${userId}/${crypto.randomUUID()}-${safeName}`);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve()
    );
  });

  return getDownloadURL(task.snapshot.ref);
}