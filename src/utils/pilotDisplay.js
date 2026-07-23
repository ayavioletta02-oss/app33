export const UNASSIGNED_PILOT_LABEL = "Pilote non affecte";

const asString = (value) => (typeof value === "string" ? value.trim() : "");

export const getPilotDisplayName = (pilot) => {
  if (!pilot) {
    return "";
  }

  return (
    asString(pilot.displayName)
    || asString(pilot.email)
    || "Profil pilote sans nom"
  );
};

export const buildPilotsByUid = (pilots = []) => (
  pilots.reduce((byUid, pilot) => {
    const uid = asString(pilot?.uid);

    if (uid && !byUid.has(uid)) {
      byUid.set(uid, pilot);
    }

    return byUid;
  }, new Map())
);

export const resolveMissionPilotName = (mission = {}, pilots = []) => {
  const assignedPilotId = asString(mission.assignedPilotId);
  const pilotsByUid = buildPilotsByUid(pilots);

  if (assignedPilotId) {
    const pilotName = getPilotDisplayName(pilotsByUid.get(assignedPilotId));

    if (pilotName) {
      return pilotName;
    }
  }

  return asString(mission.pilot) || UNASSIGNED_PILOT_LABEL;
};
