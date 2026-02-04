# UnderGround Roadmap

## Current Status (03 Feb 2026)

- **Victoria line**: Complete with depths, twin tunnels, station shafts
- **Camera framing**: Auto-focuses on visible lines
- **Mobile UX**: OrbitControls with explicit touch gestures, collapsible HUD
- **Station depths CSV**: 16 Victoria stations (complete), Bakerloo (23 stations added, depths TODO), Central (9 stations added, depths TODO)

## Immediate Tasks

### Depth Accuracy
- [ ] Extract Bakerloo depths from `data/sources/london-underground-depth-diagrams.pdf`
- [ ] Extract Central depths from PDF
- [ ] Research Jubilee, Northern, Piccadilly depths (Wikipedia, TfL archives)
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
- [x] Generalize shaft loader for any line ID

## Technical Debt
- [ ] Depth heuristics for lines without CSV data
- [ ] Cache TfL data more aggressively for offline demos

## Notes
- Station depths CSV format: `naptan_id,name,depth_m,source_url,notes`
- Prefer `depth-diagrams-pdf` source when available, fallback to `wikipedia-estimate`
