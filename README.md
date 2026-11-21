# LEONIDA LEDGER — GTA VI Trophy Guide & Tracker

An independent, dark neon field guide to the supplied 55 PS5 trophies. Built with vanilla JavaScript and local assets, with no build step, accounts, analytics, or external runtime requests.

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/dikutuu/leonida-ledger/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/dikutuu/leonida-ledger/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

## Features

- Search, category, grade, earned status, and missable filters.
- Overall and per-grade progress, local earned checkboxes, and manual counters.
- Spoiler shield protects unearned story names, descriptions, guides, and roadmap labels.
- Trophy detail panels with own-words guidance, source labels, and roadmap placement.
- Five-stage platinum roadmap with a precautionary pre-finale review.
- Validated JSON import and export, with migration of the starter's saved checkmarks.
- Responsive layout, keyboard controls, accessible dialogs, and no external assets.

## Run

Use Node 22 or newer:

```sh
node serve.ts
```

Open http://localhost:8080. The local server serves every asset; no internet connection is required. Progress belongs to this browser and origin. Export a backup before clearing storage. Imports replace current progress.

Screenshot views: `/?detail=3`, `/?view=roadmap`, and `/?filter=missable`.

## Data & method

The starter identifies its data as the official PlayStation trophy list dated 2026-11-18. All 55 IDs, names, descriptions, and grades are preserved exactly. This entry does not independently authenticate the list. Guides are original wording based on the supplied descriptions; source names are reference labels, not claims of externally verified citations.

Pre-release mechanics and unknown story timing are explicitly marked unconfirmed. Unsupported counts from the original one-line hints have been removed. Numeric targets are retained only when stated in descriptions, including contextual numbers such as chapter numbers, wanted levels, and completion percentages. Counters are manual and never automatically award trophies.

No supplied description establishes a one-time or story-window requirement, so no trophy is asserted to be missable. This is not a claim that all trophies are obtainable after the story; roadmap stage 2 is a precautionary checkpoint. No online requirement is stated either.

## Verify the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This produces `out/dossier.json` with the unchanged vendored dossier implementation. Remove the generated `out/` directory after verification.

Fan-made and unofficial; not affiliated with Rockstar Games. Original code is MIT licensed; see LICENSE.
