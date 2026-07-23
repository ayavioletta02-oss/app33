export const MISSION_TYPES = [
  "Prise de vues aériennes (Photos / Vidéos)",
  "Topographie & Photogrammétrie",
  "Inspection technique d'ouvrages d'art",
  "Surveillance de chantiers & Infrastructures",
  "Agriculture de précision",
  "Thermographie aérienne"
];

export const MISSION_AIRCRAFT_TYPES = ["Drone", "Avion"];

export const MISSION_LIMITS = {
  client: 120,
  missionType: 120,
  location: 100,
  airportCode: 20,
  aircraftType: 20,
  assignedPilotId: 128,
  equipmentId: 128,
  equipmentIdsMax: 10,
  equipmentLabel: 120,
  zoneLabel: 250,
  zonePointsMax: 100,
  altitudeMin: 0,
  altitudeMax: 1000,
  durationMin: 1,
  durationMax: 1440,
  weatherCondition: 120
};

export const EQUIPMENT_TYPES = ["camera", "aircraft", "drone", "accessory"];
export const EQUIPMENT_STATUSES = ["available", "in_mission", "maintenance", "out_of_service"];

export const EQUIPMENT_LIMITS = {
  id: 128,
  name: 120,
  type: 40,
  serial: 100,
  status: 40,
  model: 100,
  registration: 100,
  notes: 1000
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

const isPlainObject = (value) => (
  Object.prototype.toString.call(value) === "[object Object]"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const validationResult = (value, error = "") => ({ value, error });

const addError = (errors, field, error) => {
  if (error && !errors[field]) {
    errors[field] = error;
  }
};

export const createValidationError = (message, errors = {}) => {
  const error = new Error(message);
  error.code = "validation/invalid-data";
  error.validationErrors = errors;
  return error;
};

export const normalizeText = (value, maxLength, label = "Ce champ") => {
  if (typeof value !== "string") {
    return validationResult("", `${label} doit etre une chaine de caracteres.`);
  }

  const text = value.trim();

  if (!text) {
    return validationResult("", `${label} est obligatoire.`);
  }

  if (text.length > maxLength) {
    return validationResult("", `${label} ne doit pas depasser ${maxLength} caracteres.`);
  }

  return validationResult(text);
};

export const normalizeOptionalText = (value, maxLength, label = "Ce champ") => {
  if (value === null || value === undefined || value === "") {
    return validationResult(null);
  }

  if (typeof value !== "string") {
    return validationResult(null, `${label} doit etre une chaine de caracteres.`);
  }

  const text = value.trim();

  if (!text) {
    return validationResult(null);
  }

  if (text.length > maxLength) {
    return validationResult(null, `${label} ne doit pas depasser ${maxLength} caracteres.`);
  }

  return validationResult(text);
};

export const normalizeStringArray = (values, maxItems, maxItemLength, label = "La liste") => {
  if (!Array.isArray(values)) {
    return validationResult([], `${label} doit etre une liste.`);
  }

  if (values.length > maxItems) {
    return validationResult([], `${label} ne doit pas contenir plus de ${maxItems} elements.`);
  }

  const normalized = [];
  const seen = new Set();

  for (const item of values) {
    if (typeof item !== "string") {
      return validationResult([], `${label} contient une valeur invalide.`);
    }

    const text = item.trim();

    if (!text) {
      return validationResult([], `${label} ne doit pas contenir de valeur vide.`);
    }

    if (text.length > maxItemLength) {
      return validationResult([], `${label} contient une valeur de plus de ${maxItemLength} caracteres.`);
    }

    if (!seen.has(text)) {
      seen.add(text);
      normalized.push(text);
    }
  }

  return validationResult(normalized);
};

export const isValidDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
};

export const isValidNumber = (value, min, max) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string" && !value.trim()) {
    return false;
  }

  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

export const isValidCoordinates = (latitude, longitude) => (
  isValidNumber(latitude, -90, 90)
  && isValidNumber(longitude, -180, 180)
);

export const removeUndefinedFields = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedFields(item))
      .filter((item) => item !== undefined);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.entries(value).reduce((cleaned, [key, item]) => {
    if (item === undefined) {
      return cleaned;
    }

    const cleanedValue = removeUndefinedFields(item);

    if (cleanedValue !== undefined) {
      cleaned[key] = cleanedValue;
    }

    return cleaned;
  }, {});
};

