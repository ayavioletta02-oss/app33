import React, { useState, useEffect } from "react";
import { FeatureGroup, MapContainer, TileLayer, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import * as turf from "@turf/turf";
import { supabase } from "../supabaseClient";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// ==========================================
// 1. TOUTES LES RÉGIONS & PROVINCES DU MAROC (12 Régions)
// ==========================================
const GEOGRAPHY_DATA = {
  "Tanger-Tétouan-Al Hoceïma": {
    "Tanger-Assilah": ["Tanger", "Asilah", "Gzenaya", "Sidi Lyamani"],
    "Tétouan": ["Tétouan", "Oued Laou", "Martil"],
    "M'diq-Fnideq": ["M'diq", "Fnideq", "Martil"],
    "Chefchaouen": ["Chefchaouen", "Bab Taza", "Brikcha"],
    "Larache": ["Larache", "Ksar El Kébir", "Laouamra"],
    "Al Hoceïma": ["Al Hoceïma", "Imzouren", "Targuist"],
    "Fahs-Anjra": ["Anjra", "Jouamaa", "Ksar Sghir"],
    "Ouezzane": ["Ouezzane", "Asjen", "Ain Beida"]
  },
  "L'Oriental": {
    "Oujda-Angad": ["Oujda", "Bni Drar", "Naima"],
    "Nador": ["Nador", "Zeghanghane", "Beni Enzar"],
    "Berkane": ["Berkane", "Ahfir", "Saïdia"],
    "Taourirt": ["Taourirt", "El Aioun Sidi Mellouk"],
    "Jerada": ["Jerada", "Ain Bni Mathar"],
    "Figuig": ["Figuig", "Bouarfa"],
    "Driouch": ["Driouch", "Midar", "Ben Taieb"],
    "Guercif": ["Guercif", "Taddart"]
  },
  "Fès-Meknès": {
    "Fès": ["Fès-Ville", "Mechouar Fès Jdid"],
    "Meknès": ["Meknès-Ville", "Al Machouar Stinia"],
    "El Hajeb": ["El Hajeb", "Ain Taoujdate"],
    "Ifrane": ["Ifrane", "Azrou"],
    "Sefrou": ["Sefrou", "Bhalil", "Imouzzer Kandar"],
    "Moulay Yacoub": ["Moulay Yacoub", "Ain Chkef"],
    "Taounate": ["Taounate", "Ghafsai", "Karia Ba Mohamed"],
    "Taza": ["Taza", "Aknoul", "Oued Amlil"],
    "Boulemane": ["Boulemane", "Missour", "Outat El Haj"]
  },
  "Rabat-Salé-Kénitra": {
    "Rabat": ["Rabat-Agdal", "Rabat-Hassan", "Souissi", "Youssoufia"],
    "Salé": ["Salé-Médina", "Bab Lamrisa", "Tabriquet", "Layayda"],
    "Skhirate-Témara": ["Témara", "Skhirate", "Harhoura", "Ain El Aouda"],
    "Kénitra": ["Kénitra", "Mehdia", "Souk El Arbaa"],
    "Khémisset": ["Khémisset", "Tiflet", "Rommani"],
    "Sidi Kacem": ["Sidi Kacem", "Mechra Bel Ksiri"],
    "Sidi Slimane": ["Sidi Slimane", "Sidi Yahya El Gharb"]
  },
  "Béni Mellal-Khénifra": {
    "Béni Mellal": ["Béni Mellal", "Kasba Tadla", "Zaouiat Cheikh"],
    "Azilal": ["Azilal", "Demnate"],
    "Fquih Ben Salah": ["Fquih Ben Salah", "Oouled Ayad", "Souk Sebt"],
    "Khénifra": ["Khénifra", "M'rirt"],
    "Khouribga": ["Khouribga", "Oued Zem", "Boujniba"]
  },
  "Casablanca-Settat": {
    "Casablanca": ["Anfa", "Maârif", "Sidi Belyout", "Ain Chock", "Hay Hassani"],
    "Mohammadia": ["Mohammadia", "Ain Harrouda"],
    "Nouaceur": ["Nouaceur", "Bouskoura", "Dar Bouazza"],
    "Médiouna": ["Médiouna", "Tit Mellil", "Lahraouyine"],
    "Benslimane": ["Benslimane", "Bouznika"],
    "Berrechid": ["Berrechid", "Deroua", "Had Soualem"],
    "Settat": ["Settat", "Oulad M'Barek"],
    "Sidi Bennour": ["Sidi Bennour", "Zemamra"],
    "El Jadida": ["El Jadida", "Azemmour", "Bir Jdid"]
  },
  "Marrakech-Safi": {
    "Marrakech": ["Gueliz", "Medina", "Ennakhil", "Sidi Youssef Ben Ali"],
    "Al Haouz": ["Tahannaout", "Aït Ourir", "Ourika", "Asni"],
    "Chichaoua": ["Chichaoua", "Imintanoute"],
    "El Kelâa des Sraghna": ["El Kelâa des Sraghna", "Tamallalt"],
    "Essaouira": ["Essaouira", "Aït Daoud"],
    "Rehamna": ["Benguerir", "Sidi Bou Othmane"],
    "Safi": ["Safi", "Jamaat Shaim"],
    "Youssoufia": ["Youssoufia", "Echemmaia"]
  },
  "Drâa-Tafilalet": {
    "Errachidia": ["Errachidia", "Erfoud", "Rissani", "Moulay Ali Cherif"],
    "Ouarzazate": ["Ouarzazate", "Taznakht"],
    "Midelt": ["Midelt", "Er-Rich"],
    "Tinghir": ["Tinghir", "Boumalne Dades"],
    "Zagora": ["Zagora", "Agdz"]
  },
  "Souss-Massa": {
    "Agadir-Ida Ou Tanane": ["Agadir", "Anza", "Aourir", "Imouzzer"],
    "Inezgane-Aït Melloul": ["Inezgane", "Aït Melloul", "Dcheira El Jihadia"],
    "Chtouka-Aït Baha": ["Biougra", "Aït Baha"],
    "Taroudannt": ["Taroudannt", "Ouled Teima", "Oulouz"],
    "Tiznit": ["Tiznit", "Tafraout"],
    "Tata": ["Tata", "Akka", "Fam El Hisn"]
  },
  "Guelmim-Oued Noun": {
    "Guelmim": ["Guelmim", "Bouizakarne"],
    "Assa-Zag": ["Assa", "Zag"],
    "Tan-Tan": ["Tan-Tan", "El Ouatia"],
    "Sidi Ifni": ["Sidi Ifni", "Lakhsass"]
  },
  "Laâyoune-Sakia El Hamra": {
    "Laâyoune": ["Laâyoune", "El Marsa"],
    "Boujdour": ["Boujdour"],
    "Esmara": ["Esmara"],
    "Tarfaya": ["Tarfaya"]
  },
  "Dakhla-Oued Ed-Dahab": {
    "Oued Ed-Dahab": ["Dakhla", "Bir Anzarane"],
    "Aousserd": ["Aousserd", "Bir Gandouz"]
  }
};

// ==========================================
// 2. TOUS LES AÉROPORTS DU MAROC (ONDA / CTR)
// ==========================================
const AEROPORTS_MAROC = [
  { code: "GMMN", name: "Casablanca - Mohammed V (CMN)", coords: [33.3675, -7.5899] },
  { code: "GMME", name: "Rabat - Salé (RBA)", coords: [34.0514, -6.7511] },
  { code: "GMMX", name: "Marrakech - Ménara (RAK)", coords: [31.6069, -8.0363] },
  { code: "GMTT", name: "Tanger - Ibn Battouta (TNG)", coords: [35.7269, -5.9169] },
  { code: "GMAD", name: "Agadir - Al Massira (AGA)", coords: [30.3250, -9.4101] },
  { code: "GMFF", name: "Fès - Saïss (FEZ)", coords: [33.9275, -4.9780] },
  { code: "GMMO", name: "Oujda - Angads (OUD)", coords: [34.7872, -1.9242] },
  { code: "GMMW", name: "Nador - Al Aroui (NDR)", coords: [34.9889, -3.0286] },
  { code: "GMMY", name: "Essaouira - Mogador (ESU)", coords: [31.4051, -9.6841] },
  { code: "GMED", name: "Errachidia - Moulay Ali Cherif (ERH)", coords: [31.9458, -4.3992] },
  { code: "GMMZ", name: "Ouarzazate (OZZ)", coords: [30.9386, -6.9094] },
  { code: "GMMA", name: "Béni Mellal (BEM)", coords: [32.4003, -6.3167] },
  { code: "GMTA", name: "Al Hoceïma (AHU)", coords: [35.1772, -3.8333] },
  { code: "GMTN", name: "Tétouan - Saniat R'mel (TTU)", coords: [35.5944, -5.3325] },
  { code: "GMGL", name: "Guelmim (GLN)", coords: [29.0258, -10.0514] },
  { code: "GMAT", name: "Tan-Tan - Plage Blanche (TTY)", coords: [28.4486, -11.1614] },
  { code: "GSFN", name: "Laâyoune - Hassan Ier (EUN)", coords: [27.1517, -13.2192] },
  { code: "GMDK", name: "Dakhla (VIL)", coords: [23.7183, -15.9319] },
  { code: "GMMB", name: "Ben Slimane (GMD)", coords: [33.6525, -7.1542] },
  { code: "GMMF", name: "Casablanca - Tit Mellil", coords: [33.5933, -7.4633] }
].sort((a, b) => a.name.localeCompare(b.name));

const MISSION_TYPES = [
  "Prise de vues aériennes (Photos / Vidéos)",
  "Topographie & Photogrammétrie",
  "Inspection technique d'ouvrages d'art",
  "Surveillance de chantiers & Infrastructures",
  "Agriculture de précision",
  "Thermographie aérienne"
];

const DRONE_MODELS = [
  "DJI Mavic 3 Enterprise / Thermal",
  "DJI Matrice 300 / 350 RTK",
  "DJI Matrice 30 T",
  "DJI Inspire 3",
  "Phantom 4 RTK",
  "WingtraOne Gen II (Voilure fixe)"
];

// Liste des avions/aéronefs pilotés disponibles pour les missions PVA
const AIRPLANE_MODELS = [
  "Cessna 172 Skyhawk",
  "Cessna 206 Stationair",
  "Cessna 208 Caravan",
  "Diamond DA42 Twin Star",
  "Piper PA-34 Seneca",
  "Beechcraft King Air 350",
  "ULTRACAM FALCON Mark2 (plateforme SEPRET)"
];

const PILOTS_LIST = [
  "Mehdi Alami (Licence N°4429)",
  "Anas Benjelloun (Licence N°5102)",
  "Youssef Tazi (Licence N°3891)",
  "Sami El Idrissi (Licence N°6214)"
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

export default function AppPortal({ onSubmit, onNavigate }) {
  const TOTAL_STEPS = 5;
  const [currentTab, setCurrentTab] = useState("new_mission");
  const [step, setStep] = useState(1); // On démarre à l'étape 1

  const [formData, setFormData] = useState({
    client: "",
    company: "Sepret Rabat",
    missionType: "",
    region: "",
    province: "",
    commune: "",
    airport: "",
    aircraftType: "Drone",
    drone: "",
    pilot: "",
    altitude: "120",
    duration: "45",
    zonePoints: [[-13.2192, 27.1517], [-13.2100, 27.1600], [-13.2200, 27.1700]],
    weather: { temperature: 38.4, windSpeed: 6.1, condition: "Ensoleillé / Ciel dégagé", visibility: "48.3" }
  });

  const [surface, setSurface] = useState(0);
  const [perimeter, setPerimeter] = useState(0);
  const [mapCenter, setMapCenter] = useState([34.0209, -6.8416]); // Centré sur Rabat par défaut
  const [mapZoom, setMapZoom] = useState(6);

  const nextStep = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };
  const previousStep = () => { if (step > 1) setStep(step - 1); };

  // Compile les données du formulaire en un dossier de mission et l'envoie à App.js
const handleSubmit = async () => {

  const { error } = await supabase
    .from("missions")
    .insert([
      {
        client: formData.client,
        company: formData.company,
        mission_type: formData.missionType,
        region: formData.region,
        province: formData.province,
        commune: formData.commune,
        airport: formData.airport,
        aircraft_type: formData.aircraftType,
        drone: formData.drone,
        pilot: formData.pilot,
        altitude: parseInt(formData.altitude),
        duration: parseInt(formData.duration),
        surface: Number(surface),
        perimeter: Number(perimeter),
        status: "pending"
      }
    ]);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  alert("Mission enregistrée avec succès !");
};
  const updateField = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset automatique si la région change
      if (field === "region") {
        updated.province = "";
        updated.commune = "";
      }
      // Reset automatique si la province change
      if (field === "province") {
        updated.commune = "";
      }
      // Reset du modèle choisi si on change le type d'appareil (Drone <-> Avion)
      if (field === "aircraftType") {
        updated.drone = "";
      }
      return updated;
    });
  };

  // ⚠️ CORRECTION : react-leaflet-draw appelle onCreated avec l'ÉVÉNEMENT complet
  // { layerType, layer }, pas directement la forme dessinée. Il faut donc récupérer
  // "e.layer" et non traiter "e" comme si c'était déjà la forme.
  const calculatePolygon = (e) => {
    const layer = e.layer;
    if (!layer || typeof layer.getLatLngs !== 'function') return;

    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map((point) => [point.lng, point.lat]);
    coordinates.push(coordinates[0]);
    updateField("zonePoints", coordinates);

    const polygon = turf.polygon([coordinates]);
    setSurface((turf.area(polygon) / 10000).toFixed(1));
    setPerimeter(turf.length(polygon, { units: "meters" }).toFixed(0));
  };

  return (
    <div className="portal-container" style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <style>{`
        .global-alert {
          background: #fff9e6 !important;
          border-left: 5px solid #ffb300 !important;
          color: #5c4300 !important;
          padding: 14px 16px !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
        }
        
        .content-body { padding: 20px; padding-bottom: 90px; max-width: 600px; margin: 0 auto; }
        .main-title-green { color: #004d40 !important; font-weight: bold; font-size: 1.75rem; margin: 0; }
        .step-chip { background: #009688 !important; color: white !important; padding: 6px 14px !important; border-radius: 20px; font-weight: bold; font-size: 0.85rem; }
        
        .wizard-progress-bar { background: #e2e8f0; height: 6px; border-radius: 3px; margin: 16px 0 24px 0; overflow: hidden; }
        .wizard-progress-fill { background: #009688 !important; height: 100%; transition: width 0.3s ease; }

        .wizard-steps-timeline { display: flex; justify-content: space-between; margin-bottom: 25px; position: relative; }
        .wizard-timeline-item { display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center; font-size: 0.75rem; color: #94a3b8; }
        .wizard-timeline-item.active { color: #009688; font-weight: bold; }
        .wizard-timeline-item.completed { color: #0f172a; }
        .circle-step { width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; font-weight: bold; }
        .wizard-timeline-item.active .circle-step { background: #009688; color: white; }
        .wizard-timeline-item.completed .circle-step { background: #cbd5e1; color: #475569; }

        .step-container {
          background: #ffffff !important;
          border-radius: 16px !important;
          padding: 24px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid #e2e8f0 !important;
        }

        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: bold; color: #004d40; font-size: 0.9rem; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.95rem; box-sizing: border-box; background: #fff; }

        .aircraft-type-toggle { display: flex; gap: 10px; margin-bottom: 18px; }
        .aircraft-type-btn { flex: 1; padding: 12px; border-radius: 10px; border: 2px solid #cbd5e1; background: #fff; font-weight: bold; color: #64748b; cursor: pointer; text-align: center; font-size: 0.9rem; }
        .aircraft-type-btn.selected { border-color: #009688; background: #e0f2f1; color: #004d40; }

        .map-dashboard-grid { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important; gap: 12px !important; margin: 18px 0 !important; }
        .map-data-card { background: #ffffff !important; border: 1px solid #e2e8f0 !important; border-radius: 14px !important; padding: 12px !important; display: flex !important; flex-direction: column !important; align-items: center !important; }
        .map-data-card .value-badge { font-size: 1rem !important; font-weight: bold !important; color: #004d40 !important; background: #e0f2f1 !important; padding: 2px 8px !important; border-radius: 6px !important; margin-top: 4px; }

        .review-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.95rem; }
        .review-row:last-child { border-bottom: none; }
        .review-label { color: #64748b; font-weight: 500; }
        .review-value { color: #0f172a; font-weight: 600; text-align: right; }
        
        .step-buttons-container { display: flex; justify-content: space-between; margin-top: 24px; gap: 12px; }
        .btn-back { padding: 12px 24px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; font-weight: bold; color: #475569; cursor: pointer; }
        .btn-next { padding: 12px 24px; border-radius: 10px; border: none; background: #009688 !important; color: white !important; font-weight: bold; cursor: pointer; }
        .btn-next:disabled { background: #cbd5e1 !important; cursor: not-allowed; }

        .bottom-nav-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 65px; background: #004d40; display: flex; justify-content: space-around; align-items: center; z-index: 9999; }
        .nav-btn { background: none; border: none; font-size: 1.5rem; color: #a3e2d7; cursor: pointer; }
        .nav-btn.active { color: #ffffff !important; }
        .nav-btn-center { background: #ffffff; border-radius: 50%; width: 55px; height: 55px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-top: -25px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
      `}</style>

      <div className="global-alert">
        ⚠️ <b>Alerte Renouvellement :</b> N°1319 (Agence du Bassin Hydraulique du Guir-Ziz-Rhéris) arrive à échéance dans 33 jours. Relancer la DTA !
      </div>

      <div className="content-body">
        {currentTab === "new_mission" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <div>
                <h1 className="main-title-green">✈ Nouvelle mission</h1>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>Préparation d'une demande DGAC</div>
              </div>
              <div className="step-chip">Etape {step} / {TOTAL_STEPS}</div>
            </div>

            <div className="wizard-progress-bar">
              <div className="wizard-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
            </div>

            <div className="wizard-steps-timeline">
              <div className={`wizard-timeline-item ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}><div className="circle-step">{step > 1 ? "✓" : "1"}</div><div>Infos</div></div>
              <div className={`wizard-timeline-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}><div className="circle-step">{step > 2 ? "✓" : "2"}</div><div>Vecteur</div></div>
              <div className={`wizard-timeline-item ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}><div className="circle-step">{step > 3 ? "✓" : "3"}</div><div>Zone</div></div>
              <div className={`wizard-timeline-item ${step === 4 ? "active" : step > 4 ? "completed" : ""}`}><div className="circle-step">{step > 4 ? "✓" : "4"}</div><div>Validation</div></div>
              <div className={`wizard-timeline-item ${step === 5 ? "active" : ""}`}><div className="circle-step">5</div><div>Résumé</div></div>
            </div>

            <div className="step-container">
              
              {/* ÉTAPE 1 : TOUTES LES INFOS GÉOGRAPHIQUES COMPLÈTES SONT ICI */}
              {step === 1 && (
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#004d40", marginBottom: 16 }}>📝 Informations Générales</div>
                  
                  <div className="form-group">
                    <label>Exploitant / Client *</label>
                    <input type="text" placeholder="Ex: Agence du Bassin Hydraulique..." value={formData.client} onChange={(e) => updateField("client", e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Type de mission *</label>
                    <select value={formData.missionType} onChange={(e) => updateField("missionType", e.target.value)}>
                      <option value="">Sélectionner le type...</option>
                      {MISSION_TYPES.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Région administrative *</label>
                    <select value={formData.region} onChange={(e) => updateField("region", e.target.value)}>
                      <option value="">Choisir la région...</option>
                      {Object.keys(GEOGRAPHY_DATA).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Province / Préfecture *</label>
                    <select value={formData.province} onChange={(e) => updateField("province", e.target.value)} disabled={!formData.region}>
                      <option value="">Choisir la province...</option>
                      {formData.region && Object.keys(GEOGRAPHY_DATA[formData.region]).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Commune locale *</label>
                    <select value={formData.commune} onChange={(e) => updateField("commune", e.target.value)} disabled={!formData.province}>
                      <option value="">Choisir la commune...</option>
                      {formData.region && formData.province && GEOGRAPHY_DATA[formData.region][formData.province].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : SÉLECTION DU TYPE D'APPAREIL (DRONE OU AVION) ET DU PILOTE */}
              {step === 2 && (
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#004d40", marginBottom: 16 }}>🛩️ Vecteur & Équipage</div>

                  <div className="form-group">
                    <label>Type d'appareil *</label>
                    <div className="aircraft-type-toggle">
                      <button
                        type="button"
                        className={`aircraft-type-btn ${formData.aircraftType === "Drone" ? "selected" : ""}`}
                        onClick={() => updateField("aircraftType", "Drone")}
                      >
                        🚁 Drone
                      </button>
                      <button
                        type="button"
                        className={`aircraft-type-btn ${formData.aircraftType === "Avion" ? "selected" : ""}`}
                        onClick={() => updateField("aircraftType", "Avion")}
                      >
                        ✈️ Avion
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{formData.aircraftType === "Avion" ? "Modèle d'avion réglementé *" : "Modèle de drone réglementé *"}</label>
                    <select value={formData.drone} onChange={(e) => updateField("drone", e.target.value)}>
                      <option value="">{formData.aircraftType === "Avion" ? "Sélectionner un avion..." : "Sélectionner un drone..."}</option>
                      {(formData.aircraftType === "Avion" ? AIRPLANE_MODELS : DRONE_MODELS).map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Commandant de bord / Pilote accrédité *</label>
                    <select value={formData.pilot} onChange={(e) => updateField("pilot", e.target.value)}>
                      <option value="">Sélectionner un pilote...</option>
                      {PILOTS_LIST.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Altitude maximale de vol (mètres AGL)</label>
                    <input type="number" value={formData.altitude} onChange={(e) => updateField("altitude", e.target.value)} />
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : TOUS LES AÉROPORTS DU MAROC SONT ACCESSIBLES ICI */}
              {step === 3 && (
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#004d40", marginBottom: 14 }}>🌍 Zone d'évolution & Espaces Contrôlés</div>
                  
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Recentrer sur une emprise Aéroportuaire (ONDA / CTR)</label>
                    <select value={formData.airport} onChange={(e) => {
                      updateField("airport", e.target.value);
                      const ap = AEROPORTS_MAROC.find(a => a.code === e.target.value);
                      if (ap) {
                        setMapCenter(ap.coords);
                        setMapZoom(13);
                      }
                    }}>
                      <option value="">Choisir un aéroport du Maroc...</option>
                      {AEROPORTS_MAROC.map(ap => <option key={ap.code} value={ap.code}>{`[${ap.code}] ${ap.name}`}</option>)}
                    </select>
                  </div>

                  <div style={{ height: "220px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                      <ChangeView center={mapCenter} zoom={mapZoom} />
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <FeatureGroup>
                        <EditControl position="topright" draw={{ rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false }} onCreated={calculatePolygon} />
                      </FeatureGroup>
                    </MapContainer>
                  </div>

                  <div className="map-dashboard-grid">
                    <div className="map-data-card"><span style={{fontSize: "1.2rem"}}>📍</span><span style={{fontSize: "0.75rem", color: "#64748b"}}>Points</span><span className="value-badge">{formData.zonePoints.length}</span></div>
                    <div className="map-data-card"><span style={{fontSize: "1.2rem"}}>📐</span><span style={{fontSize: "0.75rem", color: "#64748b"}}>Surface</span><span className="value-badge">{surface} ha</span></div>
                    <div className="map-data-card"><span style={{fontSize: "1.2rem"}}>📏</span><span style={{fontSize: "0.75rem", color: "#64748b"}}>Périmètre</span><span className="value-badge">{perimeter} m</span></div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : RECOUVREMENT FIXÉ - AFFICHAGE ENTIÈREMENT DYNAMIQUE */}
              {step === 4 && (
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#004d40", marginBottom: 16 }}>📋 Étape 4 : Revue de Conformité des Pièces</div>
                  <div style={{ background: "#f8fafc", padding: "4px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div className="review-row"><span className="review-label">Exploitant</span><span className="review-value">{formData.client || "Non renseigné"}</span></div>
                    <div className="review-row"><span className="review-label">Type de Mission</span><span className="review-value">{formData.missionType || "Non renseigné"}</span></div>
                    <div className="review-row"><span className="review-label">Localisation</span><span className="review-value">{formData.region ? `${formData.commune} (${formData.province})` : "Non renseignée"}</span></div>
                    <div className="review-row"><span className="review-label">Type d'appareil</span><span className="review-value">{formData.aircraftType}</span></div>
                    <div className="review-row"><span className="review-label">Vecteur</span><span className="review-value">{formData.drone || "Non renseigné"}</span></div>
                    <div className="review-row"><span className="review-label">Pilote affecté</span><span className="review-value">{formData.pilot || "Non renseigné"}</span></div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 : CONFIRMATION FINALE */}
              {step === 5 && (
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#004d40", marginBottom: 16 }}>✨ Étape 5 : Dépôt & Finalisation</div>
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🚀</div>
                    <h3 style={{ color: "#004d40", margin: "0 0 8px 0" }}>Dossier Compilé avec Succès !</h3>
                    <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.5", margin: 0 }}>
                      Toutes les informations réglementaires pour la commune de <b>{formData.commune || "sélectionnée"}</b> sont complètes. Prêt à être envoyé à la DGAC.
                    </p>
                  </div>
                </div>
              )}

            </div>

            <div className="step-buttons-container">
              <button className="btn-back" onClick={previousStep} disabled={step === 1}>← Retour</button>
              <button className="btn-next" onClick={nextStep} style={{ background: step === 5 ? "#16a34a" : "#009688" }}>
                {step === 5 ? "Soumettre ✔" : "Suivant →"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-nav-bar">
        <button className={`nav-btn ${currentTab === "dashboard" ? "active" : ""}`} onClick={() => setCurrentTab("dashboard")}>📋</button>
        <button className="nav-btn nav-btn-center" onClick={() => setCurrentTab("new_mission")}>✈️</button>
        <button className="nav-btn">💾</button>
        <button className="nav-btn">🔧</button>
        <button className="nav-btn">⚙️</button>
      </div>
    </div>
  );
}