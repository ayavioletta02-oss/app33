// Liste complète des aérodromes du Maroc (civils + militaires)
// Format : code OACI, nom, ville, région, coordonnées GPS (pour usage carte future)

const aerodromesData = [
  { code: "GMAD", name: "Al Massira", city: "Agadir", region: "Souss-Massa", lat: 30.3250, lng: -9.4131 },
  { code: "GMAA", name: "Inezgane", city: "Agadir", region: "Souss-Massa", lat: 30.3811, lng: -9.5461 },
  { code: "GMTA", name: "Cherif Al Idrissi", city: "Al Hoceïma", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.1769, lng: -3.8394 },
  { code: "GMMB", name: "Benslimane", city: "Benslimane", region: "Casablanca-Settat", lat: 33.6556, lng: -7.2214 },
  { code: "GMMD", name: "Beni Mellal", city: "Béni Mellal", region: "Béni Mellal-Khénifra", lat: 32.4000, lng: -6.3167 },
  { code: "GMFB", name: "Bouarfa", city: "Bouarfa", region: "Oriental", lat: 32.5144, lng: -1.9783 },
  { code: "GMMC", name: "Anfa", city: "Casablanca", region: "Casablanca-Settat", lat: 33.5569, lng: -7.6606 },
  { code: "GMMN", name: "Mohammed V International", city: "Casablanca", region: "Casablanca-Settat", lat: 33.3672, lng: -7.5897 },
  { code: "GMMT", name: "Tit Mellil", city: "Casablanca", region: "Casablanca-Settat", lat: 33.5944, lng: -7.4639 },
  { code: "GMMJ", name: "El Jadida", city: "El Jadida", region: "Casablanca-Settat", lat: 33.2333, lng: -8.5208 },
  { code: "GMFK", name: "Moulay Ali Cherif", city: "Errachidia", region: "Drâa-Tafilalet", lat: 31.9475, lng: -4.3983 },
  { code: "GMMI", name: "Mogador", city: "Essaouira", region: "Marrakech-Safi", lat: 31.3975, lng: -9.6817 },
  { code: "GMFF", name: "Saïss", city: "Fès", region: "Fès-Meknès", lat: 33.9272, lng: -4.9781 },
  { code: "GMFU", name: "Sefrou", city: "Fès", region: "Fès-Meknès", lat: 34.0056, lng: -4.9656 },
  { code: "GMAG", name: "Guelmim", city: "Guelmim", region: "Guelmim-Oued Noun", lat: 29.0167, lng: -10.0678 },
  { code: "GMFI", name: "Ifrane", city: "Ifrane", region: "Fès-Meknès", lat: 33.5053, lng: -5.1528 },
  { code: "GMMX", name: "Marrakech Ménara", city: "Marrakech", region: "Marrakech-Safi", lat: 31.6069, lng: -8.0364 },
  { code: "GMMW", name: "Nador Al Aroui", city: "Nador", region: "Oriental", lat: 34.9889, lng: -3.0283 },
  { code: "GMMZ", name: "Ouarzazate", city: "Ouarzazate", region: "Drâa-Tafilalet", lat: 30.9392, lng: -6.9094 },
  { code: "GMFA", name: "Ouezzane", city: "Ouezzane", region: "Tanger-Tétouan-Al Hoceïma", lat: 34.7931, lng: -5.6339 },
  { code: "GMFO", name: "Angads", city: "Oujda", region: "Oriental", lat: 34.7872, lng: -1.9239 },
  { code: "GMME", name: "Rabat-Salé", city: "Rabat / Salé", region: "Rabat-Salé-Kénitra", lat: 34.0514, lng: -6.7514 },
  { code: "GMMS", name: "Safi", city: "Safi", region: "Marrakech-Safi", lat: 32.2731, lng: -9.2369 },
  { code: "GMMF", name: "Sidi Ifni", city: "Sidi Ifni", region: "Guelmim-Oued Noun", lat: 29.3689, lng: -10.1803 },
  { code: "GMTT", name: "Ibn Battouta", city: "Tanger", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.7269, lng: -5.9169 },
  { code: "GMAT", name: "Plage Blanche", city: "Tan-Tan", region: "Guelmim-Oued Noun", lat: 28.4483, lng: -11.1614 },
  { code: "GMMO", name: "Taroudant", city: "Taroudant", region: "Souss-Massa", lat: 30.5025, lng: -8.8236 },
  { code: "GMFZ", name: "Taza", city: "Taza", region: "Fès-Meknès", lat: 34.2319, lng: -3.9500 },
  { code: "GMTN", name: "Sania Ramel", city: "Tétouan", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.5944, lng: -5.3200 },
  { code: "GMAZ", name: "Zagora", city: "Zagora", region: "Drâa-Tafilalet", lat: 30.2667, lng: -5.8572 },
  // Bases militaires (Forces Royales Air)
  { code: "GMFM", name: "Bassatine (Base militaire)", city: "Meknès", region: "Fès-Meknès", lat: 33.8792, lng: -5.5150 },
  { code: "GMMY", name: "Kénitra (Base militaire)", city: "Kénitra", region: "Rabat-Salé-Kénitra", lat: 34.2989, lng: -6.5958 },
  { code: "GMSL", name: "Sidi Slimane (Base militaire)", city: "Sidi Slimane", region: "Rabat-Salé-Kénitra", lat: 34.2306, lng: -6.0503 }
];

// Export au format simple "CODE-Ville" pour compatibilité avec le formulaire existant
const aerodromes = aerodromesData.map(a => `${a.code}-${a.city}`);

export default aerodromes;
export { aerodromesData };