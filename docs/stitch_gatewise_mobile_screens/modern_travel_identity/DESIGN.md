---
name: Modern Travel Identity
colors:
  surface: '#faf9fd'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#434656'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#0549f3'
  primary: '#003ed7'
  on-primary: '#ffffff'
  primary-container: '#2457ff'
  on-primary-container: '#e9eaff'
  inverse-primary: '#b8c3ff'
  secondary: '#5a5f68'
  on-secondary: '#ffffff'
  secondary-container: '#dee2ed'
  on-secondary-container: '#60656e'
  tertiary: '#972c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c13a00'
  on-tertiary-container: '#ffe6df'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0036bc'
  secondary-fixed: '#dee2ed'
  secondary-fixed-dim: '#c2c6d1'
  on-secondary-fixed: '#171c23'
  on-secondary-fixed-variant: '#424750'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#842500'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system projects a confident, architectural, and frictionless travel intelligence aesthetic. Built for frequent travelers, transit navigators, and modern explorers, the interface communicates reliability, absolute clarity, and precision under dynamic conditions. 

The visual style synthesizes Swiss-inspired minimalism with contemporary travel platform engineering:
- **Clean Structure:** Strict spatial discipline, large photographic windows, and high information-density cards that avoid visual clutter.
- **Atmospheric Contrast:** High-contrast typographic hierarchy balancing an off-white background with a vibrant cobalt electric accent.
- **Flat Precision:** Physical skeuomorphism and heavy drop shadows are eliminated in favor of hairline dividers, micro-tints, and flat layered surfaces that prioritize speed and legibility at a glance.

## Colors

The palette establishes an intentional contrast between calm structural neutrals and an energetic cobalt primary:

- **Primary (`#2457FF`):** Electric Cobalt Blue. Reserved for primary calls-to-action, key state signifiers, route path vectors, interactive highlights, and high-impact brand intro surfaces.
- **Light Surface Canvas (`#FAFAF7`):** Warm architectural off-white that softens viewport strain and frames pure-white layered elements.
- **Elevated Surface (`#FFFFFF`):** Crisp pure white applied exclusively to interactive cards, popovers, and elevated modules against the off-white canvas.
- **Text Primary (`#202124`):** Near-black providing maximum optical contrast for titles, flight gates, metrics, and core content without the harshness of `#000000`.
- **Text Secondary (`#5F6368`):** Muted slate gray for secondary metadata, terminal subtext, timestamps, and placeholder labels.
- **Subtle Border (`#E5E7EB`):** Ultralight neutral boundary for hairline separators, table borders, and structural framing.
- **Selected Tint (`#F0F4FF`):** Soft cobalt tint (equivalent to cobalt at ~4-6% opacity) used for selected row highlights, active filters, and interactive hover planes.

## Typography

The design system relies on **Plus Jakarta Sans** across all roles to achieve a confident, contemporary geometric aesthetic that balances crisp technical precision with welcoming humanist curves.

Typographic hierarchy guidelines:
- **Display & Headings:** Use tight negative letter-spacing (`-0.01em` to `-0.03em`) and heavy weights (700-800) for punchy, decisive destination boards, flight status screens, and bold hero statements.
- **Flight Data & Status Signifiers:** Use tabular figures (`tnum`) for gate numbers, departure clocks, flight codes, and currency readouts to ensure vertical alignment across data lists.
- **Metadata Labels:** `label-sm` utilizes uppercase rendering with `0.05em` letter tracking to maintain micro-scale legibility on wayfinding indicators and terminal tags.

## Layout & Spacing

The layout is constructed on an adaptable fluid 12-column grid designed for modular travel widgets, itineraries, and map integration.

- **Desktop (1200px+):** 12-column fluid grid, 32px (`space-xl`) outer margins, 24px (`gutter`) column spacing. Max container width capped at 1320px for optimal scanning comfort.
- **Tablet (768px - 1199px):** 8-column layout, 24px (`space-lg`) outer margins, 16px column spacing. Travel modules wrap to 2-up grids.
- **Mobile (<768px):** 4-column layout, 16px (`space-md`) outer margins, 12px column spacing. Multi-segment flight rows collapse into stacked linear itineraries.
- **Spacing Rhythm:** Standard spacing scales strictly in multiples of 4px/8px, prioritizing clear white space between distinct segments to keep complex transport interfaces breathable.

