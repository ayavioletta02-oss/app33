import React, { useState } from 'react';

export default function Equipment({ equipmentList, setEquipmentList, t }) {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', type: 'camera', serial: '', status: 'disponible', lastMaintenance: ''
  });

  const statusConfig = {
    disponible: { label: t.equipment.statusAvailable, class: 'status-disponible' },
    mission: { label: t.equipment.statusMission, class: 'status-mission' },
    maintenance: { label: t.equipment.statusMaintenance, class: 'status-maintenance' },
    hors_service: { label: t.equipment.statusOut, class: 'status-hors-service' }
  };

  const stats = {
    total: equipmentList.length,
    disponible: equipmentList.filter(e => e.status === 'disponible').length,
    mission: equipmentList.filter(e => e.status === 'mission').length,
    maintenance: equipmentList.filter(e => e.status === 'maintenance').length
  };

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    setEquipmentList(prev => [{ ...newItem, id: Date.now() }, ...prev]);
    setNewItem({ name: '', type: 'camera', serial: '', status: 'disponible', lastMaintenance: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
  };

  const handleStatusChange = (id, status) => {
    setEquipmentList(prev => prev.map(e => (e.id === id ? { ...e, status } : e)));
  };

  return (
    <div>
      <div className="main-header" style={{ padding: '16px 0' }}>
        <div>
          <h1 className="main-title" style={{ fontSize: '22px' }}>{t.equipment.title}</h1>
          <div className="sub-title">{t.equipment.subtitle}</div>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>{t.equipment.addBtn}</button>
      </div>

      <div className="stat-grid">
        <div className="stat-box"><div className="stat-num" style={{ color: '#64748b' }}>{stats.total}</div><div className="stat-txt">{t.equipment.total}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#10b981' }}>{stats.disponible}</div><div className="stat-txt">{t.equipment.available}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#2563eb' }}>{stats.mission}</div><div className="stat-txt">{t.equipment.inMission}</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color: '#f59e0b' }}>{stats.maintenance}</div><div className="stat-txt">{t.equipment.maintenance}</div></div>
      </div>

      {showForm && (
        <div className="card">
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--primary-color)' }}>{t.equipment.formTitle}</h3>

          <label>{t.equipment.nameLabel}</label>
          <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />

          <label>{t.equipment.typeLabel}</label>
          <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
            <option value="camera">{t.equipment.types.camera}</option>
            <option value="aircraft">{t.equipment.types.aircraft}</option>
            <option value="drone">{t.equipment.types.drone}</option>
            <option value="accessory">{t.equipment.types.accessory}</option>
          </select>

          <label>{t.equipment.serialLabel}</label>
          <input type="text" value={newItem.serial} onChange={e => setNewItem({ ...newItem, serial: e.target.value })} />

          <label>{t.equipment.statusLabel}</label>
          <select value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })}>
            <option value="disponible">{t.equipment.statusAvailable}</option>
            <option value="mission">{t.equipment.statusMission}</option>
            <option value="maintenance">{t.equipment.statusMaintenance}</option>
            <option value="hors_service">{t.equipment.statusOut}</option>
          </select>

          <label>{t.equipment.lastMaintenanceLabel}</label>
          <input type="date" value={newItem.lastMaintenance} onChange={e => setNewItem({ ...newItem, lastMaintenance: e.target.value })} />

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn-back" style={{ flex: 1 }} onClick={() => setShowForm(false)}>{t.equipment.cancel}</button>
            <button className="btn-next" style={{ flex: 1 }} onClick={handleAdd}>{t.equipment.save}</button>
          </div>
        </div>
      )}

      {equipmentList.length === 0 && !showForm && (
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
                {t.equipment.types[item.type] || item.type} · {item.serial || '—'}
              </div>
            </div>
            <span className={`status-badge ${statusConfig[item.status]?.class || ''}`}>
              {statusConfig[item.status]?.label || item.status}
            </span>
          </div>

          {item.lastMaintenance && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
              🔧 {t.equipment.lastMaintenanceLabel} : {item.lastMaintenance}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              style={{ flex: 1, fontSize: '12px', padding: '6px' }}
            >
              <option value="disponible">{t.equipment.statusAvailable}</option>
              <option value="mission">{t.equipment.statusMission}</option>
              <option value="maintenance">{t.equipment.statusMaintenance}</option>
              <option value="hors_service">{t.equipment.statusOut}</option>
            </select>
            <span className="clear-link" onClick={() => handleDelete(item.id)}>✕ {t.equipment.delete}</span>
          </div>
        </div>
      ))}
    </div>
  );
}