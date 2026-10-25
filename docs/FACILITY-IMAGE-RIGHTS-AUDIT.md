# Facility image availability and rights audit (SFO × 26)

**Date:** 2026-10-25  
**Auditor:** Engineering Lead Cursor  
**Scope:** Browse-eligible facilities in `src/data/facilities.json`  
**Policy:** Use only assets with documented reuse rights. No Google Image scrape, no hotlinking `flysfo.com` or vendor CDNs without permission.

## Summary

| Metric | Count |
| --- | --- |
| Facilities audited | **26** |
| **Approved images in manifest** | **5** (1 venue at SFO, 4 illustrative) |
| Facilities with hero photography in UI | **5** |
| Facilities without hero (no blank placeholder) | **21** |
| Recommendation-eligible (unchanged) | **12** |

Official SFO shop/dine listings may display photography for **identification on flysfo.com only**. GateWise did **not** obtain reuse licenses, vendor releases, or SFO media-kit grants for those assets. **Hotlinking listing hero images is not approved.**

Approved imagery is registered in `src/data/facility-visual-manifest.json` and stored under `public/facility-visual/approved/`. Facilities without manifest entries **do not** show a hero image (legacy SVG fallbacks are not rendered in the UI).

### Approved manifest entries (hackathon slice)

| Facility ID | Role | Depicts SFO location? | Source |
| --- | --- | --- | --- |
| `sfo-t2-d-books-inc` | Venue | Yes (Compass Books, T2) | [Wikimedia CC0](https://commons.wikimedia.org/wiki/File:Compass_Books,_SFO.jpg) |
| `sfo-t2-d-peets-coffee-d7` | Illustrative | No | [Unsplash](https://unsplash.com/photos/coffee-beans-on-brown-wooden-table-4kgy3GP2pPE) |
| `sfo-t2-d-burger-joint` | Illustrative | No | [Unsplash](https://unsplash.com/photos/cheeseburger-on-wooden-table-1550547660) |
| `sfo-t2-d-napa-farms-market` | Illustrative | No | [Unsplash](https://unsplash.com/photos/green-vegetables-on-brown-wooden-chopping-board-1542838132) |
| `sfo-t2-d-wakaba` | Illustrative | No | [Unsplash](https://unsplash.com/photos/sushi-on-black-ceramic-plate-1617196034796) |

## How to add a facility photo later

1. Obtain written permission or a license that allows redistribution in GateWise (e.g. operator email, SFO communications, or explicit CC license tied to **this** location).
2. Add the file under `public/facility-visual/approved/<facility-id>.webp` (or `.jpg`).
3. Register in `src/data/facility-visual-manifest.json` with `rightsStatus: "approved"`, `sourceUrl`, `rightsEvidence`, and `attribution` (if required).
4. Re-run `src/lib/facility-visual-manifest.test.ts` and visual QA.

## Per-facility listing review

| Facility ID | Name | Category | Official listing | Listing imagery (typical) | Reuse for GateWise | UI in this branch |
| --- | --- | --- | --- | --- | --- | --- |
| sfo-t2-d-16th-dolores-general-store | 16th & Dolores General Store | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/16th-dolores-general-store) | Often present | **Not approved** — no license on file | Category fallback |
| sfo-t2-d-andale-mexican-kitchen-bar | Andalé Mexican Kitchen + Bar | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/andale-mexican-kitchen-bar) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-brookstone | Brookstone | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/brookstone-t2) | Often present | **Not approved** — national brand; no airport-specific grant | Category fallback |
| sfo-t2-d-burger-joint | Burger Joint | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/burger-joint) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-cat-cora | Cat Cora | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/cat-cora) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-kiehls | Kiehl's | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/kiehls) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-lark-creek-grill | Lark Creek Grill | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/lark-creek-grill) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-napa-farms-market | Napa Farms Market | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/napa-farms-market) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-peets-coffee-d7 | Peet's Coffee | coffee | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee-0) | Often present | **Not approved** — brand marks need separate trademark policy | Category fallback |
| sfo-t2-d-sunglass-hut | Sunglass Hut | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/sunglass-hut-t2) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-the-chocolate-market | The Chocolate Market | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/chocolate-market) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-wakaba | Wakaba | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/wakaba) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-vino-volo | Vino Volo | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/vino-volo) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-plant-cafe-pinkberry | The Plant Café and Pinkberry | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/plant-cafe-and-pinkberry) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-peets-coffee-d15 | Peet's Coffee (D15) | coffee | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/peets-coffee) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-books-inc | Books Inc. | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/books-inc) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-sfo-news-express | SFO News Express | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/sfo-news-express) | Often present | **Not approved** | Category fallback |
| sfo-t2-d-we-are-sfc | We are SFC | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/we-are-sfc) | Often present | **Not approved** | Category fallback |
| sfo-hm1-b-bun-mee | Bun Mee | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/bun-mee) | Often present | **Not approved** | Category fallback |
| sfo-hm1-b-bourbon-pub | Bourbon Pub | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/bourbon-pub) | Often present | **Not approved** | Category fallback |
| sfo-hm1-c-49-mile-market | 49 Mile Market | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/49-mile-market) | Often present | **Not approved** | Category fallback |
| sfo-it-a-boudin-bakery | Boudin Bakery | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/boudin-bakery) | Often present | **Not approved** | Category fallback |
| sfo-it-g-1300-on-fillmore | 1300 on Fillmore | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/1300-fillmore) | Often present | **Not approved** | Category fallback |
| sfo-t3-e-ag1 | AG1 | shop | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/ag1) | Often present | **Not approved** | Category fallback |
| sfo-t3-f-aletitude | Aletitude | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/aletitude) | Often present | **Not approved** | Category fallback |
| sfo-t3-f-amoura | Amoura | food | [flysfo](https://www.flysfo.com/passengers/shop-dine-relax/amoura) | Often present | **Not approved** | Category fallback |

## Fallback asset rights

| Asset | Path | Rights |
| --- | --- | --- |
| Food illustration | `/facility-visual/fallback-food.svg` | GateWise project asset — generic, non-photographic |
| Coffee illustration | `/facility-visual/fallback-coffee.svg` | Same |
| Shop illustration | `/facility-visual/fallback-shop.svg` | Same |

Alt text pattern: `{name} — {category} category illustration (not a photograph of this location).`
