import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  DocumentData
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  Profile,
  Booking,
  Payment,
  HomeworkAssignment,
  HomeworkSubmission,
  VideoLessonRequest,
  Testimonial,
  Announcement,
  ContactMessage,
  DeepFocusSession,
  ArcadeScore,
  ArcadeAchievement,
  AMHNotification,
  Subject,
  LessonPackage,
  FAQ,
  ResourceLibraryItem,
  Subscription
} from "../types";

// Collection Names
export const COLLECTIONS = {
  PROFILES: "profiles",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  HOMEWORK_ASSIGNMENTS: "homework_assignments",
  HOMEWORK_SUBMISSIONS: "homework_submissions",
  VIDEO_REQUESTS: "video_requests",
  TESTIMONIALS: "testimonials",
  ANNOUNCEMENTS: "announcements",
  CONTACT_MESSAGES: "contact_messages",
  DEEP_FOCUS_SESSIONS: "deep_focus_sessions",
  ARCADE_SCORES: "arcade_scores",
  ARCADE_ACHIEVEMENTS: "arcade_achievements",
  NOTIFICATIONS: "notifications",
  SUBJECTS: "subjects",
  PACKAGES: "packages",
  FAQS: "faqs",
  RESOURCES: "resources",
  SUBSCRIPTIONS: "subscriptions",
  TUTOR_AVAILABILITY: "tutor_availability"
} as const;

// Helper to remove undefined fields which Firestore rejects
const cleanDataForFirestore = <T extends Record<string, any>>(data: T): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (val !== undefined) {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

// Generic Firestore CRUD helper
export const firestoreDB = {
  // Get all documents in a collection
  async getAll<T extends { id: string }>(collectionName: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as T[];
    } catch (error) {
      console.warn(`[Firestore] Error reading collection "${collectionName}":`, error);
      return [];
    }
  },

  // Get single document by ID
  async getById<T extends { id: string }>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Error reading document "${collectionName}/${id}":`, error);
      return null;
    }
  },

  // Set / Save document (upsert)
  async set<T extends { id: string }>(collectionName: string, data: T): Promise<T> {
    try {
      const docRef = doc(db, collectionName, data.id);
      const cleaned = cleanDataForFirestore({
        ...data,
        _updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, cleaned, { merge: true });
      return data;
    } catch (error) {
      console.error(`[Firestore] Error writing to "${collectionName}/${data.id}":`, error);
      return data;
    }
  },

  // Update specific fields of a document
  async update<T extends { id: string }>(collectionName: string, id: string, partial: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      const cleaned = cleanDataForFirestore({
        ...partial,
        _updatedAt: new Date().toISOString()
      });
      await updateDoc(docRef, cleaned);
    } catch (error) {
      console.error(`[Firestore] Error updating "${collectionName}/${id}":`, error);
    }
  },

  // Delete document
  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[Firestore] Error deleting "${collectionName}/${id}":`, error);
    }
  },

  // Real-time listener for a collection
  subscribe<T extends { id: string }>(
    collectionName: string,
    callback: (items: T[]) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const colRef = collection(db, collectionName);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as T[];
          callback(items);
        },
        (error) => {
          console.warn(`[Firestore] Subscription error on "${collectionName}":`, error);
          if (onError) onError(error);
        }
      );
    } catch (err: any) {
      console.warn(`[Firestore] Could not start subscription on "${collectionName}":`, err);
      return () => {};
    }
  },

  // Batch sync initial collection data from local arrays if Firestore collection is empty
  async seedCollectionIfEmpty<T extends { id: string }>(collectionName: string, initialItems: T[]): Promise<void> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty && initialItems.length > 0) {
        console.log(`[Firestore] Seeding ${initialItems.length} records into "${collectionName}"...`);
        const batch = writeBatch(db);
        initialItems.forEach((item) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, cleanDataForFirestore(item));
        });
        await batch.commit();
        console.log(`[Firestore] Successfully seeded "${collectionName}".`);
      }
    } catch (error) {
      console.warn(`[Firestore] Seeding skipped/failed for "${collectionName}":`, error);
    }
  }
};

// Initializer to sync and bootstrap Firestore with initial AMH datasets
export const initializeFirebaseBackend = async () => {
  try {
    console.log("⚡ [Firebase Backend] Initializing Firestore connection...");

    // Check if Firestore is reachable
    const profilesSnapshot = await getDocs(collection(db, COLLECTIONS.PROFILES));
    console.log(`⚡ [Firebase Backend] Connected to Firestore (${profilesSnapshot.size} user profiles found)`);

    // Broadcast connection event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("firebaseBackendReady", { detail: { connected: true } }));
    }
  } catch (error) {
    console.warn("⚡ [Firebase Backend] Firestore initialization notice:", error);
  }
};
