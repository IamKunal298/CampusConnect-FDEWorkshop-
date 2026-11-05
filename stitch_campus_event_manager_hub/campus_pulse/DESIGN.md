---
name: Campus Pulse
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#00505f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a7c'
  on-tertiary-container: '#93e8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an energetic, approachable, and organized digital home for collegiate campus life. Tailored specifically for undergraduate and graduate students alongside campus organization leaders, the atmosphere bridges academic legitimacy with vibrant campus social energy. The aesthetic minimizes cognitive fatigue during hectic semesters while maximizing enthusiasm around events, club meetings, and campus initiatives.

The design movement combines **Modern Tactile Minimalism** with **Atmospheric Layering**:
- Base canvases are crisp, breathable, and distraction-free.
- Interactive components present friendly, approachable curvature and tangible micro-affordances.
- Subtle chromatic glows and warm surface tints counter sterile administrative software tropes.
- Interface density gracefully bifurcates: relaxed, media-rich browsing for student discovery versus consolidated, data-lucid control panels for event organizers.

## Colors

The color system delivers high legibility, WCAG AAA text compliance, and intentional bursts of collegiate vitality.

### Primary Palette
- **Primary Indigo (`#4F46E5`)**: Anchors global actions, key interactive states, active navigation tabs, and primary verification badges.
- **Secondary Tangerine (`#F97316`)**: Reserved for urgent discovery cues, "Happening Now" broadcast tags, RSVP deadlines, and featured spotlight highlights.
- **Tertiary Cyan (`#06B6D4`)**: Used for contextual academic and workshop tracks, technology categorizations, and auxiliary status accents.

### Neutral Scale
- **Canvas Base**: `#F8FAFC` (Slate 50) delivers an airy, soft-white backdrop that prevents screen glare.
- **Surface Elevation**: `#FFFFFF` (Pure White) serves as the primary resting plane for cards, sheets, and elevated overlays.
- **Surface Muted**: `#F1F5F9` (Slate 100) provides subtle containment borders and search field backdrops.
- **Border Default**: `#E2E8F0` (Slate 200) offers soft structural delineation.
- **Text Main**: `#0F172A` (Slate 900) ensures crisp, contrast-rich typography.
- **Text Muted**: `#64748B` (Slate 500) grounds metadata, timestamps, and secondary captions.

### Role-Based Accents
- **Student View**: Dominated by soft indigo surfaces, vibrant tangerine badges, and rich multimedia imagery.
- **Organizer Dashboard**: Elevated slate borders, high-density table rows, deep indigo metric counters, and focused emerald confirmation states (`#10B981`).

## Typography

Plus Jakarta Sans is utilized across display, reading, and micro-labeling hierarchies. Its open apertures, geometric underpinnings, and friendly rounded terminals evoke both youthful energy and institutional clarity.

- **Display & Large Headlines (`display-hero`, `headline-xl`)**: Employed exclusively for main campus announcements, orientation headlines, and primary event names. Tight letter-spacing (-0.02em) keeps headings cohesive.
- **Section Headers (`headline-md`, `headline-sm`)**: Form the structural anchors across catalog categories, modal headers, and dashboard summaries.
- **Body Copies (`body-lg`, `body-md`)**: Feature generous line heights to facilitate fast scanning of event descriptions, club constitutions, and speaker bios.
- **Labels & Tags (`label-md`, `label-caps`)**: Scaled down with slightly increased tracking (+0.03em for `label-caps`) to maintain crisp readability on compact status pills and event registration indicators.

## Layout & Spacing

The layout operates on an 8pt spatial baseline grid with a fluid responsive column framework:
- **Mobile (< 768px)**: 4 fluid columns, `1rem` outer margins (`margin-mobile`), `1rem` gutter width. Navigation settles into an anchored bottom bar with thumb-accessible event actions.
- **Tablet (768px - 1024px)**: 8 fluid columns, `1.5rem` outer margins, `1.5rem` gutters. Discovery feeds reflow into two-column cards with persistent top filtering.
- **Desktop (> 1024px)**: 12-column system, max-width bounded at `1320px` to maintain optimal line lengths. Outer margins scale to `3rem` (`margin-desktop`), with `1.5rem` gutters between content cards and analytical tables.

Organizer dashboards use an asymmetrical split: a fixed 260px collapsible sidebar combined with a fluid, multi-card operational panel. Event feeds use rhythmic multi-column cards that smoothly adapt between masonry grids and structured calendar list rows.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of **Soft Ambient Layering** combined with **Low-Contrast Ghost Outlines**:

