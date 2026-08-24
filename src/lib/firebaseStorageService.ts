import {
  ref,
  uploadBytesResumable,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadResult {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

/**
 * Uploads a standard browser File object to Firebase Cloud Storage.
 * Provides real-time progress callbacks and returns the public download URL.
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder: string = "homework_submissions",
  onProgress?: (progressPercent: number) => void
): Promise<UploadResult> {
  const timestamp = Date.now();
  // Sanitize filename to avoid weird character issues in storage paths
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePath = `${folder}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, uniquePath);

  return new Promise((resolve, reject) => {
    try {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || "application/octet-stream"
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(percent);
          }
        },
        async (error) => {
          console.warn("[Firebase Storage] Resumable upload error, attempting direct upload:", error);
          try {
            // Fallback direct upload attempt
            const directSnap = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(directSnap.ref);
            if (onProgress) onProgress(100);
            resolve({
              url: downloadUrl,
              storagePath: uniquePath,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || "application/octet-stream",
              uploadedAt: new Date().toISOString()
            });
          } catch (fallbackError) {
            console.error("[Firebase Storage] Upload failed completely:", fallbackError);
            reject(fallbackError);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              url: downloadUrl,
              storagePath: uniquePath,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || "application/octet-stream",
              uploadedAt: new Date().toISOString()
            });
          } catch (urlError) {
            console.error("[Firebase Storage] Error getting download URL:", urlError);
            reject(urlError);
          }
        }
      );
    } catch (err) {
      console.error("[Firebase Storage] Synchronous error initiating upload:", err);
      reject(err);
    }
  });
}

/**
 * Uploads a Data URL (base64 string) to Firebase Cloud Storage.
 */
export async function uploadDataUrlToFirebaseStorage(
  dataUrl: string,
  fileName: string,
  folder: string = "drawings_and_memos"
): Promise<string> {
  try {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniquePath = `${folder}/${timestamp}_${sanitizedName}`;
    const storageRef = ref(storage, uniquePath);

    const format = dataUrl.startsWith("data:") ? "data_url" : "raw";
    if (format === "data_url") {
      const snap = await uploadString(storageRef, dataUrl, "data_url");
      return await getDownloadURL(snap.ref);
    } else {
      const blob = await (await fetch(dataUrl)).blob();
      const snap = await uploadBytes(storageRef, blob);
      return await getDownloadURL(snap.ref);
    }
  } catch (error) {
    console.warn("[Firebase Storage] Notice uploading data URL:", error);
    // If upload fails, return the dataUrl so preview and functionality are never broken
    return dataUrl;
  }
}

/**
 * Deletes a file from Firebase Storage given its storage path.
 */
export async function deleteFileFromFirebaseStorage(storagePath: string): Promise<void> {
  try {
    if (!storagePath) return;
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn("[Firebase Storage] Notice deleting file:", error);
  }
}
