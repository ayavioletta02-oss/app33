import React, { useState, useEffect } from "react";

import "./App.css";
import Dashboard from "./pages/Dashboard";
import GlobalAuthorizations from "./pages/GlobalAuthorizations";
import NewMission from "./pages/NewMission";
import PDFGenerator from "./pages/PDFGenerator";
import Equipment from "./pages/Equipment";
import Login from "./pages/Login";

// Dictionnaire de traduction complet de l'application (FR / EN / AR)
const texts = {
  fr: {
    nav: { dashboard: "Tableau", tracking: "Suivi", request: "Demande", files: "Fichiers", equipment: "Matériel", settings: "Options" },
    dashboard: {
      title: "Tableau de bord",
      newRequest: "Nouvelle demande",
      active: "Actives", pending: "En attente", expired: "Expirées", missions: "Missions",
      search: "🔍 Rechercher...",
      globalAuth: "Autorisations globales",
      seeAll: "Voir tout",
      code: "Code", client: "Client", endAuth: "Fin auth.", status: "Statut",
      statusActive: "Active", statusPending: "En attente",
      validityDocs: "Validités documents",
      expiredTag: "EXPIRÉ"
    },
    authorizations: {
      title: "Autorisations globales",
      subtitle: "Suivi des demandes auprès de la DGAC",
      newBtn: "+ Nouvelle",
      filters: { all: "Toutes", active: "Actives", pending: "En attente", expired: "Expirées" },
      statusActive: "Active", statusPending: "En attente",
      submittedOn: "Déposée le",
      details: "Détails",
      sendMail: "Envoyer DGAC/DTA"
    },
    newMission: {
      title: "Nouvelle demande",
      subtitle: "Création de dossier PVA",
      cancel: "Annuler",
      step: "Étape",
      adminTitle: "Administration demanderesse",
      clientLabel: "CLIENT DEMANDEUR",
      selectAgency: "-- Sélectionner une agence ou direction --",
      natureLabel: "NATURE DE L'OPÉRATION",
      geoTitle: "Couverture géographique",
      regionLabel: "RÉGION DU MAROC",
      selectRegion: "-- Choisir une région --",
      provinceLabel: "PROVINCE / PRÉFECTURE",
      selectProvince: "-- Choisir une province --",
      selectZone: "Sélectionnez une zone de vol",
      logisticsTitle: "Aérodromes & logistique",
      aerodromeLabel: "AÉRODROME DE BASE (CODE OACI)",
      selectAerodrome: "Choisir un aérodrome",
      endDateLabel: "DATE DE FIN DE VALIDITÉ SOUHAITÉE",
      crewTitle: "Équipage et matériel",
      pilotLabel: "PILOTE COMMANDANT DE BORD",
      aircraftLabel: "AÉRONEF / CAMÉRA",
      validationTitle: "Validation du dossier",
      validationSubtitle: "Vérifie les informations avant envoi au système de traitement de la DTA.",
      recapClient: "Client", recapMission: "Mission", recapRegion: "Région", recapProvince: "Province",
      recapAerodrome: "Aérodrome", recapPilot: "Pilote", recapAircraft: "Aéronef", recapEndDate: "Fin autorisation",
      previous: "Précédent", next: "Suivant", save: "Enregistrer",
      sendMail: "📧 Envoyer à la DGAC/DTA"
    },
    pdf: {
      title: "Documents",
      subtitle: "Compilation des fiches techniques",
      chooseLabel: "CHOISIR LE DOSSIER DE COMPILATION",
      selectFile: "-- Sélectionner un dossier d'autorisation --",
      compileBtn: "💾 Compiler & Générer le PDF Officiel"
    },
    settings: {
      title: "⚙️ Configuration",
      darkMode: "🌙 Mode sombre",
      language: "🌍 Langue",
      notifications: "🔔 Notifications"
    },
    notifications: {
      newMission: "Nouvelle mission créée",
      dgacApproved: "Autorisation DGAC approuvée",
      expiringSoon: "Une autorisation expire bientôt"
    },
    equipment: {
      title: "Suivi du matériel",
      subtitle: "État et disponibilité du parc technique",
      addBtn: "+ Ajouter",
      total: "Total", available: "Disponible", inMission: "En mission", maintenance: "Maintenance",
      formTitle: "Nouvel équipement",
      nameLabel: "NOM DE L'ÉQUIPEMENT",
      typeLabel: "TYPE",
      serialLabel: "NUMÉRO DE SÉRIE",
      statusLabel: "STATUT",
      lastMaintenanceLabel: "Dernière maintenance",
      save: "Enregistrer",
      cancel: "Annuler",
      statusAvailable: "Disponible",
      statusMission: "En mission",
      statusMaintenance: "Maintenance",
      statusOut: "Hors service",
      delete: "Supprimer",
      noEquipment: "Aucun équipement enregistré pour le moment",
      types: { camera: "Caméra", aircraft: "Aéronef", drone: "Drone", accessory: "Accessoire" }
    },
    alertBanner: {
      title: "Alerte Renouvellement",
      expiresIn: "arrive à échéance dans",
      days: "jours",
      relaunch: "Relancer la DTA !"
    }
  },

  en: {
    nav: { dashboard: "Dashboard", tracking: "Tracking", request: "Request", files: "Files", equipment: "Equipment", settings: "Settings" },
    dashboard: {
      title: "Dashboard",
      newRequest: "New Request",
      active: "Active", pending: "Pending", expired: "Expired", missions: "Missions",
      search: "🔍 Search...",
      globalAuth: "Global Authorizations",
      seeAll: "See all",
      code: "Code", client: "Client", endAuth: "Exp. date", status: "Status",
      statusActive: "Active", statusPending: "Pending",
      validityDocs: "Document validity",
      expiredTag: "EXPIRED"
    },
    authorizations: {
      title: "Global Authorizations",
      subtitle: "Tracking DGAC requests",
      newBtn: "+ New",
      filters: { all: "All", active: "Active", pending: "Pending", expired: "Expired" },
      statusActive: "Active", statusPending: "Pending",
      submittedOn: "Submitted on",
      details: "Details",
      sendMail: "Send to DGAC/DTA"
    },
    newMission: {
      title: "New Request",
      subtitle: "Creating a PVA file",
      cancel: "Cancel",
      step: "Step",
      adminTitle: "Requesting administration",
      clientLabel: "REQUESTING CLIENT",
      selectAgency: "-- Select an agency or department --",
      natureLabel: "OPERATION TYPE",
      geoTitle: "Geographic coverage",
      regionLabel: "MOROCCAN REGION",
      selectRegion: "-- Choose a region --",
      provinceLabel: "PROVINCE / PREFECTURE",
      selectProvince: "-- Choose a province --",
      selectZone: "Select a flight zone",
      logisticsTitle: "Aerodromes & logistics",
      aerodromeLabel: "BASE AERODROME (ICAO CODE)",
      selectAerodrome: "Choose an aerodrome",
      endDateLabel: "DESIRED END OF VALIDITY DATE",
      crewTitle: "Crew and equipment",
      pilotLabel: "PILOT IN COMMAND",
      aircraftLabel: "AIRCRAFT / CAMERA",
      validationTitle: "File validation",
      validationSubtitle: "Check the information before sending to the DTA processing system.",
      recapClient: "Client", recapMission: "Mission", recapRegion: "Region", recapProvince: "Province",
      recapAerodrome: "Aerodrome", recapPilot: "Pilot", recapAircraft: "Aircraft", recapEndDate: "Authorization end",
      previous: "Previous", next: "Next", save: "Save",
      sendMail: "📧 Send to DGAC/DTA"
    },
    pdf: {
      title: "Documents",
      subtitle: "Technical sheet compilation",
      chooseLabel: "CHOOSE THE FILE TO COMPILE",
      selectFile: "-- Select an authorization file --",
      compileBtn: "💾 Compile & Generate Official PDF"
    },
    settings: {
      title: "⚙️ Settings",
      darkMode: "🌙 Dark mode",
      language: "🌍 Language",
      notifications: "🔔 Notifications"
    },
    notifications: {
      newMission: "New mission created",
      dgacApproved: "DGAC authorization approved",
      expiringSoon: "An authorization is expiring soon"
    },
    equipment: {
      title: "Equipment tracking",
      subtitle: "Status and availability of the technical fleet",
      addBtn: "+ Add",
      total: "Total", available: "Available", inMission: "In mission", maintenance: "Maintenance",
      formTitle: "New equipment",
      nameLabel: "EQUIPMENT NAME",
      typeLabel: "TYPE",
      serialLabel: "SERIAL NUMBER",
      statusLabel: "STATUS",
      lastMaintenanceLabel: "Last maintenance",
      save: "Save",
      cancel: "Cancel",
      statusAvailable: "Available",
      statusMission: "In mission",
      statusMaintenance: "Maintenance",
      statusOut: "Out of service",
      delete: "Delete",
      noEquipment: "No equipment registered yet",
      types: { camera: "Camera", aircraft: "Aircraft", drone: "Drone", accessory: "Accessory" }
    },
    alertBanner: {
      title: "Renewal Alert",
      expiresIn: "expires in",
      days: "days",
      relaunch: "Follow up with DTA!"
    }
  },

  ar: {
    nav: { dashboard: "الرئيسية", tracking: "المتابعة", request: "طلب", files: "الملفات", equipment: "المعدات", settings: "الإعدادات" },
    dashboard: {
      title: "لوحة التحكم",
      newRequest: "طلب جديد",
      active: "نشطة", pending: "قيد الانتظار", expired: "منتهية", missions: "المهام",
      search: "🔍 بحث...",
      globalAuth: "التراخيص العامة",
      seeAll: "عرض الكل",
      code: "الرمز", client: "العميل", endAuth: "تاريخ الانتهاء", status: "الحالة",
      statusActive: "نشطة", statusPending: "قيد الانتظار",
      validityDocs: "صلاحية الوثائق",
      expiredTag: "منتهية"
    },
    authorizations: {
      title: "التراخيص العامة",
      subtitle: "متابعة الطلبات لدى المديرية العامة للطيران المدني",
      newBtn: "+ جديد",
      filters: { all: "الكل", active: "نشطة", pending: "قيد الانتظار", expired: "منتهية" },
      statusActive: "نشطة", statusPending: "قيد الانتظار",
      submittedOn: "أودع بتاريخ",
      details: "التفاصيل",
      sendMail: "إرسال للمديرية"
    },
    newMission: {
      title: "طلب جديد",
      subtitle: "إنشاء ملف تصوير جوي",
      cancel: "إلغاء",
      step: "المرحلة",
      adminTitle: "الجهة الطالبة",
      clientLabel: "العميل الطالب",
      selectAgency: "-- اختر وكالة أو مديرية --",
      natureLabel: "نوع العملية",
      geoTitle: "التغطية الجغرافية",
      regionLabel: "جهة المغرب",
      selectRegion: "-- اختر جهة --",
      provinceLabel: "الإقليم / العمالة",
      selectProvince: "-- اختر إقليما --",
      selectZone: "اختر منطقة الطيران",
      logisticsTitle: "المطارات واللوجستيك",
      aerodromeLabel: "المطار الأساسي (رمز الإيكاو)",
      selectAerodrome: "اختر مطارا",
      endDateLabel: "تاريخ انتهاء الصلاحية المرغوب",
      crewTitle: "الطاقم والمعدات",
      pilotLabel: "الطيار القائد",
      aircraftLabel: "الطائرة / الكاميرا",
      validationTitle: "التحقق من الملف",
      validationSubtitle: "تحقق من المعلومات قبل الإرسال إلى نظام معالجة المديرية.",
      recapClient: "العميل", recapMission: "المهمة", recapRegion: "الجهة", recapProvince: "الإقليم",
      recapAerodrome: "المطار", recapPilot: "الطيار", recapAircraft: "الطائرة", recapEndDate: "انتهاء الترخيص",
      previous: "السابق", next: "التالي", save: "حفظ",
      sendMail: "📧 إرسال للمديرية"
    },
    pdf: {
      title: "الوثائق",
      subtitle: "تجميع البطاقات التقنية",
      chooseLabel: "اختر الملف المراد تجميعه",
      selectFile: "-- اختر ملف ترخيص --",
      compileBtn: "💾 تجميع وإنشاء PDF الرسمي"
    },
    settings: {
      title: "⚙️ الإعدادات",
      darkMode: "🌙 الوضع الليلي",
      language: "🌍 اللغة",
      notifications: "🔔 الإشعارات"
    },
    notifications: {
      newMission: "تم إنشاء مهمة جديدة",
      dgacApproved: "تمت الموافقة على الترخيص",
      expiringSoon: "ترخيص على وشك الانتهاء"
    },
    equipment: {
      title: "متابعة المعدات",
      subtitle: "حالة وتوفر الأسطول التقني",
      addBtn: "+ إضافة",
      total: "المجموع", available: "متاح", inMission: "في مهمة", maintenance: "الصيانة",
      formTitle: "معدة جديدة",
      nameLabel: "اسم المعدة",
      typeLabel: "النوع",
      serialLabel: "الرقم التسلسلي",
      statusLabel: "الحالة",
      lastMaintenanceLabel: "آخر صيانة",
      save: "حفظ",
      cancel: "إلغاء",
      statusAvailable: "متاح",
      statusMission: "في مهمة",
      statusMaintenance: "الصيانة",
      statusOut: "خارج الخدمة",
      delete: "حذف",
      noEquipment: "لا توجد معدات مسجلة حاليا",
      types: { camera: "كاميرا", aircraft: "طائرة", drone: "درون", accessory: "ملحقات" }
    },
    alertBanner: {
      title: "تنبيه التجديد",
      expiresIn: "ينتهي خلال",
      days: "أيام",
      relaunch: "تابع مع المديرية!"
    }
  }
};

