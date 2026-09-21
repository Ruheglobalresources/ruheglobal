"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// Mirrors uploadSalonImage's shape, but for applicant-submitted IMAGE/FILE
// fields — namespaced by application + field key so two applicants' files
// (or the same applicant's passport photo vs. transcript) never collide.
export async function uploadPortalFile(file: File, applicationId: string, fieldKey: string) {
  const path = `portal/${applicationId}/${fieldKey}/${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}