# Changelog

All notable data updates to **topbin** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Initial data import from openfootball sources
- World Cup data: 1930–2026 (match fixtures, results, goal scorers)
- Club World Cup 2025 data
- Continental competitions metadata (UEFA Champions League, Copa Libertadores, AFC Champions League)
- Club registry: 100+ clubs across Europe, South America, North America, Asia, Africa, Pacific
- National teams: 211 FIFA member nations with confederation, ranking, titles
- Confederations: AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA
- Stadiums: 50+ major stadiums with capacity, coordinates, tenants
- Players: 50+ legendary players with career metadata and stats
- European league info: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
- JSON schemas for all data types
- Validation script
- GitHub Actions CI workflow
- Contributing guide and PR/issue templates

### Enriched (vs. source repos)
- Added attendance, referee, stadium details to World Cup matches
- Added club colors, codes, websites, capacity
- Added national team FIFA rankings, titles, nicknames
- Added stadium coordinates, year built, surface type
- Added player statistics, awards, career history
- Added continental competition data (missing from all 3 source repos)
- Unified all data format to JSON (source repos used mix of JSON + Football.TXT)

## Data Sources
- [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) — World Cup match data
- [openfootball/clubs](https://github.com/openfootball/clubs) — Club & stadium registry
- [openfootball/world](https://github.com/openfootball/world) — Non-European league fixtures
- Community enrichment — Additional metadata, missing competitions, player data