export default function App() {
  // Gestion de la navigation par onglet
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formStep, setFormStep] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");

  // Gestion de la connexion utilisateur (session gardée sur l'appareil)
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sepret_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('sepret_user');
      }
    }
    setCheckingSession(false);
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('sepret_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('sepret_user');
    setCurrentUser(null);
  };

  const [notificationsList] = useState([
    { id: 1, key: "newMission" },
    { id: 2, key: "dgacApproved" },
    { id: 3, key: "expiringSoon" }
  ]);

  // Parc matériel de SEPRET (caméras, aéronefs, drones, accessoires)
  const [equipmentList, setEquipmentList] = useState([
    { id: 1, name: "ULTRACAM FALCON Mark2", type: "camera", serial: "UF-2021-004", status: "mission", lastMaintenance: "2026-05-10" },
    { id: 2, name: "Aéronef SEPRET-01", type: "aircraft", serial: "CN-TKV", status: "maintenance", lastMaintenance: "2026-06-01" },
    { id: 3, name: "Aéronef SEPRET-02", type: "aircraft", serial: "CN-XT 02/15", status: "disponible", lastMaintenance: "2026-04-15" }
  ]);

  // Structure centralisée du formulaire de demande
  const [formData, setFormData] = useState({
    client: '',
    type: 'Prise de vues aériennes',
    region: '',
    zone: '',
    zonePoints: [],
    aerodrome: '',
    endDate: '',
    pilot: 'FOUAD SAADI',
    equipment: 'ULTRACAM FALCON Mark2'
  });

  // Base de données globale des dossiers et missions du portail
  const [missions, setMissions] = useState([
    {
      id: 1319,
      name: "Agence du Bassin Hydraulique du Guir-Ziz-Rhéris",
      type: "Prise de vues aériennes",
      zone: "Chefchaouen (Tanger-Tétouan-Al Hoceïma)",
      date: "24/06/2026",
      expiryDate: "2026-08-05",
      status: "approved",
      pilot: "FOUAD SAADI",
      equipment: "ULTRACAM FALCON Mark2"
    },
    {
      id: 1318,
      name: "Agence du Bassin Hydraulique de Draa Oued Noun",
      type: "Prise de vues aériennes",
      zone: "Azilal (Béni Mellal-Khénifra)",
      date: "24/06/2026",
      expiryDate: "",
      status: "pending",
      pilot: "N/A",
      equipment: "N/A"
    },
    {
      id: 1317,
      name: "Agence du Bassin Hydraulique du Guir-Ziz-Rhéris",
      type: "Prise de vues aériennes",
      zone: "Khémisset (Rabat-Salé-Kénitra)",
      date: "24/06/2026",
      expiryDate: "",
      status: "pending",
      pilot: "N/A",
      equipment: "N/A"
    },
    {
      id: 1316,
      name: "Agence Urbaine Marrakech",
      type: "Prise de vues aériennes",
      zone: "El Hajeb (Fès-Meknès)",
      date: "24/06/2026",
      expiryDate: "",
      status: "pending",
      pilot: "N/A",
      equipment: "N/A"
    },
    {
      id: 1315,
      name: "Agence du Bassin Hydraulique du Tensift",
      type: "Prise de vues aériennes",
      zone: "Sidi Kacem (Rabat-Salé-Kénitra)",
      date: "24/06/2026",
      expiryDate: "2026-09-22",
      status: "approved",
      pilot: "FOUAD SAADI",
      equipment: "ULTRACAM FALCON Mark2"
    }
  ]);

  const t = texts[language];

  // Vérification automatique des alertes d'expiration (Sous 40 jours)
  useEffect(() => {
    const activeAlerts = [];
    const aujourdhui = new Date();

    missions.forEach(mission => {
      if (mission.expiryDate && mission.status === 'approved') {
        const dateExp = new Date(mission.expiryDate);
        const differenceTemps = dateExp.getTime() - aujourdhui.getTime();
        const joursRestants = Math.ceil(differenceTemps / (1000 * 60 * 60 * 24));

        if (joursRestants <= 40 && joursRestants > 0) {
          activeAlerts.push({
            id: mission.id,
            client: mission.name,
            jours: joursRestants
          });
        }
      }
    });

    setAlerts(activeAlerts);
  }, [missions]);

  // Vérification automatique des alertes de maintenance (matériel non entretenu depuis 180 jours)
  useEffect(() => {
    const activeMaintAlerts = [];
    const aujourdhui = new Date();
    const SEUIL_JOURS = 180;

    equipmentList.forEach(eq => {
      if (eq.status === 'hors_service') return;
      if (!eq.lastMaintenance) return;

      const dateMaint = new Date(eq.lastMaintenance);
      const joursDepuis = Math.floor((aujourdhui.getTime() - dateMaint.getTime()) / (1000 * 60 * 60 * 24));

      if (joursDepuis >= SEUIL_JOURS) {
        activeMaintAlerts.push({
          id: eq.id,
          name: eq.name,
          jours: joursDepuis
        });
      }
    });

    setMaintenanceAlerts(activeMaintAlerts);
  }, [equipmentList]);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  // Calcul dynamique temps réel des statistiques globales
  const stats = {
    active: missions.filter(m => m.status === 'approved').length,
    pending: missions.filter(m => m.status === 'pending').length,
    expired: missions.filter(m => m.status === 'expired').length,
    total: missions.length
  };

  // Enregistrement final et remise à zéro complète du formulaire
  const handleAddNewMission = (newMission) => {
    setMissions([newMission, ...missions]);
    setActiveTab('dashboard');
    setFormStep(1);
    setFormData({
      client: '',
      type: 'Prise de vues aériennes',
      region: '',
      zone: '',
      zonePoints: [],
      aerodrome: '',
      endDate: '',
      pilot: 'FOUAD SAADI',
      equipment: 'ULTRACAM FALCON Mark2'
    });
  };

  const isRTL = language === 'ar';

  // Tant qu'on vérifie la session, on n'affiche rien pour éviter un flash de l'écran de connexion
  if (checkingSession) return null;

  // Pas connecté → on affiche l'écran de connexion à la place de l'application
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container" dir={isRTL ? "rtl" : "ltr"}>
      {/* Affichage du bandeau d'alerte si une échéance approche */}
      {alerts.length > 0 && (
        <div className="expiration-alert-banner">
          {alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              ⚠️ <strong>{t.alertBanner.title} :</strong> N°{alert.id} ({alert.client.substring(0, 25)}...) {t.alertBanner.expiresIn} <strong>{alert.jours} {t.alertBanner.days}</strong>. {t.alertBanner.relaunch}
            </div>
          ))}
        </div>
      )}

      {/* Affichage du bandeau d'alerte si un équipement n'a pas eu de maintenance récente */}
      {maintenanceAlerts.length > 0 && (
        <div className="maintenance-alert-banner">
          {maintenanceAlerts.map((alert, index) => (
            <div key={index} className="alert-item">
              🔧 <strong>Alerte Maintenance :</strong> {alert.name} n'a pas eu de maintenance depuis <strong>{alert.jours} jours</strong>. Planifie une intervention !
            </div>
          ))}
        </div>
      )}

      {/* Rendu dynamique des fenêtres de navigation */}
      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            missions={missions}
            onNavigate={setActiveTab}
            t={t}
          />
        )}
        {activeTab === 'authorizations' && (
          <GlobalAuthorizations missions={missions} onNavigate={setActiveTab} t={t} />
        )}
        {activeTab === 'new-mission' && (
          <NewMission
            formStep={formStep}
            setFormStep={setFormStep}
            formData={formData}
            setFormData={setFormData}
            onNavigate={setActiveTab}
            onSubmit={handleAddNewMission}
            t={t}
          />
        )}
        {activeTab === 'pdf' && (
          <PDFGenerator missions={missions} onNavigate={setActiveTab} t={t} />
        )}
        {activeTab === 'equipment' && (
          <Equipment equipmentList={equipmentList} setEquipmentList={setEquipmentList} t={t} />
        )}
        {activeTab === 'settings' && (
          <div style={{ padding: '16px' }}>
            <h2
              style={{
                fontSize: "22px",
                color: "var(--primary-color)",
                marginBottom: "20px"
              }}
            >
              {t.settings.title}
            </h2>

            {/* Compte connecté */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>👤 {currentUser.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{currentUser.role}</div>
                </div>
                <button className="btn-back" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
            </div>

            {/* Mode sombre */}
            <div className="card">
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{t.settings.darkMode}</span>

                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              </label>
            </div>

            {/* Langue */}
            <div className="card">
              <label>{t.settings.language}</label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇲🇦 العربية</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="card">
              <h3>{t.settings.notifications}</h3>

              {notificationsList.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  {t.notifications[notif.key]}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Menu inférieur fixe à 5 sections */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <div className="nav-icon-wrapper">📊</div>
          <span>{t.nav.dashboard}</span>
        </button>
        <button className={`nav-item ${activeTab === 'authorizations' ? 'active' : ''}`} onClick={() => setActiveTab('authorizations')}>
          <div className="nav-icon-wrapper">📋</div>
          <span>{t.nav.tracking}</span>
        </button>
        <button className={`nav-item ${activeTab === 'new-mission' ? 'active' : ''}`} onClick={() => { setActiveTab('new-mission'); setFormStep(1); }}>
          <div className="nav-icon-wrapper">✈️</div>
          <span>{t.nav.request}</span>
        </button>
        <button className={`nav-item ${activeTab === 'pdf' ? 'active' : ''}`} onClick={() => setActiveTab('pdf')}>
          <div className="nav-icon-wrapper">💾</div>
          <span>{t.nav.files}</span>
        </button>
        <button className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`} onClick={() => setActiveTab('equipment')}>
          <div className="nav-icon-wrapper">🔧</div>
          <span>{t.nav.equipment}</span>
        </button>
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <div className="nav-icon-wrapper">⚙️</div>
          <span>{t.nav.settings}</span>
        </button>
      </nav>
    </div>
  );
}