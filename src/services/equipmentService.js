import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  createValidationError,
  removeUndefinedFields,
  validateEquipmentForm
} from "../utils/validation";

const EQUIPMENT_COLLECTION = "equipment";
const DEFAULT_STATUS = "available";
const STATUS_ALIASES = {
  available: "available",
  disponible: "available",
  in_mission: "in_mission",
  mission: "in_mission",
  maintenance: "maintenance",
  out_of_service: "out_of_service",
  hors_service: "out_of_service"
};

const normalizeEquipmentStatus = (status) => {
  const normalized = typeof status === "string"
    ? status.trim().toLowerCase()
    : DEFAULT_STATUS;

  return STATUS_ALIASES[normalized] || DEFAULT_STATUS;
};

const assertFirestoreReady = () => {
  if (!db) {
    const error = new Error("Firestore n'est pas configure.");
    error.code = "firebase/not-configured";
    throw error;
  }
};

const assertAdminUser = (currentUser) => {
  if (!currentUser?.uid) {
    const error = new Error("Utilisateur connecte requis.");
    error.code = "auth/missing-current-user";
    throw error;
  }

  if (currentUser.role !== "admin") {
    const error = new Error("Operation reservee aux administrateurs.");
    error.code = "permission-denied";
    throw error;
  }
};

export async function getAllEquipment() {
  assertFirestoreReady();

  try {
    const equipmentRef = collection(db, EQUIPMENT_COLLECTION);
    const snapshot = await getDocs(equipmentRef);

    return snapshot.docs.map((equipmentDoc) => {
      const data = equipmentDoc.data();

      return {
        ...data,
        firestoreId: equipmentDoc.id,
        id: equipmentDoc.id,
        status: normalizeEquipmentStatus(data.status)
      };
    });
  } catch (error) {
    console.error("[Equipment] Erreur lecture Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}

export async function createEquipment(equipmentData = {}, currentUser = null) {
  assertFirestoreReady();
  assertAdminUser(currentUser);

  try {
    const equipmentRef = collection(db, EQUIPMENT_COLLECTION);
    const validation = validateEquipmentForm(equipmentData);

    if (!validation.isValid) {
      throw createValidationError("Donnees materiel invalides.", validation.errors);
    }

    const cleanEquipment = validation.normalizedData;
    const payload = removeUndefinedFields({
      name: cleanEquipment.name,
      type: cleanEquipment.type,
      serial: cleanEquipment.serial,
      status: cleanEquipment.status,
      model: cleanEquipment.model,
      registration: cleanEquipment.registration,
      lastMaintenance: cleanEquipment.lastMaintenance,
      notes: cleanEquipment.notes,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const createdRef = await addDoc(equipmentRef, payload);
    return createdRef.id;
  } catch (error) {
    console.error("[Equipment] Erreur creation Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}

export async function updateEquipment(equipmentId, updates = {}, currentUser = null) {
  assertFirestoreReady();
  assertAdminUser(currentUser);

  if (!equipmentId) {
    const error = new Error("Identifiant materiel requis.");
    error.code = "equipment/missing-id";
    throw error;
  }

  try {
    const validation = validateEquipmentForm(updates, { partial: true });

    if (!validation.isValid) {
      throw createValidationError("Donnees materiel invalides.", validation.errors);
    }

    const cleanUpdates = validation.normalizedData;
    const payload = removeUndefinedFields({
      name: cleanUpdates.name,
      type: cleanUpdates.type,
      serial: cleanUpdates.serial,
      status: cleanUpdates.status,
      model: cleanUpdates.model,
      registration: cleanUpdates.registration,
      lastMaintenance: cleanUpdates.lastMaintenance,
      notes: cleanUpdates.notes,
      updatedAt: serverTimestamp()
    });

    if (Object.keys(payload).length === 1) {
      throw createValidationError("Aucune modification materiel valide.", {
        updates: "Aucun champ modifiable valide n'a ete fourni."
      });
    }

    await updateDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId), payload);
  } catch (error) {
    console.error("[Equipment] Erreur mise a jour Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}

export async function deleteEquipment(equipmentId, currentUser = null) {
  assertFirestoreReady();
  assertAdminUser(currentUser);

  if (!equipmentId) {
    const error = new Error("Identifiant materiel requis.");
    error.code = "equipment/missing-id";
    throw error;
  }

  try {
    await deleteDoc(doc(db, EQUIPMENT_COLLECTION, equipmentId));
  } catch (error) {
    console.error("[Equipment] Erreur suppression Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}
