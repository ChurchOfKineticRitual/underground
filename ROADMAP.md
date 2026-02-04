# UnderGround Roadmap

## Current Status (04 Feb 2026)

- **Deep tube lines with shafts**: Victoria (16), Bakerloo (25), Central (22), Jubilee (27), Northern (12), Piccadilly (28), Waterloo & City (2)
- **Camera framing**: Auto-focuses on visible lines
- **Mobile UX**: OrbitControls with explicit touch gestures, collapsible HUD
- **Station depths CSV**: 16 Victoria stations with accurate depths; other lines use heuristic depths

## Immediate Tasks

### Depth Accuracy
- [ ] Extract Bakerloo depths from `data/sources/london-underground-depth-diagrams.pdf`
- [ ] Extract Central depths from PDF
- [ ] Research Jubilee, Northern, Piccadilly, Waterloo & City depths (Wikipedia, TfL archives)
- [ ] Add depth interpolation for stations between known anchors

### Twin Tunnels
- [x] Extracted offset constant `TUNNEL_OFFSET_METRES = 1.15`
- [ ] Visual pass: confirm ~5-10m separation looks right at various zoom levels

### Terrain Heightmap
- [ ] Download EA LiDAR tiles per `scripts/ea-dtm-tiles.md`
- [ ] Generate heightmap PNG + JSON
- [ ] Snap Victoria shaft ground cubes to terrain surface

### New Lines
- [x] Add Bakerloo line shafts (25 stations, heuristic depths)
- [x] Add Central line shafts (22 stations, heuristic depths)
- [x] Add Jubilee line shafts (27 stations, heuristic depths)
- [x] Add Northern line shafts (12 stations, heuristic depths)
- [x] Add Piccadilly line shafts (28 stations, heuristic depths)
- [x] Add Waterloo & City line shafts (2 stations, heuristic depths)
- [x] Generalize shaft loader for any line ID
- [ ] Sub-surface lines (Circle, District, H&C, Metropolitan) - cut-and-cover, lower priority

## Technical Debt
- [ ] Depth heuristics for lines without CSV data
- [ ] Cache TfL data more aggressively for offline demos

## Notes
- Station depths CSV format: `naptan_id,name,depth_m,source_url,notes`
- Prefer `depth-diagrams-pdf` source when available, fallback to `wikipedia-estimate`
