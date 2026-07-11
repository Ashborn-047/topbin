# Data Sources & Licensing Registry

This registry tracks the origin, licensing status, and retrieval metadata of the datasets ingested into `topbin`.

## Sources

### 1. openfootball Club Archives
- **Description**: Raw lists of clubs, stadiums, and properties organized by continent and country.
- **Home Page**: [github.com/openfootball](https://github.com/openfootball)
- **Local Path**: `data/clubs/archive/`
- **License**: Creative Commons CC0 1.0 Universal (Public Domain Dedication)
- **Status**: Active (Pilot starting with England)

### 2. openfootball World Cup Archive
- **Description**: Historical World Cup tournament data (schedules, matches, scores, goals).
- **Home Page**: [github.com/openfootball/world-cup](https://github.com/openfootball/world-cup)
- **License**: Creative Commons CC0 1.0 Universal (Public Domain Dedication)
- **Status**: Partially completed ingestion

### 3. Wikidata
- **Description**: Wikipedia's structured database, used for disambiguating club names and retrieving stable `wikidata_qid` properties.
- **Home Page**: [wikidata.org](https://www.wikidata.org)
- **License**: Creative Commons CC0 1.0 Universal (Public Domain Dedication)
- **Status**: Integrated as a dynamic API resolution step in ingestion