const normalizeNumber = (value, min, max, label) => {
  if (!isValidNumber(value, min, max)) {
    return validationResult(null, `${label} doit etre un nombre compris entre ${min} et ${max}.`);
  }

  return validationResult(Number(value));
};

const normalizeOptionalDate = (value, label) => {
  if (value === null || value === undefined || value === "") {
    return validationResult(null);
  }

  if (!isValidDateString(value)) {
    return validationResult(null, `${label} doit etre une date valide au format AAAA-MM-JJ.`);
  }

  return validationResult(value);
};

const normalizeCoordinatesArray = (points, minItems, maxItems, label) => {
  if (!Array.isArray(points)) {
    return validationResult([], `${label} doit etre une liste de coordonnees.`);
  }

  if (points.length < minItems) {
    return validationResult([], `${label} doit contenir au moins ${minItems} points.`);
  }

  if (points.length > maxItems) {
    return validationResult([], `${label} ne doit pas contenir plus de ${maxItems} points.`);
  }

  const normalized = [];

  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) {
      return validationResult([], `${label} contient un point invalide.`);
    }

    const longitudeValue = point[0];
    const latitudeValue = point[1];

    if (!isValidCoordinates(latitudeValue, longitudeValue)) {
      return validationResult([], `${label} contient une latitude ou longitude invalide.`);
    }

    const longitude = Number(longitudeValue);
    const latitude = Number(latitudeValue);

    normalized.push([longitude, latitude]);
  }

  return validationResult(normalized);
};

const normalizeWeatherData = (weather) => {
  if (weather === null || weather === undefined) {
    return validationResult(null);
  }

  if (!isPlainObject(weather)) {
    return validationResult(null, "Les donnees meteo sont invalides.");
  }

  const temperature = weather.temperature === null || weather.temperature === undefined
    ? null
    : Number(weather.temperature);
  const windSpeed = weather.windSpeed === null || weather.windSpeed === undefined
    ? null
    : Number(weather.windSpeed);
  const visibility = weather.visibility === null || weather.visibility === undefined
    ? null
    : Number(weather.visibility);
  const condition = normalizeOptionalText(weather.condition, MISSION_LIMITS.weatherCondition, "La condition meteo");

  if (temperature !== null && !Number.isFinite(temperature)) {
    return validationResult(null, "La temperature meteo est invalide.");
  }

  if (windSpeed !== null && (!Number.isFinite(windSpeed) || windSpeed < 0)) {
    return validationResult(null, "La vitesse du vent est invalide.");
  }

  if (visibility !== null && (!Number.isFinite(visibility) || visibility < 0)) {
    return validationResult(null, "La visibilite meteo est invalide.");
  }

  if (condition.error) {
    return validationResult(null, condition.error);
  }

  return validationResult({
    temperature,
    windSpeed,
    visibility,
    condition: condition.value
  });
};

