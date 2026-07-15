import React, { useState } from 'react';

// Remplace ces adresses par les vraies adresses officielles de la DGAC et de la DTA
const DGAC_EMAIL = "dgac@aviation.gov.ma";
const DTA_EMAIL = "dta@aviation.gov.ma";

// Construit le lien mailto pre-rempli avec les informations du dossier
function buildMailto(mission) {
  const subject = encodeURIComponent(`Demande d'autorisation de vol PVA - Dossier N°${mission.id}`);
  const body = encodeURIComponent(
`Bonjour,

Nous sollicitons une autorisation de vol pour prise de vues aériennes concernant le dossier suivant :

Dossier N° : ${mission.id}
Client : ${mission.name}
Type de mission : ${mission.type}
Zone : ${mission.zone}
Pilote : ${mission.pilot}
Équipement : ${mission.equipment}
Date de fin de validité souhaitée : ${mission.expiryDate || 'N/A'}

Merci de bien vouloir traiter cette demande dans les meilleurs délais.

Cordialement,
SEPRET`
  );
  return `mailto:${DGAC_EMAIL},${DTA_EMAIL}?subject=${subject}&body=${body}`;
}

// Lien Gmail web : marche toujours dans le navigateur, sans appli mail configuree
function buildGmailLink(mission) {
  const subject = `Demande d'autorisation de vol PVA - Dossier N°${mission.id}`;
  const body =
`Bonjour,

Nous sollicitons une autorisation de vol pour prise de vues aériennes concernant le dossier suivant :

Dossier N° : ${mission.id}
Client : ${mission.name}
Type de mission : ${mission.type}
Zone : ${mission.zone}
Pilote : ${mission.pilot}
Équipement : ${mission.equipment}
Date de fin de validité souhaitée : ${mission.expiryDate || 'N/A'}

Merci de bien vouloir traiter cette demande dans les meilleurs délais.

Cordialement,
SEPRET`;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(`${DGAC_EMAIL},${DTA_EMAIL}`)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function GlobalAuthorizations({ missions, onNavigate, t, canManageSensitiveData = false }) {
  const [filter, setFilter] = useState('Toutes');

  const filterKeys = {
    Toutes: 'all',
    Actives: 'active',
    'En attente': 'pending',
    Expirées: 'expired'
  };

  const filteredMissions = missions.filter(m => {
    if (filter === 'Actives') return m.status === 'approved';
    if (filter === 'En attente') return m.status === 'pending';
    if (filter === 'Expirées') return m.status === 'expired';
    return true;
  });

  return (
    <div>
      <div className="main-header" style={{ padding: '16px 0' }}>
        <div>
          <h1 className="main-title" style={{ fontSize: '22px' }}>{t.authorizations.title}</h1>
          <div className="sub-title">{t.authorizations.subtitle}</div>
        </div>
        {canManageSensitiveData && (
          <button className="btn-add" onClick={() => onNavigate('new-mission')}>{t.authorizations.newBtn}</button>
        )}
      </div>

      {/* Filtres de selection */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['Toutes', 'Actives', 'En attente', 'Expirées'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0',
              backgroundColor: filter === f ? '#0f294a' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {t.authorizations.filters[filterKeys[f]]}
          </button>
        ))}
      </div>

      {/* Cartes de Demandes */}
      {filteredMissions.map((m) => (
        <div className="card" key={m.id} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
              N°{m.id}
            </span>
            <span className={`status-badge ${m.status === 'approved' ? 'status-active' : 'status-en-attente'}`}>
              {m.status === 'approved' ? t.authorizations.statusActive : t.authorizations.statusPending}
            </span>
          </div>
          <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: '700' }}>{m.name}</h4>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>{m.type}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#475569' }}>📍 {m.zone}</p>
          {m.cost > 0 && (
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>💰 {m.cost.toLocaleString('fr-FR')} MAD ({m.days} j)</p>
          )}
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📤 {t.authorizations.submittedOn} {m.date}</span>
            <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>👁️ {t.authorizations.details}</span>
          </div>
          {/* Controle frontend temporaire : les envois sensibles restent a proteger cote serveur. */}
          {canManageSensitiveData && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  alignItems: "center"
                }}
              >
                <a
                  href={buildGmailLink(m)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    background: "#b91c1c",
                    color: "#fff",
                    textDecoration: "none",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "14px",
                    transition: "0.3s"
                  }}
                >
                  📧 {t.authorizations.sendMail}
                </a>

                <a
                  href={buildMailto(m)}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textDecoration: "none",
                    fontSize: "22px",
                    border: "1px solid #e2e8f0"
                  }}
                  title="Application Mail"
                >
                  ✉️
                </a>
              </div>
              <a
                href={buildMailto(m)}
                style={{ display: 'block', textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}
              >
                ou ouvrir avec l'application mail
              </a>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
