import React, { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { resolveMissionPilotName } from "../utils/pilotDisplay";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#14b8a6",
  "#84cc16"
];

export default function Dashboard({
  stats,
  missions,
  onNavigate,
  t,
  pilots = []
}) {

  const [search, setSearch] = useState("");

  /* ==========================
      RECHERCHE TEMPS REEL
  ========================== */

  const filteredMissions = useMemo(() => {

    return missions.filter((mission) => {

      const value = search.toLowerCase();

      return (

        String(mission.id).includes(value)

        ||

        mission.name.toLowerCase().includes(value)

        ||

        (mission.zone || "").toLowerCase().includes(value)

        ||

        (mission.type || "").toLowerCase().includes(value)

        ||

        resolveMissionPilotName(mission, pilots).toLowerCase().includes(value)

        ||

        (mission.equipment || "").toLowerCase().includes(value)

      );

    });

  }, [missions, pilots, search]);



  /* ==========================
      STATISTIQUES PAR MOIS
  ========================== */

  const monthStats = [
    { month: "Jan", total: 5 },
    { month: "Fév", total: 7 },
    { month: "Mar", total: 6 },
    { month: "Avr", total: 11 },
    { month: "Mai", total: 9 },
    { month: "Juin", total: stats.total }
  ];


  /* ==========================
      MISSIONS PAR REGION
  ========================== */

  const regions = {};

  missions.forEach((mission) => {

    if (!mission.zone) return;

    const region = mission.zone.split("(")[0];

    if (!regions[region])

      regions[region] = 0;

    regions[region]++;

  });

  const regionStats = Object.keys(regions).map((r) => ({

    name: r,

    value: regions[r]

  }));


  /* ==========================
      POURCENTAGE DOSSIERS
  ========================== */

  const completed = stats.active;

  const total = stats.total === 0 ? 1 : stats.total;

  const progress = Math.round(
    completed / total * 100
  );

  // Styles du tableau "Autorisations récentes" (avant : aucun espacement défini)
  const thStyle = {
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "11px",
    color: "#94a3b8",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap"
  };

  const tdStyle = {
    padding: "10px",
    fontSize: "13px",
    verticalAlign: "top",
    borderBottom: "1px solid #f8fafc",
    lineHeight: "1.4"
  };

  return (
   <div className="fade-in">

<div className="dashboard-header">

<div>

<h1 className="main-title">

{t.dashboard.title}

</h1>

<div className="sub-title">

Aviation Portal • DGAC Maroc

</div>

</div>

<button

className="btn-add"

onClick={() => onNavigate("new-mission")}

>

✈ Nouvelle mission

</button>

</div>



<div className="search-container">

<span className="search-icon">

🔍

</span>

<input

type="text"

placeholder={t.dashboard.search}

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>

</div>



<div className="stat-grid">

<div className="stat-box">

<div className="stat-num">

{stats.active}

</div>

<div className="stat-txt">

{t.dashboard.active}

</div>

</div>



<div className="stat-box">

<div className="stat-num">

{stats.pending}

</div>

<div className="stat-txt">

{t.dashboard.pending}

</div>

</div>



<div className="stat-box">

<div className="stat-num">

{stats.expired}

</div>

<div className="stat-txt">

{t.dashboard.expired}

</div>

</div>



<div className="stat-box">

<div className="stat-num">

{stats.total}

</div>

<div className="stat-txt">

{t.dashboard.missions}

</div>

</div>

</div>



<div className="card">

<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:10
}}
>

<b>

Progression globale

</b>

<b>

{progress}%

</b>

</div>

<div className="progress">

<div

className="progress-value"

style={{

width:`${progress}%`

}}

></div>

</div>

</div>
<div className="card">
  <h3 style={{ marginBottom: 20 }}>📊 Missions par mois</h3>

  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={monthStats}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
<div className="card">
  <h3 style={{ marginBottom: 20 }}>🗺 Missions par région</h3>

  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={regionStats}
        dataKey="value"
        nameKey="name"
        outerRadius={90}
        label
      >
        {regionStats.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>
<div className="card">

<h3 style={{marginBottom:20}}>
Autorisations récentes
</h3>

<table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>

<thead>

<tr>

<th style={thStyle}>ID</th>

<th style={thStyle}>Client</th>

<th style={thStyle}>Zone</th>

<th style={{ ...thStyle, textAlign: "right" }}>Statut</th>

</tr>

</thead>

<tbody>

{filteredMissions.slice(0,5).map((mission)=>(

<tr key={mission.id}>

<td style={{ ...tdStyle, fontWeight: 700, whiteSpace: "nowrap", paddingRight: "16px" }}>{mission.id}</td>

<td style={{ ...tdStyle, maxWidth: "160px" }}>{mission.name}</td>

<td style={{ ...tdStyle, color: "#64748b", maxWidth: "150px" }}>{mission.zone}</td>

<td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>

<span
className={`status-badge ${
mission.status==="approved"
?
"status-active"
:
"status-en-attente"
}`}
style={{ fontSize: "11px", padding: "4px 8px" }}
>

{mission.status==="approved"
?
"Active"
:
"En attente"}

</span>

</td>

</tr>

))}

</tbody>

</table>

</div>
</div>
);
}
