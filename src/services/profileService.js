import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

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
    const profileRef = doc(db, "profiles", uid);
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