export const validateMissionForm = (formData = {}, options = {}) => {
  const errors = {};
  const normalizedData = {};
  const allowedMissionTypes = options.allowedMissionTypes || MISSION_TYPES;
  const requirePilot = options.requirePilot !== false;
  const requireEquipment = options.requireEquipment !== false;

  const client = normalizeText(formData.client ?? formData.name ?? formData.clientName ?? "", MISSION_LIMITS.client, "Le client");
  addError(errors, "client", client.error);
  normalizedData.client = client.value;

  const missionType = normalizeText(formData.missionType ?? formData.type ?? "", MISSION_LIMITS.missionType, "Le type de mission");
  if (!missionType.error && !allowedMissionTypes.includes(missionType.value)) {
    missionType.error = "Le type de mission selectionne n'est pas autorise.";
  }
  addError(errors, "missionType", missionType.error);
  normalizedData.missionType = missionType.value;

  const region = normalizeText(formData.region ?? formData.location?.region ?? "", MISSION_LIMITS.location, "La region");
  addError(errors, "region", region.error);
  normalizedData.region = region.value;

  const province = normalizeText(formData.province ?? formData.location?.province ?? "", MISSION_LIMITS.location, "La province");
  addError(errors, "province", province.error);
  normalizedData.province = province.value;

  const commune = normalizeText(formData.commune ?? formData.location?.commune ?? "", MISSION_LIMITS.location, "La commune");
  addError(errors, "commune", commune.error);
  normalizedData.commune = commune.value;

  const airport = normalizeOptionalText(formData.airport ?? formData.location?.airportCode, MISSION_LIMITS.airportCode, "Le code aeroport");
  addError(errors, "airport", airport.error);
  normalizedData.airport = airport.value;

  const aircraftType = normalizeText(formData.aircraftType ?? formData.flight?.aircraftType ?? "", MISSION_LIMITS.aircraftType, "Le type d'appareil");
  if (!aircraftType.error && !MISSION_AIRCRAFT_TYPES.includes(aircraftType.value)) {
    aircraftType.error = "Le type d'appareil selectionne n'est pas autorise.";
  }
  addError(errors, "aircraftType", aircraftType.error);
  normalizedData.aircraftType = aircraftType.value;

  const equipmentIdSource = formData.equipmentId
    ?? (Array.isArray(formData.equipmentIds) ? formData.equipmentIds[0] : "");
  const equipmentId = requireEquipment
    ? normalizeText(equipmentIdSource || "", MISSION_LIMITS.equipmentId, "Le materiel")
    : normalizeOptionalText(equipmentIdSource, MISSION_LIMITS.equipmentId, "Le materiel");
  addError(errors, "equipmentId", equipmentId.error);
  normalizedData.equipmentId = equipmentId.value;
  normalizedData.equipmentIds = equipmentId.value ? [equipmentId.value] : [];

  const assignedPilotId = requirePilot
    ? normalizeText(formData.assignedPilotId ?? "", MISSION_LIMITS.assignedPilotId, "Le pilote")
    : normalizeOptionalText(formData.assignedPilotId, MISSION_LIMITS.assignedPilotId, "Le pilote");
  addError(errors, "assignedPilotId", assignedPilotId.error);
  normalizedData.assignedPilotId = assignedPilotId.value;

  const altitude = normalizeNumber(
    formData.altitude ?? formData.flight?.altitude,
    MISSION_LIMITS.altitudeMin,
    MISSION_LIMITS.altitudeMax,
    "L'altitude"
  );
  addError(errors, "altitude", altitude.error);
  normalizedData.altitude = altitude.value;

  const duration = normalizeNumber(
    formData.duration ?? formData.flight?.duration,
    MISSION_LIMITS.durationMin,
    MISSION_LIMITS.durationMax,
    "La duree de vol"
  );
  addError(errors, "duration", duration.error);
  normalizedData.duration = duration.value;

  const zonePoints = normalizeCoordinatesArray(
    formData.zonePoints,
    3,
    MISSION_LIMITS.zonePointsMax,
    "La zone de vol"
  );
  addError(errors, "zonePoints", zonePoints.error);
  normalizedData.zonePoints = zonePoints.value;

  const expiryDate = normalizeOptionalDate(formData.expiryDate ?? formData.endDate, "La date de fin");
  addError(errors, "expiryDate", expiryDate.error);
  normalizedData.expiryDate = expiryDate.value;

  const weather = normalizeWeatherData(formData.weather);
  addError(errors, "weather", weather.error);
  normalizedData.weather = weather.value;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
};