- **Level 0 (Base Canvas)**: `#F8FAFC` flat surface.
- **Level 1 (Cards & Modules)**: Pure `#FFFFFF` surfaces bounded by a hairline border (`1px solid #E2E8F0`). Shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover States & Interactive Feed Elements)**: Elevation shifts upward smoothly on hover. Shadow: `0 10px 25px -5px rgba(79, 70, 229, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`, accompanied by an outer border transition to `#CBD5E1`.
- **Level 3 (Sticky Headers & Filter Bars)**: `#FFFFFF` at 90% opacity with `backdrop-filter: blur(12px)`. Shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Level 4 (Registration Modals & Flyouts)**: Elevated center overlays. Shadow: `0 25px 50px -12px rgba(15, 23, 42, 0.16)`. Backdrop overlay is styled with `#0F172A` at 40% opacity with subtle `blur(4px)` to isolate user focus during RSVP flows.

## Shapes

The interface embraces a modern, friendly silhouette that conveys warmth without losing institutional integrity:
- **Base Components (`rounded`)**: 0.5rem (8px) radius applied to input text boxes, table headers, dropdown options, and filter pills.
- **Standard Containers (`rounded-lg`)**: 1rem (16px) applied to action buttons, search bars, interactive list items, and organizer stat tiles.
- **Hero Containers & Cards (`rounded-xl`)**: 1.5rem (24px) applied to event cards, modal registration sheets, flyer image wrappers, and spotlight hero panels.
- **Badges & Tags**: Full pill curvature (`9999px`) applied to status pills, date badges, category indicators, and profile avatars to balance rectilinear content containers.

## Components

### Buttons
- **Primary Action (RSVP / Submit)**: Solid `#4F46E5` fill, `#FFFFFF` text, `rounded-lg` (16px radius), `0.75rem 1.5rem` padding. On hover: shifts to `#4338CA` with an ambient glow (`box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35)`).
- **Secondary (Explore / Save)**: `#EEF2FF` soft indigo fill with `#4F46E5` text. On hover: `#E0E7FF`.
- **Urgent / Spotlight (Tickets Low / Live)**: `#F97316` fill with `#FFFFFF` text, delivering high visual priority.
- **Ghost / Neutral**: Transparent background, `#0F172A` text, `#E2E8F0` border.

### Status Tags & Badges
- **Registration Open**: Pill shape, `#ECFDF5` background, `#059669` text, soft dot indicator.
- **Waitlist Only**: Pill shape, `#FFFBEB` background, `#D97706` text.
- **Sold Out / Closed**: Pill shape, `#F1F5F9` background, `#64748B` text.
- **Happening Now**: Pill shape, `#FFF7ED` background, `#EA580C` text with a subtle pulsing orange dot.

### Event Cards
- Built on `#FFFFFF` with `rounded-xl` borders and a `1px solid #E2E8F0` frame.
- Image aspect ratio 16:9 positioned at the top with an inset date badge (white pill in top-left showing abbreviated month and bold day number).
- Content zone contains event title, club host with verified icon, time/location row, real-time RSVP capacity bar, and prominent "RSVP" button.

### Search & Filters
- **Master Search Field**: Centered, expansive `rounded-lg` search bar with `#F1F5F9` background, `#64748B` placeholder, left-anchored magnifying glass icon, and right-anchored quick-clear keyboard shortcut icon (`⌘K`).
- **Filter Chips**: Horizontal scrollable list of category pills (e.g., "Greek Life", "STEM", "Athletics", "Arts"). Unselected states show `#F1F5F9` with `#475569` text; selected states invert to `#4F46E5` with `#FFFFFF` text.

### Registration Modal
- Centered dialog container with `rounded-xl` corners and `space-xl` internal padding.
- Includes a top visual summary showing event banner, date, venue, and remaining slots.
- Multi-step micro-flow: Tier/Ticket selection -> Dietary/Accessibility toggles -> Digital pass confirmation with downloadable QR code.

### Checkboxes, Radios, & Inputs
- Inputs use `#FFFFFF` fill with `1px solid #CBD5E1` border and `rounded-md` corners. Focus state produces a `2px solid #4F46E5` outline with a faint `3px` lavender halo.
- Checkboxes use `rounded` (6px) shapes, transitioning to `#4F46E5` fill with a crisp white check icon when active.

### Role-Based Adaptations
- **Student View**: Highlights visual browsing, personal RSVP schedules, bookmarking, and campus social feeds.
- **Organizer Mode**: Replaces decorative imagery with structured data tables, attendee check-in scanners (QR-ready), capacity threshold notifications, and broadcast announcement bars.