import React, { useState } from 'react';
import {
  createEquipment,
  deleteEquipment,
  updateEquipment
} from '../services/equipmentService';
import { validateEquipmentForm } from '../utils/validation';

const getEquipmentActionErrorMessage = (error, fallback) => {
  if (error?.code === "validation/invalid-data") {
    return "Certains champs du materiel sont invalides.";
  }

  if (error?.code === "permission-denied") {
    return "Vous n'avez pas les droits necessaires pour cette action.";
  }

  if (error?.code === "unavailable" || error?.code === "deadline-exceeded") {
    return "Connexion Firestore indisponible. Reessayez plus tard.";
  }

  return fallback;
};

export default function Equipment({
  equipmentList,
  t,
  canManageEquipment = false,
  currentUser = null,
  equipmentLoading = false,
  equipmentError = "",
  onEquipmentChanged
}) {
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'camera',
    serial: '',
    status: 'available',
    model: '',
    registration: '',
    lastMaintenance: '',
    notes: ''
  });

  const statusConfig = {
    available: { label: t.equipment.statusAvailable, class: 'status-disponible' },
    disponible: { label: t.equipment.statusAvailable, class: 'status-disponible' },
    in_mission: { label: t.equipment.statusMission, class: 'status-mission' },
    mission: { label: t.equipment.statusMission, class: 'status-mission' },
    maintenance: { label: t.equipment.statusMaintenance, class: 'status-maintenance' },
    out_of_service: { label: t.equipment.statusOut, class: 'status-hors-service' },
    hors_service: { label: t.equipment.statusOut, class: 'status-hors-service' }
  };

  const stats = {
    total: equipmentList.length,
    disponible: equipmentList.filter(e => e.status === 'available' || e.status === 'disponible').length,
    mission: equipmentList.filter(e => e.status === 'in_mission' || e.status === 'mission').length,
    maintenance: equipmentList.filter(e => e.status === 'maintenance').length
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      type: 'camera',
      serial: '',
      status: 'available',
      model: '',
      registration: '',
      lastMaintenance: '',
      notes: ''
    });
    setFieldErrors({});
  };

  const reloadAfterAction = async () => {
    if (onEquipmentChanged) {
      await onEquipmentChanged();
    }
  };

  const updateNewItem = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const renderFieldError = (field) => fieldErrors[field] ? (
    <div style={{ color: "#b91c1c", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>
      {fieldErrors[field]}
    </div>
  ) : null;

  const handleAdd = async () => {
    if (!canManageEquipment || actionLoading) return;

    const validation = validateEquipmentForm(newItem);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setUserMessage("Corrigez les champs signales avant d'enregistrer l'equipement.");
      return;
    }

    setActionLoading(true);
    setUserMessage("");
    setFieldErrors({});

    try {
      await createEquipment(validation.normalizedData, currentUser);
      await reloadAfterAction();
      resetForm();
      setShowForm(false);
      setUserMessage("Equipement ajoute avec succes.");
      alert("Equipement ajoute avec succes.");
    } catch (error) {
      console.error("[Equipment] Creation impossible", {
        code: error?.code,
        message: error?.message
      });
      if (error?.validationErrors) {
        setFieldErrors(error.validationErrors);
      }

      const message = getEquipmentActionErrorMessage(
        error,
        "Impossible d'enregistrer l'equipement. Verifiez votre connexion et vos droits."
      );
      setUserMessage(message);
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canManageEquipment || actionLoading) return;

    const confirmed = window.confirm("Confirmer la suppression de cet equipement ?");
    if (!confirmed) return;

    setActionLoading(true);
    setUserMessage("");

    try {
      await deleteEquipment(id, currentUser);
      await reloadAfterAction();
      setUserMessage("Equipement supprime avec succes.");
      alert("Equipement supprime avec succes.");
    } catch (error) {
      console.error("[Equipment] Suppression impossible", {
        code: error?.code,
        message: error?.message
      });
      const message = getEquipmentActionErrorMessage(
        error,
        "Impossible de supprimer l'equipement. Verifiez votre connexion et vos droits."
      );
      setUserMessage(message);
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!canManageEquipment || actionLoading) return;

    const validation = validateEquipmentForm({ status }, { partial: true });

    if (!validation.isValid) {
      setUserMessage(validation.errors.status || "Le statut selectionne est invalide.");
      return;
    }

    setActionLoading(true);
    setUserMessage("");

    try {
      await updateEquipment(id, validation.normalizedData, currentUser);
      await reloadAfterAction();
      setUserMessage("Statut du materiel mis a jour.");
      alert("Statut du materiel mis a jour.");
    } catch (error) {
      console.error("[Equipment] Mise a jour impossible", {
        code: error?.code,
        message: error?.message
      });
      const message = getEquipmentActionErrorMessage(
        error,
        "Impossible de modifier le statut. Verifiez votre connexion et vos droits."
      );
      setUserMessage(message);
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="main-header" style={{ padding: '16px 0' }}>
        <div>
          <h1 className="main-title" style={{ fontSize: '22px' }}>{t.equipment.title}</h1>
          <div className="sub-title">{t.equipment.subtitle}</div>
        </div>
        {canManageEquipment && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)} disabled={actionLoading || equipmentLoading}>{t.equipment.addBtn}</button>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-num" style={{ color: '#64748b' }}>{stats.total}</div><div className="stat-txt">{t.equipment.total}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#10b981' }}>{stats.disponible}</div><div className="stat-txt">{t.equipment.available}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#2563eb' }}>{stats.mission}</div><div className="stat-txt">{t.equipment.inMission}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#f59e0b' }}>{stats.maintenance}</div><div className="stat-txt">{t.equipment.maintenance}</div></div>
      </div>

      {(equipmentLoading || equipmentError || userMessage) && (
        <div className="card" style={{ fontSize: '13px', color: equipmentError || Object.keys(fieldErrors).length > 0 ? '#b91c1c' : '#64748b' }}>
          {equipmentLoading ? "Chargement du materiel..." : equipmentError || userMessage}
        </div>
      )}

      {showForm && canManageEquipment && (
        <div className="card">
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--primary-color)' }}>{t.equipment.formTitle}</h3>

          <label>{t.equipment.nameLabel}</label>
          <input type="text" value={newItem.name} onChange={e => updateNewItem("name", e.target.value)} disabled={actionLoading} />
          {renderFieldError("name")}

          <label>{t.equipment.typeLabel}</label>
          <select value={newItem.type} onChange={e => updateNewItem("type", e.target.value)} disabled={actionLoading}>
            <option value="camera">{t.equipment.types.camera}</option>
            <option value="aircraft">{t.equipment.types.aircraft}</option>
            <option value="drone">{t.equipment.types.drone}</option>
            <option value="accessory">{t.equipment.types.accessory}</option>
          </select>
          {renderFieldError("type")}

          <label>{t.equipment.serialLabel}</label>
          <input type="text" value={newItem.serial} onChange={e => updateNewItem("serial", e.target.value)} disabled={actionLoading} />
          {renderFieldError("serial")}

          <label>{t.equipment.statusLabel}</label>
          <select value={newItem.status} onChange={e => updateNewItem("status", e.target.value)} disabled={actionLoading}>
            <option value="available">{t.equipment.statusAvailable}</option>
            <option value="in_mission">{t.equipment.statusMission}</option>
            <option value="maintenance">{t.equipment.statusMaintenance}</option>
            <option value="out_of_service">{t.equipment.statusOut}</option>
          </select>
          {renderFieldError("status")}

          <label>{t.equipment.lastMaintenanceLabel}</label>
          <input type="date" value={newItem.lastMaintenance} onChange={e => updateNewItem("lastMaintenance", e.target.value)} disabled={actionLoading} />
          {renderFieldError("lastMaintenance")}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn-back" style={{ flex: 1 }} onClick={() => setShowForm(false)} disabled={actionLoading}>{t.equipment.cancel}</button>
            <button className="btn-next" style={{ flex: 1 }} onClick={handleAdd} disabled={actionLoading}>{actionLoading ? "Enregistrement..." : t.equipment.save}</button>
          </div>
        </div>
      )}

      {equipmentList.length === 0 && !showForm && !equipmentLoading && (
        <div className="card" style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          {t.equipment.noEquipment}
        </div>
      )}

      {equipmentList.map(item => (
        <div className="card" key={item.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{item.name}</h4>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {t.equipment.types[item.type] || item.type} Â· {item.serial || 'â€”'}
              </div>
            </div>
            <span className={`status-badge ${statusConfig[item.status]?.class || ''}`}>
              {statusConfig[item.status]?.label || item.status}
            </span>
          </div>

          {item.lastMaintenance && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
              ðŸ”§ {t.equipment.lastMaintenanceLabel} : {item.lastMaintenance}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              disabled={!canManageEquipment || actionLoading}
              style={{ flex: 1, fontSize: '12px', padding: '6px' }}
            >
              <option value="available">{t.equipment.statusAvailable}</option>
              <option value="in_mission">{t.equipment.statusMission}</option>
              <option value="maintenance">{t.equipment.statusMaintenance}</option>
              <option value="out_of_service">{t.equipment.statusOut}</option>
            </select>
            {canManageEquipment && (
              <span
                className="clear-link"
                onClick={() => handleDelete(item.id)}
                style={{ opacity: actionLoading ? 0.5 : 1, pointerEvents: actionLoading ? 'none' : 'auto' }}
              >
                âœ• {t.equipment.delete}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
