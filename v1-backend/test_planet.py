import requests
import json

PLANET_API_KEY = "PLAKee98effad98f4d33a6088b6cf23b263b"

coords = [[19.05,47.48],[19.08,47.48],[19.08,47.46],[19.05,47.46],[19.05,47.48]]

geojson_geometry = {
  "type": "Polygon",
  "coordinates": [ coords ]
}

geometry_filter = {
  "type": "GeometryFilter",
  "field_name": "geometry",
  "config": geojson_geometry
}

date_filter = {
  "type": "DateRangeFilter",
  "field_name": "acquired",
  "config": {
    "gte": "2026-04-01T00:00:00.000Z",
    "lte": "2026-04-26T00:00:00.000Z"
  }
}

combined_filter = {
  "type": "AndFilter",
  "config": [geometry_filter, date_filter]
}

search_request = {
  "item_types": ["PSScene"],
  "filter": combined_filter
}

res = requests.post(
    'https://api.planet.com/data/v1/quick-search',
    auth=(PLANET_API_KEY, ''),
    json=search_request
)
print(res.status_code)
d = res.json()
if "features" in d and len(d["features"]) > 0:
    print(d["features"][0]["properties"]["acquired"])
    print(d["features"][0]["properties"]["cloud_cover"])
else:
    print("No features", d)
