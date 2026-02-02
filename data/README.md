# Data

## station_depths.csv
A curated set of depth anchors for Underground stations/platforms.

- `depth_m` is metres **below ground** at/near the station (positive number).
- We use this to compute an approximate Z coordinate:

`platform_elevation ≈ ground_elevation - depth_m`

Ground elevation is currently approximated (no DEM yet). Later we can sample OS Terrain 5/50.

### Why curated?
TfL APIs provide station locations and route sequences, but do not reliably expose platform depths.
So we maintain a source-cited table and improve it over time.
