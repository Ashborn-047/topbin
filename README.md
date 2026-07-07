<div align="center">

# ⚽ topbin

### The Ultimate Open Football Database

*Every match. Every club. Every league. One repo.*

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Data](https://img.shields.io/badge/data-JSON-blue.svg)](#data-format)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](#contributing)

</div>

---

## 🎯 What is topbin?

**topbin** is a unified, open-domain football (soccer) database that combines and enriches data from multiple sources into one comprehensive, developer-friendly repository. No API key required. Public domain. Just pure football data.

> **top bin** *(noun)*: The upper corners of the goal — where only the best shots go. Unstoppable.

---

## 📊 What's Inside

| Category | Coverage | Format |
|---|---|---|
| 🏆 **World Cups** | 1930 – 2026 (every edition) | JSON |
| 🏟️ **Club World Cup** | 2025 | JSON |
| ⚽ **Clubs** | 2,000+ clubs across 6 continents | JSON |
| 🏟️ **Stadiums** | 500+ stadiums with capacity & metadata | JSON |
| 🌍 **Leagues** | 30+ leagues worldwide | JSON |
| 🇪🇺 **European Leagues** | Premier League, La Liga, Bundesliga, Serie A, Ligue 1 | JSON |
| 🌎 **Americas** | MLS, Liga MX, Brasileirão, Argentine Primera | JSON |
| 🌏 **Asia / Pacific** | J-League, Chinese Super League, A-League | JSON |
| 🌍 **Africa / Middle East** | Egyptian Premier, Botola Pro, NPFL | JSON |
| 🏅 **National Teams** | 211 FIFA member nations with metadata | JSON |
| 👤 **Players** | Notable players with career metadata | JSON |
| 🏆 **Competitions** | Continental & domestic cup competitions | JSON |

---

## 📁 Repository Structure

```
topbin/
├── README.md
├── LICENSE
│
├── data/
│   ├── competitions/
│   │   ├── world-cups/              # FIFA World Cup 1930-2026
│   │   │   ├── 1930.json
│   │   │   ├── ...
│   │   │   └── 2026.json
│   │   ├── club-world-cup/          # FIFA Club World Cup
│   │   │   └── 2025.json
│   │   ├── continental/             # Champions League, Copa Libertadores, etc.
│   │   │   ├── uefa-champions-league.json
│   │   │   ├── copa-libertadores.json
│   │   │   └── afc-champions-league.json
│   │   └── domestic-cups/           # FA Cup, Copa del Rey, DFB-Pokal, etc.
│   │       ├── fa-cup.json
│   │       ├── copa-del-rey.json
│   │       └── dfb-pokal.json
│   │
│   ├── leagues/
│   │   ├── europe/
│   │   │   ├── england/             # Premier League
│   │   │   ├── spain/               # La Liga
│   │   │   ├── germany/             # Bundesliga
│   │   │   ├── italy/               # Serie A
│   │   │   └── france/              # Ligue 1
│   │   ├── south-america/
│   │   │   ├── brazil/              # Brasileirão
│   │   │   └── argentina/           # Primera División
│   │   ├── north-america/
│   │   │   ├── usa-canada/          # MLS
│   │   │   └── mexico/              # Liga MX
│   │   ├── asia/
│   │   │   ├── japan/               # J-League
│   │   │   └── china/               # Chinese Super League
│   │   ├── africa/
│   │   │   ├── egypt/               # Egyptian Premier League
│   │   │   ├── morocco/             # Botola Pro
│   │   │   └── nigeria/             # NPFL
│   │   └── pacific/
│   │       └── australia/           # A-League
│   │
│   ├── clubs/
│   │   ├── europe/
│   │   │   ├── england.json
│   │   │   ├── spain.json
│   │   │   ├── germany.json
│   │   │   ├── italy.json
│   │   │   ├── france.json
│   │   │   └── ...
│   │   ├── south-america/
│   │   ├── north-america/
│   │   ├── asia/
│   │   ├── africa/
│   │   └── pacific/
│   │
│   ├── national-teams/
│   │   ├── teams.json                # All 211 FIFA nations
│   │   └── confederations.json       # AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA
│   │
│   ├── stadiums/
│   │   └── stadiums.json             # Global stadium registry
│   │
│   └── players/
│       └── legends.json              # Notable players metadata
│
├── schemas/                           # JSON Schema definitions
│   ├── match.schema.json
│   ├── club.schema.json
│   ├── stadium.schema.json
│   ├── player.schema.json
│   └── team.schema.json
│
└── scripts/                           # Helper scripts
    └── validate.js                    # Schema validation
```

---

## 🔌 Data Format

All data is in **JSON** format. No special tools needed.

### Match Schema
```json
{
  "round": "Matchday 1",
  "date": "2026-06-11",
  "time": "13:00 UTC-6",
  "team1": "Mexico",
  "team2": "South Africa",
  "score": {
    "ft": [2, 0],
    "ht": [1, 0]
  },
  "goals1": [
    { "name": "Julián Quiñones", "minute": "9" },
    { "name": "Raúl Jiménez", "minute": "67" }
  ],
  "goals2": [],
  "group": "Group A",
  "stadium": "Estadio Azteca",
  "city": "Mexico City",
  "attendance": 81000,
  "referee": "TBD"
}
```

### Club Schema
```json
{
  "name": "Real Madrid CF",
  "shortName": "Real Madrid",
  "code": "RMA",
  "country": "Spain",
  "city": "Madrid",
  "founded": 1902,
  "stadium": "Santiago Bernabéu",
  "capacity": 81044,
  "league": "La Liga",
  "confederation": "UEFA",
  "colors": ["White", "Gold"],
  "aliases": ["Real", "Los Blancos", "Los Merengues"],
  "website": "https://www.realmadrid.com"
}
```

### National Team Schema
```json
{
  "name": "Brazil",
  "code": "BRA",
  "fifaCode": "BRA",
  "confederation": "CONMEBOL",
  "fifaRanking": 1,
  "titles": {
    "worldCup": 5,
    "continental": 9
  },
  "nickname": "Seleção",
  "colors": ["Yellow", "Blue"],
  "federation": "Confederação Brasileira de Futebol"
}
```

### Stadium Schema
```json
{
  "name": "Santiago Bernabéu",
  "city": "Madrid",
  "country": "Spain",
  "capacity": 81044,
  "yearBuilt": 1947,
  "surface": "Grass",
  "tenants": ["Real Madrid CF"],
  "coordinates": {
    "lat": 40.4531,
    "lng": -3.6883
  }
}
```

---

## 🚀 Quick Start

### Use as raw JSON API (No API key!)
```bash
# Fetch World Cup 2022 data
curl https://raw.githubusercontent.com/Ashborn-047/topbin/main/data/competitions/world-cups/2022.json

# Fetch English clubs
curl https://raw.githubusercontent.com/Ashborn-047/topbin/main/data/clubs/europe/england.json
```

### Use in JavaScript
```javascript
const response = await fetch(
  'https://raw.githubusercontent.com/Ashborn-047/topbin/main/data/competitions/world-cups/2022.json'
);
const worldCup2022 = await response.json();
console.log(worldCup2022.matches.length); // 64 matches
```

### Use in Python
```python
import requests

url = "https://raw.githubusercontent.com/Ashborn-047/topbin/main/data/competitions/world-cups/2022.json"
data = requests.get(url).json()
print(f"Total matches: {len(data['matches'])}")
```

---

## 📦 Data Sources & Attribution

This database combines and enriches data from multiple open-source projects:

| Source | Data | License |
|---|---|---|
| [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | World Cup match data (1930-2026) | CC0-1.0 |
| [openfootball/clubs](https://github.com/openfootball/clubs) | Global club & stadium registry | CC0-1.0 |
| [openfootball/world](https://github.com/openfootball/world) | League fixtures (non-European) | CC0-1.0 |
| Community contributions | Enriched metadata, missing data | CC0-1.0 |

---

## 🤝 Contributing

Contributions are more than welcome! Here's how:

1. **Fork** this repo
2. **Add/update** data in the `data/` directory
3. **Validate** your changes: `node scripts/validate.js`
4. **Submit** a Pull Request

### What we need help with:
- [ ] Adding more league seasons (historical data)
- [ ] Player rosters for World Cup squads
- [ ] Transfer history data
- [ ] Referee assignments for matches
- [ ] Stadium geo-coordinates
- [ ] Club trophy/honors lists

---

## 📄 License

Dedicated to the **public domain** under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

Use as you please. No restrictions. No attribution required. Just football. ⚽

---

<div align="center">

**Made with ❤️ for the beautiful game**

*If the data helped you, star the repo ⭐*

</div>