export const validateMissionPayload = (missionData = {}) => {
  const errors = {};
  const normalizedData = {};
  const dateValue = missionData.date || new Date().toISOString().slice(0, 10);
  const formValidation = validateMissionForm({
    client: missionData.clientName ?? missionData.name,
    missionType: missionData.missionType ?? missionData.type,
    region: missionData.location?.region,
    province: missionData.location?.province,
    commune: missionData.location?.commune,
    airport: missionData.location?.airportCode,
    aircraftType: missionData.flight?.aircraftType,
    equipmentId: Array.isArray(missionData.equipmentIds) ? missionData.equipmentIds[0] : "",
    assignedPilotId: missionData.assignedPilotId,
    altitude: missionData.flight?.altitude,
    duration: missionData.flight?.duration,
    zonePoints: missionData.zonePoints,
    expiryDate: missionData.expiryDate,
    weather: missionData.weather
  });

  Object.assign(errors, formValidation.errors);
  Object.assign(normalizedData, formValidation.normalizedData);

  const date = normalizeText(dateValue, 10, "La date de mission");
  if (!date.error && !isValidDateString(date.value)) {
    date.error = "La date de mission doit etre une date valide au format AAAA-MM-JJ.";
  }
  addError(errors, "date", date.error);
  normalizedData.date = date.value;

  if (normalizedData.expiryDate && normalizedData.date && normalizedData.expiryDate < normalizedData.date) {
    addError(errors, "expiryDate", "La date de fin ne doit pas etre anterieure a la date de mission.");
  }

  const equipmentIds = normalizeStringArray(
    Array.isArray(missionData.equipmentIds) ? missionData.equipmentIds : normalizedData.equipmentIds,
    MISSION_LIMITS.equipmentIdsMax,
    MISSION_LIMITS.equipmentId,
    "La liste du materiel"
  );
  addError(errors, "equipmentIds", equipmentIds.error);
  normalizedData.equipmentIds = equipmentIds.value;

  if (normalizedData.equipmentIds.length === 0) {
    addError(errors, "equipmentIds", "Au moins un materiel doit etre selectionne.");
  }

  const equipment = normalizeOptionalText(missionData.equipment, MISSION_LIMITS.equipmentLabel, "Le libelle materiel");
  addError(errors, "equipment", equipment.error);
  normalizedData.equipment = equipment.value;

  const drone = normalizeOptionalText(missionData.flight?.drone, MISSION_LIMITS.equipmentLabel, "Le vecteur de vol");
  addError(errors, "drone", drone.error);
  normalizedData.drone = drone.value;

  const zone = normalizeOptionalText(missionData.zone ?? missionData.location?.zoneLabel, MISSION_LIMITS.zoneLabel, "La zone");
  addError(errors, "zone", zone.error);
  normalizedData.zone = zone.value || [normalizedData.commune, normalizedData.province, normalizedData.region].filter(Boolean).join(" - ");

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
};

export const validateEquipmentForm = (formData = {}, options = {}) => {
  const errors = {};
  const normalizedData = {};
  const partial = options.partial === true;
  const shouldValidate = (field) => !partial || hasOwn(formData, field);

  if (shouldValidate("name")) {
    const name = partial && (formData.name === null || formData.name === undefined)
      ? validationResult(null)
      : normalizeText(formData.name ?? "", EQUIPMENT_LIMITS.name, "Le nom de l'equipement");
    addError(errors, "name", name.error);
    if (!name.error) normalizedData.name = name.value;
  }

  if (shouldValidate("type")) {
    const type = normalizeText(formData.type ?? "", EQUIPMENT_LIMITS.type, "Le type d'equipement");
    if (!type.error && !EQUIPMENT_TYPES.includes(type.value)) {
      type.error = "Le type d'equipement selectionne n'est pas autorise.";
    }
    addError(errors, "type", type.error);
    if (!type.error) normalizedData.type = type.value;
  }

  if (shouldValidate("serial")) {
    const serial = normalizeOptionalText(formData.serial, EQUIPMENT_LIMITS.serial, "Le numero de serie");
    addError(errors, "serial", serial.error);
    if (!serial.error) normalizedData.serial = serial.value;
  }

  if (shouldValidate("status")) {
    const status = normalizeText(formData.status ?? "", EQUIPMENT_LIMITS.status, "Le statut");
    if (!status.error && !EQUIPMENT_STATUSES.includes(status.value)) {
      status.error = "Le statut selectionne n'est pas autorise.";
    }
    addError(errors, "status", status.error);
    if (!status.error) normalizedData.status = status.value;
  }

  if (shouldValidate("model")) {
    const model = normalizeOptionalText(formData.model, EQUIPMENT_LIMITS.model, "Le modele");
    addError(errors, "model", model.error);
    if (!model.error) normalizedData.model = model.value;
  }

  if (shouldValidate("registration")) {
    const registration = normalizeOptionalText(formData.registration, EQUIPMENT_LIMITS.registration, "L'immatriculation");
    addError(errors, "registration", registration.error);
    if (!registration.error) normalizedData.registration = registration.value;
  }

  if (shouldValidate("notes")) {
    const notes = normalizeOptionalText(formData.notes, EQUIPMENT_LIMITS.notes, "Les notes");
    addError(errors, "notes", notes.error);
    if (!notes.error) normalizedData.notes = notes.value;
  }

  if (shouldValidate("lastMaintenance")) {
    const lastMaintenance = normalizeOptionalDate(formData.lastMaintenance, "La derniere maintenance");
    addError(errors, "lastMaintenance", lastMaintenance.error);
    if (!lastMaintenance.error) normalizedData.lastMaintenance = lastMaintenance.value;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
};
