import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { resolveMissionPilotName } from "../utils/pilotDisplay";

export default function PDFGenerator({ missions, onNavigate, t, canGeneratePdf = false, pilots = [] }) {
  const [selectedId, setSelectedId] = useState('');

  const runCompilation = () => {
    if (!canGeneratePdf) return;
    const target = missions.find(m => String(m.id) === selectedId);
    if (!target) return;
    const pilotName = resolveMissionPilotName(target, pilots);

    const doc = new jsPDF();

    // Cadre de document technique
    doc.rect(10, 10, 190, 277);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ROYAUME DU MAROC", 14, 22);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Ministère du Transport et de la Logistique", 14, 26);
    doc.text("Direction Générale de l'Aviation Civile (DGAC)", 14, 30);
    doc.text("Direction des Transports Aériens (DTA)", 14, 34);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DEMANDE D'AUTORISATION DE VOL POUR PRISE DE VUES AÉRIENNES", 20, 52);
    doc.line(14, 56, 196, 56);

    doc.setFontSize(10);
    let y = 70;
    const addRow = (label, value) => {
      doc.setFont("Helvetica", "bold");
      doc.text(label, 16, y);
      doc.setFont("Helvetica", "normal");
      doc.text(`: ${value || 'Sauf contre-indication'}`, 70, y);
      y += 12;
    };

    addRow("Numéro d'enregistrement", `SEPRET-PVA-2026-${target.id}`);
    addRow("Pétitionnaire / Client", target.name);
    addRow("Type d'aéronef affecté", "AÉROPLANE SEPRET TECHNIQUE");
    addRow("Zone d'évolution autorisée", target.zone);
    addRow("Pilote Commandant", pilotName);
    addRow("Système de Prise de Vues", target.equipment);
    addRow("Statut de l'autorisation", target.status === 'approved' ? 'FAVORABLE / SIGNÉ' : 'EN COURS D\'INSTRUCTION');

    y += 10;
    doc.line(14, y, 196, y);
    y += 12;
    doc.setFont("Helvetica", "italic");
    doc.text(`Fait à Rabat, le 26/06/2026`, 16, y);
    doc.text("Visa DTA / DGAC :", 130, y);

    doc.save(`Fiche_Technique_DGAC_${target.id}.pdf`);
  };

  return (
    <div>
      <div className="main-header" style={{ padding: '16px 0' }}>
        <div>
          <h1 className="main-title" style={{ fontSize: '22px' }}>{t.pdf.title}</h1>
          <div className="sub-title">{t.pdf.subtitle}</div>
        </div>
      </div>

      <div className="card">
        <label>{t.pdf.chooseLabel}</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ marginTop: '4px', marginBottom: '16px' }}>
          <option value="">{t.pdf.selectFile}</option>
          {missions.map(m => (
            <option key={m.id} value={m.id}>N°{m.id} — {m.name.substring(0, 35)}...</option>
          ))}
        </select>

        <button className="btn-next" style={{ width: '100%', padding: '14px', fontSize: '14px' }} onClick={runCompilation} disabled={!selectedId || !canGeneratePdf}>
          {t.pdf.compileBtn}
        </button>
      </div>
    </div>
  );
}
