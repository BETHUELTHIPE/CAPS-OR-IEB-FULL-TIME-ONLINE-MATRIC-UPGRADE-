import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { firestoreDB, COLLECTIONS } from "./firestoreService";
import { Profile } from "../types";
import { getFromDB, saveToDB, generateId } from "./db";

/**
 * Format Firebase Auth error codes into friendly user notifications
 */
export function getFriendlyAuthErrorMessage(errorCode: string, defaultMessage?: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact Amaris support.";
    case "auth/user-not-found":
      return "No account found with this email address. Please check your spelling or register a new account.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again or use 'Forgot Password'.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters with letters and numbers.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled. Please sign in with Google or contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Access to this account has been temporarily disabled. Please reset your password or try again later.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    default:
      return defaultMessage || "Authentication failed. Please check your credentials.";
  }
}

/**
 * Register a new user with Email and Password in Firebase Auth,
 * and persist their full student/tutor profile in Firestore and local storage.
 */
export async function firebaseSignUpWithEmail(
  email: string,
  password: string,
  profileData: Partial<Profile>
): Promise<Profile> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Create Firebase Auth user
  let firebaseUser: FirebaseUser | null = null;
  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    firebaseUser = credential.user;
    
    // Update display name
    const fullName = `${profileData.first_name || ""} ${profileData.surname || ""}`.trim();
    if (fullName && firebaseUser) {
      await updateFirebaseProfile(firebaseUser, {
        displayName: fullName
      });
    }
  } catch (error: any) {
    console.warn("[Firebase Auth] SignUp error:", error?.code, error?.message);
    throw new Error(getFriendlyAuthErrorMessage(error?.code, error?.message));
  }

  // 2. Build complete Amaris Profile
  const isSuper = normalizedEmail === "bethuelmoukangwe8@gmail.com";
  const userProfile: Profile = {
    id: firebaseUser ? `usr-${firebaseUser.uid}` : generateId("usr"),
    first_name: profileData.first_name || "Learner",
    surname: profileData.surname || "Candidate",
    email: normalizedEmail,
    phone: profileData.phone || "071 415 6665",
    whatsapp_number: profileData.whatsapp_number || profileData.phone || "071 415 6665",
    province: profileData.province || "Gauteng",
    school: profileData.school || "Amaris Online Academy",
    grade: profileData.grade || "Grade 12 CAPS",
    parent_name: profileData.parent_name || "",
    parent_phone: profileData.parent_phone || "",
    role: isSuper ? "admin" : (profileData.role || "student"),
    is_super_admin: isSuper,
    avatar_url: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.first_name || "User")}&background=1e3a8a&color=fff`,
    specialization: profileData.specialization,
    bio: profileData.bio
  };

  // 3. Persist into Firestore & Local Cache
  try {
    await firestoreDB.set(COLLECTIONS.PROFILES, userProfile);
  } catch (dbErr) {
    console.warn("[Firestore] Notice saving profile to Firestore:", dbErr);
  }

  const currentProfiles = getFromDB<Profile>("amh_profiles");
  const idx = currentProfiles.findIndex(p => p.email.toLowerCase() === normalizedEmail);
  if (idx >= 0) {
    currentProfiles[idx] = userProfile;
  } else {
    currentProfiles.push(userProfile);
  }
  saveToDB("amh_profiles", currentProfiles);
  localStorage.setItem("amh_current_user", JSON.stringify(userProfile));

  return userProfile;
}

/**
 * Sign in an existing user with Email and Password via Firebase Auth,
 * fetching their associated Profile from Firestore or building from auth state.
 */
export async function firebaseSignInWithEmail(
  email: string,
  password: string
): Promise<Profile> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Firebase Auth Sign-in
  let firebaseUser: FirebaseUser | null = null;
  try {
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    firebaseUser = credential.user;
  } catch (error: any) {
    console.warn("[Firebase Auth] SignIn error:", error?.code, error?.message);
    throw new Error(getFriendlyAuthErrorMessage(error?.code, error?.message));
  }

  // 2. Fetch or retrieve profile from Firestore / Local Storage
  const isSuper = normalizedEmail === "bethuelmoukangwe8@gmail.com";
  let profile: Profile | null = null;

  try {
    // Try to get from Firestore by ID or by scanning profiles
    if (firebaseUser) {
      profile = await firestoreDB.getById<Profile>(COLLECTIONS.PROFILES, `usr-${firebaseUser.uid}`);
    }
    if (!profile) {
      const allCloudProfiles = await firestoreDB.getAll<Profile>(COLLECTIONS.PROFILES);
      profile = allCloudProfiles.find(p => p.email.toLowerCase() === normalizedEmail) || null;
    }
  } catch (err) {
    console.warn("[Firestore] Notice fetching profile:", err);
  }

  if (!profile) {
    // Fallback to local profile cache
    const localProfiles = getFromDB<Profile>("amh_profiles");
    profile = localProfiles.find(p => p.email.toLowerCase() === normalizedEmail) || null;
  }

  if (!profile) {
    // Construct profile from Firebase User metadata
    const displayName = firebaseUser?.displayName || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || normalizedEmail.split("@")[0];
    const surname = nameParts.slice(1).join(" ") || "Learner";

    profile = {
      id: firebaseUser ? `usr-${firebaseUser.uid}` : generateId("usr"),
      first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      surname: surname,
      email: normalizedEmail,
      phone: "071 415 6665",
      whatsapp_number: "071 415 6665",
      province: "Gauteng",
      school: "Amaris Online Academy",
      grade: "Grade 12 CAPS",
      parent_name: "Parent / Sponsor",
      parent_phone: "071 415 6665",
      role: isSuper ? "admin" : "student",
      is_super_admin: isSuper,
      avatar_url: firebaseUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=1e3a8a&color=fff`
    };

    // Save to Firestore
    firestoreDB.set(COLLECTIONS.PROFILES, profile).catch(e => console.warn(e));
  }

  // Ensure current user is saved to storage
  const currentProfiles = getFromDB<Profile>("amh_profiles");
  const idx = currentProfiles.findIndex(p => p.email.toLowerCase() === normalizedEmail);
  if (idx >= 0) {
    currentProfiles[idx] = profile;
  } else {
    currentProfiles.push(profile);
  }
  saveToDB("amh_profiles", currentProfiles);
  localStorage.setItem("amh_current_user", JSON.stringify(profile));

  return profile;
}

/**
 * Sign out of Firebase Auth and clear local user session.
 */
export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("[Firebase Auth] Notice during signOut:", error);
  }
  localStorage.removeItem("amh_current_user");
}

/**
 * Trigger Firebase Auth password reset email.
 */
export async function firebaseSendPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, normalized);
  } catch (error: any) {
    console.warn("[Firebase Auth] Password reset error:", error?.code, error?.message);
    throw new Error(getFriendlyAuthErrorMessage(error?.code, error?.message));
  }
}
