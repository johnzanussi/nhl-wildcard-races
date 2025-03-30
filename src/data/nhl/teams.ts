export const teams ={
    "ANA": {
        "id": 24,
        "name": "Anaheim Ducks",
        "code": "ANA"
    },
    "BOS": {
        "id": 6,
        "name": "Boston Bruins",
        "code": "BOS"
    },
    "BUF": {
        "id": 7,
        "name": "Buffalo Sabres",
        "code": "BUF"
    },
    "CAR": {
        "id": 12,
        "name": "Carolina Hurricanes",
        "code": "CAR"
    },
    "CBJ": {
        "id": 29,
        "name": "Columbus Blue Jackets",
        "code": "CBJ"
    },
    "CGY": {
        "id": 20,
        "name": "Calgary Flames",
        "code": "CGY"
    },
    "CHI": {
        "id": 16,
        "name": "Chicago Blackhawks",
        "code": "CHI"
    },
    "COL": {
        "id": 21,
        "name": "Colorado Avalanche",
        "code": "COL"
    },
    "DAL": {
        "id": 25,
        "name": "Dallas Stars",
        "code": "DAL"
    },
    "DET": {
        "id": 17,
        "name": "Detroit Red Wings",
        "code": "DET"
    },
    "EDM": {
        "id": 22,
        "name": "Edmonton Oilers",
        "code": "EDM"
    },
    "FLA": {
        "id": 13,
        "name": "Florida Panthers",
        "code": "FLA"
    },
    "LAK": {
        "id": 26,
        "name": "Los Angeles Kings",
        "code": "LAK"
    },
    "MIN": {
        "id": 30,
        "name": "Minnesota Wild",
        "code": "MIN"
    },
    "MTL": {
        "id": 8,
        "name": "Montréal Canadiens",
        "code": "MTL"
    },
    "NJD": {
        "id": 1,
        "name": "New Jersey Devils",
        "code": "NJD"
    },
    "NSH": {
        "id": 18,
        "name": "Nashville Predators",
        "code": "NSH"
    },
    "NYI": {
        "id": 2,
        "name": "New York Islanders",
        "code": "NYI"
    },
    "NYR": {
        "id": 3,
        "name": "New York Rangers",
        "code": "NYR"
    },
    "OTT": {
        "id": 9,
        "name": "Ottawa Senators",
        "code": "OTT"
    },
    "PHI": {
        "id": 4,
        "name": "Philadelphia Flyers",
        "code": "PHI"
    },
    "PIT": {
        "id": 5,
        "name": "Pittsburgh Penguins",
        "code": "PIT"
    },
    "SEA": {
        "id": 55,
        "name": "Seattle Kraken",
        "code": "SEA"
    },
    "SJS": {
        "id": 28,
        "name": "San Jose Sharks",
        "code": "SJS"
    },
    "STL": {
        "id": 19,
        "name": "St. Louis Blues",
        "code": "STL"
    },
    "TBL": {
        "id": 14,
        "name": "Tampa Bay Lightning",
        "code": "TBL"
    },
    "TOR": {
        "id": 10,
        "name": "Toronto Maple Leafs",
        "code": "TOR"
    },
    "UTA": {
        "id": 59,
        "name": "Utah Hockey Club",
        "code": "UTA"
    },
    "VAN": {
        "id": 23,
        "name": "Vancouver Canucks",
        "code": "VAN"
    },
    "VGK": {
        "id": 54,
        "name": "Vegas Golden Knights",
        "code": "VGK"
    },
    "WPG": {
        "id": 52,
        "name": "Winnipeg Jets",
        "code": "WPG"
    },
    "WSH": {
        "id": 15,
        "name": "Washington Capitals",
        "code": "WSH"
    }
} as const;

export type TeamCode = keyof typeof teams;
