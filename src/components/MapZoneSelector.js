import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icône numérotée personnalisée (point de départ en doré, les suivants en bleu marine)
const createNumberedIcon = (number, isFirst) => {
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      background-color: ${isFirst ? '#d4a017' : '#0f294a'};
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Capte les clics sur la carte pour ajouter un point
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Parse basique d'un fichier KML : extrait les coordonnées de toutes les balises <coordinates>
function parseKML(kmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, 'text/xml');
  const coordNodes = xml.getElementsByTagName('coordinates');
  const shapes = [];

  for (let node of coordNodes) {
    const raw = node.textContent.trim();
    const points = raw
      .split(/\s+/)
      .map(pair => {
        const [lng, lat] = pair.split(',').map(Number);
        return [lat, lng];
      })
      .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    if (points.length > 0) shapes.push(points);
  }
  return shapes;
}

// Convertit des coordonnées Degrés/Minutes/Secondes en décimal
function dmsToDecimal(deg, min, sec, direction) {
  let decimal = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
  if (direction === 'S' || direction === 'W') decimal *= -1;
  return decimal;
}

export default function MapZoneSelector({ points = [], setPoints }) {
  const [kmlShapes, setKmlShapes] = useState([]);
  const [kmlFileName, setKmlFileName] = useState('');
  const [showDMS, setShowDMS] = useState(false);
  const [dms, setDms] = useState({
    latDeg: '', latMin: '', latSec: '', latDir: 'N',
    lngDeg: '', lngMin: '', lngSec: '', lngDir: 'W'
  });

  const handleMapClick = useCallback((latlng) => {
    setPoints(prev => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
  }, [setPoints]);

  const handleKmlUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setKmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const shapes = parseKML(evt.target.result);
      setKmlShapes(shapes);
    };
    reader.readAsText(file);
  };

  const handleAddDMSPoint = () => {
    const lat = dmsToDecimal(dms.latDeg, dms.latMin, dms.latSec, dms.latDir);
    const lng = dmsToDecimal(dms.lngDeg, dms.lngMin, dms.lngSec, dms.lngDir);
    if (!isNaN(lat) && !isNaN(lng)) {
      setPoints(prev => [...prev, { lat, lng }]);
      setShowDMS(false);
      setDms({ latDeg: '', latMin: '', latSec: '', latDir: 'N', lngDeg: '', lngMin: '', lngSec: '', lngDir: 'W' });
    }
  };

  const clearAll = () => {
    setPoints([]);
    setKmlShapes([]);
    setKmlFileName('');
  };

  const polylinePositions = points.map(p => [p.lat, p.lng]);

  return (
    <div>
      {kmlFileName && (
        <div className="kml-banner">
          📎 <strong>KML (visualisation) :</strong>&nbsp;{kmlFileName}
          <span onClick={() => { setKmlShapes([]); setKmlFileName(''); }} className="kml-banner-close">✕</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <label className="btn-outline" style={{ flex: 1 }}>
          📁 Recharger KML
          <input type="file" accept=".kml" onChange={handleKmlUpload} style={{ display: 'none' }} />
        </label>
        <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowDMS(!showDMS)}>
          📍 Saisie DMS
        </button>
      </div>

      {showDMS && (
        <div className="dms-form">
          <label style={{ marginTop: 0 }}>LATITUDE</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input placeholder="°" value={dms.latDeg} onChange={e => setDms({ ...dms, latDeg: e.target.value })} />
            <input placeholder="'" value={dms.latMin} onChange={e => setDms({ ...dms, latMin: e.target.value })} />
            <input placeholder='"' value={dms.latSec} onChange={e => setDms({ ...dms, latSec: e.target.value })} />
            <select value={dms.latDir} onChange={e => setDms({ ...dms, latDir: e.target.value })} style={{ maxWidth: '70px' }}>
              <option value="N">N</option>
              <option value="S">S</option>
            </select>
          </div>

          <label>LONGITUDE</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input placeholder="°" value={dms.lngDeg} onChange={e => setDms({ ...dms, lngDeg: e.target.value })} />
            <input placeholder="'" value={dms.lngMin} onChange={e => setDms({ ...dms, lngMin: e.target.value })} />
            <input placeholder='"' value={dms.lngSec} onChange={e => setDms({ ...dms, lngSec: e.target.value })} />
            <select value={dms.lngDir} onChange={e => setDms({ ...dms, lngDir: e.target.value })} style={{ maxWidth: '70px' }}>
              <option value="W">O</option>
              <option value="E">E</option>
            </select>
          </div>

          <button type="button" className="btn-next" style={{ width: '100%' }} onClick={handleAddDMSPoint}>
            Ajouter le point
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
        <span className="chip">🗺️ {points.length} point{points.length !== 1 ? 's' : ''}</span>
        {(points.length > 0 || kmlFileName) && (
          <span className="clear-link" onClick={clearAll}>✕ Effacer</span>
        )}
      </div>

      <div style={{ height: '280px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <MapContainer center={[31.5, -6.5]} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onMapClick={handleMapClick} />

          {kmlShapes.map((shape, idx) => (
            <Polyline key={`kml-${idx}`} positions={shape} pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '6,6' }} />
          ))}

          {polylinePositions.length > 1 && (
            <Polyline positions={polylinePositions} pathOptions={{ color: '#0f294a', weight: 2 }} />
          )}

          {points.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]} icon={createNumberedIcon(idx + 1, idx === 0)}>
              <Popup>Point {idx + 1}<br />{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
        Cliquez sur la carte pour ajouter des points délimitant la zone de vol.
      </p>
    </div>
  );
}