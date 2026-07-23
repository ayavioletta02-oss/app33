import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const PROFILES_COLLECTION = "profiles";

const normalizeProfile = (profileDoc) => {
  const data = profileDoc.data() || {};
  const uid = typeof data.uid === "string" && data.uid.trim() ? data.uid : profileDoc.id;

  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    displayName: typeof data.displayName === "string" ? data.displayName : "",
    role: typeof data.role === "string" ? data.role.trim().toLowerCase() : "",
    disabled: data.disabled === true
  };
};

export async function getProfile(uid) {
  if (!uid) {
    console.error("[Profile] UID manquant pour le chargement du profil");
    return null;
  }

  if (!db) {
    console.error("[Profile] Firestore n'est pas configure");
    return null;
  }

  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    return profileSnap.data();
  } catch (error) {
    console.error("[Profile] Erreur lecture Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}

export async function getActivePilots() {
  if (!db) {
    const error = new Error("Firestore n'est pas configure.");
    error.code = "firebase/not-configured";
    throw error;
  }

  try {
    const profilesRef = collection(db, PROFILES_COLLECTION);
    const activePilotsQuery = query(
      profilesRef,
      where("role", "==", "pilot"),
      where("disabled", "==", false)
    );
    const snapshot = await getDocs(activePilotsQuery);

    return snapshot.docs
      .map(normalizeProfile)
      .filter((profile) => profile.role === "pilot" && profile.disabled !== true)
      .sort((a, b) => {
        const labelA = a.displayName || a.email || a.uid;
        const labelB = b.displayName || b.email || b.uid;
        return labelA.localeCompare(labelB, "fr", { sensitivity: "base" });
      });
  } catch (error) {
    console.error("[Profile] Erreur lecture des pilotes actifs", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}
