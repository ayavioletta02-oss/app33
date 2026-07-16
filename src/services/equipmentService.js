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

const isPlainObject = (value) => (
  Object.prototype.toString.call(value) === "[object Object]"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const removeUndefinedValues = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedValues(item))
      .filter((item) => item !== undefined);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((cleaned, [key, item]) => {
    if (item === undefined) {
      return cleaned;
    }

    const cleanedValue = removeUndefinedValues(item);

    if (cleanedValue !== undefined) {
      cleaned[key] = cleanedValue;
    }

    return cleaned;
  }, {});
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
    const payload = removeUndefinedValues({
      name: equipmentData.name ?? "",
      type: equipmentData.type ?? "",
      serial: equipmentData.serial ?? "",
      status: normalizeEquipmentStatus(equipmentData.status),
      model: equipmentData.model ?? "",
      registration: equipmentData.registration ?? "",
      lastMaintenance: equipmentData.lastMaintenance ?? "",
      notes: equipmentData.notes ?? "",
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
    const { createdBy, createdAt, id, firestoreId, ...allowedUpdates } = updates;
    const payload = removeUndefinedValues({
      ...allowedUpdates,
      status: updates.status === undefined ? undefined : normalizeEquipmentStatus(updates.status),
      updatedAt: serverTimestamp()
    });

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
