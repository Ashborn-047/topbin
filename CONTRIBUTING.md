# Contributing to topbin ⚽

First off, thanks for wanting to contribute to the beautiful game's database! 🙌

## 📦 How to Contribute Data

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/topbin.git
cd topbin
npm install
```

### 2. Add or Update Data
All data lives in the `data/` directory as JSON files. Follow the existing schemas in `schemas/`.

### 3. Validate
```bash
node scripts/validate.js
```

### 4. Submit a PR
Open a Pull Request with a clear description of what data you're adding/updating.

---

## 📁 Data Structure

```
data/
├── competitions/     # World Cups, continental cups
├── clubs/            # Club registries by continent
├── leagues/          # League seasons by region
├── national-teams/   # National team metadata
├── stadiums/         # Global stadium registry
└── players/          # Player metadata
```

## 📐 Schema Rules

| Rule | Description |
|---|---|
| **Valid JSON** | All files must be valid JSON |
| **UTF-8** | Use UTF-8 encoding for player/club names with diacritics |
| **Dates** | Use ISO 8601 format: `YYYY-MM-DD` |
| **Times** | Include timezone: `HH:MM UTC±N` |
| **Scores** | Always use arrays: `[home, away]` |
| **Null over omit** | Use `null` for unknown values, don't omit fields |

## 🏆 What We Need

### Always Welcome
- New league season data (fixtures & results)
- World Cup squad rosters
- Club metadata updates (new stadiums, name changes)
- Stadium capacity/renovation updates
- Data corrections with reliable sources

### Coming Soon
- Transfer history
- Manager/coach records
- Referee assignments
- Historical league tables

## 🚫 What We Don't Accept
- Copyrighted data scraped from commercial APIs
- Player images or club logos (copyright issues)
- Betting odds or gambling data
- Unverified or speculative data

## 💡 Tips
- Always cite your data source in the PR description
- One PR per season/competition when possible
- Check existing issues before submitting new data
- Run validation before submitting

## 📜 License
By contributing, you agree that your contributions will be dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

---

Questions? Open an issue or reach out. Let's build the world's best football database together! ⚽
