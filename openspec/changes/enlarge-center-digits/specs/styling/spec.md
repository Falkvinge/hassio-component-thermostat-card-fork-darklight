## MODIFIED Requirements

### Requirement: Typography hierarchy

The dial text labels SHALL follow a consistent size hierarchy. The ambient/target center labels — the primary at-a-glance readout — SHALL be large enough to read from across a room.

#### Scenario: Font sizes
- **WHEN** the dial is rendered
- **THEN** `--target` and `--ambient` labels are **150px bold**, `--low` and `--high` labels are 90px bold, `--ring` labels are 22px bold, `--title` labels are **32px**, superscript for target/ambient is 40px, superscript for low/high is 30px

#### Scenario: Font family
- **WHEN** dial text is rendered
- **THEN** it uses `Helvetica, sans-serif` with `text-anchor: middle` and `alignment-baseline: central`

#### Scenario: Center digits legible at distance
- **WHEN** the card is rendered on a typical wall-mounted dashboard at the default 300px max-width
- **THEN** the ambient/target digits remain within the ring-ticks interior and do not visually collide with the tick ring
