import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const MISSIONS_COLLECTION = "missions";
const DEFAULT_STATUS = "pending";
const STATUS_ALIASES = {
  active: "approved",
  approved: "approved",
  approuvee: "approved",
  pending: "pending",
  "en attente": "pending",
  en_attente: "pending",
  expired: "expired",
  expiree: "expired",
  cancelled: "cancelled",
  canceled: "cancelled"
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

const normalizeMissionStatus = (status) => {
  const normalized = typeof status === "string"
    ? status.trim().toLowerCase()
    : DEFAULT_STATUS;

  return STATUS_ALIASES[normalized] || DEFAULT_STATUS;
};

export async function getAllMissions() {
  if (!db) {
    const error = new Error("Firestore n'est pas configure.");
    error.code = "firebase/not-configured";
    throw error;
  }

  try {
    const missionsRef = collection(db, MISSIONS_COLLECTION);
    const snapshot = await getDocs(missionsRef);

    return snapshot.docs.map((missionDoc) => {
      const data = missionDoc.data();

      return {
        ...data,
        firestoreId: missionDoc.id,
        id: data.id ?? data.number ?? missionDoc.id,
        name: data.name ?? data.clientName ?? "Mission sans client",
        type: data.type ?? data.missionType ?? "",
        zone: data.zone ?? data.location?.zoneLabel ?? "",
        pilot: data.pilot ?? "",
        assignedPilotId: data.assignedPilotId ?? null
      };
    });
  } catch (error) {
    console.error("[Mission] Erreur lecture Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}

export async function createMission(missionData = {}, currentUser = null) {
  if (!db) {
    const error = new Error("Firestore n'est pas configure.");
    error.code = "firebase/not-configured";
    throw error;
  }

  if (!currentUser?.uid) {
    const error = new Error("Utilisateur connecte requis pour creer une mission.");
    error.code = "auth/missing-current-user";
    throw error;
  }

  try {
    const missionsRef = collection(db, MISSIONS_COLLECTION);
    const assignedPilotId = typeof missionData.assignedPilotId === "string" && missionData.assignedPilotId.trim()
      ? missionData.assignedPilotId.trim()
      : null;
    const missionPayload = removeUndefinedValues({
      number: missionData.number ?? Date.now(),
      name: missionData.name ?? missionData.clientName ?? "Mission sans client",
      clientName: missionData.clientName ?? missionData.name ?? "",
      missionType: missionData.missionType ?? missionData.type ?? "",
      zone: missionData.zone ?? missionData.location?.zoneLabel ?? "",
      date: missionData.date ?? "",
      expiryDate: missionData.expiryDate ?? "",
      status: normalizeMissionStatus(missionData.status),
      pilot: missionData.pilot ?? "",
      assignedPilotId,
      equipment: missionData.equipment ?? "",
      equipmentIds: Array.isArray(missionData.equipmentIds) ? missionData.equipmentIds : [],
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      location: {
        region: missionData.location?.region,
        province: missionData.location?.province,
        commune: missionData.location?.commune,
        airportCode: missionData.location?.airportCode,
        zoneLabel: missionData.location?.zoneLabel
      },
      flight: {
        altitude: missionData.flight?.altitude,
        duration: missionData.flight?.duration,
        aircraftType: missionData.flight?.aircraftType,
        drone: missionData.flight?.drone
      },
      zonePoints: Array.isArray(missionData.zonePoints) ? missionData.zonePoints : [],
      weather: missionData.weather ?? null
    });

    const missionRef = await addDoc(missionsRef, missionPayload);
    return missionRef.id;
  } catch (error) {
    console.error("[Mission] Erreur creation Firestore", {
      code: error?.code,
      message: error?.message
    });
    throw error;
  }
}