## Elevation & Depth

This system intentionally rejects heavy, blurred drop shadows in favor of a crisp architectural surface stacking model:

- **Surface Tiers:** Baseline canvas is `#FAFAF7`. Interactive modules, itinerary segments, and floating drawers sit on `#FFFFFF`.
- **Hairline Framing:** Depth and component boundaries are defined by a crisp 1px border (`#E5E7EB`), maintaining clean separation on all viewports without optical weight.
- **Micro Ambient Elevation:** When an element floats over dynamic mapping canvases or requires modal layering, use an ultra-diffused, barely-perceptible ambient shadow: `0 4px 20px -2px rgba(32, 33, 36, 0.05)`.
- **Selected States:** Depth of focus is communicated horizontally via background tinting (`#F0F4FF`) paired with a solid 2px `#2457FF` left-accent or bounding indicator, never via drop shadow extrusion.

## Shapes

The geometric language is restrained, modern, and calibrated for clean structural alignment:

- **Default Radii:** Interactive controls, text inputs, and primary buttons use standard `rounded` (8px).
- **Cards & Sheet Modules:** Flight cards, destination cards, and dialog panels step up to `rounded-lg` (12px) to `rounded-xl` (16px max), ensuring softness without ballooning into toy-like or overly organic silhouettes.
- **Chips & Badges:** Use full pills (`9999px`) for micro-status indicators, filter tags, and operational alerts to distinguish metadata from structural containers.
- **Never Sharp:** Fully sharp 0px corners are reserved only for full-bleed map panes or seamless bottom-sheet attachment edges.

## Components

### Buttons
- **Primary:** Background `#2457FF`, label `#FFFFFF`, border none, 12px border radius, 48px height. On hover: darken tint (`#1A48DB`). Focus: 2px offset cobalt outline.
- **Secondary:** Background `#F0F4FF`, text `#2457FF`, border none. Hover: `#E1EAFF`.
- **Tertiary / Ghost:** Background transparent, text `#202124`, hover background `#F0F4FF`.

### Input Fields
- **Container:** Height 48px, background `#FFFFFF`, border 1px solid `#E5E7EB`, radius 10px, text `#202124` in `body-md`.
- **Placeholder:** Text `#5F6368`.
- **Focus:** 1.5px border `#2457FF` with a subtle 3px glow of `rgba(36, 87, 255, 0.12)`. No harsh dark focus rings.

### Cards & Modules
- **Default Card:** Background `#FFFFFF`, border 1px hairline `#E5E7EB`, radius 14px, padding 20px (`space-lg`).
- **Active / Selected Card:** Background `#FFFFFF`, border 1.5px solid `#2457FF`, inner background accent `#F0F4FF` for header or active flight segment.
- **Hero / Brand Surface:** Solid `#2457FF` surface with high-contrast `#FAFAF7` and `#FFFFFF` typography for terminal announcements and search hero headers.

### Chips & Filter Pills
- **Inactive:** Background `#FFFFFF`, border 1px solid `#E5E7EB`, text `#5F6368`, height 32px, pill-shaped radius.
- **Active:** Background `#2457FF`, border 1px solid `#2457FF`, text `#FFFFFF`.
- **Filter Count / Badge:** Inline badge with `#F0F4FF` fill and `#2457FF` text.

### Checkboxes & Radio Buttons
- **Unchecked:** 18px box/circle, border 1.5px `#E5E7EB`, background `#FFFFFF`.
- **Checked:** Background `#2457FF`, border `#2457FF`, white checkmark or center pip.

### Lists & Transit Waypoints
- **Rows:** Connected by 1px vertical hairline dividers (`#E5E7EB`). 
- **Waypoints:** 8px solid cobalt circles (`#2457FF`) denoting departure, layover, and arrival nodes on white card tracks.