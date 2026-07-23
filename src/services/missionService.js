import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  createValidationError,
  removeUndefinedFields,
  validateMissionPayload
} from "../utils/validation";

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

const normalizeMissionStatus = (status) => {
  if (status === undefined || status === null || status === "") {
    return DEFAULT_STATUS;
  }

  const normalized = typeof status === "string"
    ? status.trim().toLowerCase()
    : "";

  if (!STATUS_ALIASES[normalized]) {
    throw createValidationError("Statut de mission invalide.", {
      status: "Le statut de mission selectionne n'est pas autorise."
    });
  }

  return STATUS_ALIASES[normalized];
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
    const validation = validateMissionPayload(missionData);

    if (!validation.isValid) {
      throw createValidationError("Donnees de mission invalides.", validation.errors);
    }

    const cleanMission = validation.normalizedData;
    const missionPayload = removeUndefinedFields({
      number: missionData.number ?? Date.now(),
      name: cleanMission.client,
      clientName: cleanMission.client,
      missionType: cleanMission.missionType,
      zone: cleanMission.zone,
      date: cleanMission.date,
      expiryDate: cleanMission.expiryDate,
      status: normalizeMissionStatus(missionData.status),
      assignedPilotId: cleanMission.assignedPilotId,
      equipment: cleanMission.equipment,
      equipmentIds: cleanMission.equipmentIds,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      location: {
        region: cleanMission.region,
        province: cleanMission.province,
        commune: cleanMission.commune,
        airportCode: cleanMission.airport,
        zoneLabel: cleanMission.zone
      },
      flight: {
        altitude: cleanMission.altitude,
        duration: cleanMission.duration,
        aircraftType: cleanMission.aircraftType,
        drone: cleanMission.drone
      },
      zonePoints: cleanMission.zonePoints,
      weather: cleanMission.weather
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
