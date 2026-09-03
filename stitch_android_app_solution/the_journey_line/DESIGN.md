---
name: The Journey Line
colors:
  surface: '#03151e'
  surface-dim: '#03151e'
  surface-bright: '#2a3b45'
  surface-container-lowest: '#001019'
  surface-container-low: '#0b1e27'
  surface-container: '#0f222b'
  surface-container-high: '#1a2c36'
  surface-container-highest: '#253741'
  on-surface: '#d2e5f2'
  on-surface-variant: '#d4c4ae'
  inverse-surface: '#d2e5f2'
  inverse-on-surface: '#21333c'
  outline: '#9d8f7b'
  outline-variant: '#504535'
  surface-tint: '#fbbc40'
  primary: '#ffd899'
  on-primary: '#422c00'
  primary-container: '#f6b73c'
  on-primary-container: '#6a4900'
  inverse-primary: '#7d5700'
  secondary: '#95cef0'
  on-secondary: '#00354a'
  secondary-container: '#014f6c'
  on-secondary-container: '#87c0e1'
  tertiary: '#b6e5ff'
  on-tertiary: '#003548'
  tertiary-container: '#63ceff'
  on-tertiary-container: '#005673'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdeaa'
  primary-fixed-dim: '#fbbc40'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5f4100'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#95cef0'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#c1e8ff'
  tertiary-fixed-dim: '#73d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#03151e'
  on-background: '#d2e5f2'
  surface-variant: '#253741'
  asphalt-surface: '#16252D'
  safety-teal: '#1E7A65'
  mist-bg: '#F3F7F6'
  error-red: '#C93C37'
typography:
  display-lg:
    fontFamily: Estedad
    fontSize: 48px
    fontWeight: '850'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Estedad
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 44px
  headline-md:
    fontFamily: Estedad
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 36px
  body-lg:
    fontFamily: Estedad
    fontSize: 18px
    fontWeight: '450'
    lineHeight: 32px
  body-md:
    fontFamily: Estedad
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-sm:
    fontFamily: Estedad
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  touch-target: 44px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for Pooyesh Taxi evokes a **Cinematic Modern Iranian** aesthetic, moving away from generic SaaS "flatness" toward a narrative-driven experience. The brand personality is professional, human, and deeply trustworthy, reflecting the reliability of a long-distance or high-end transit service.

The visual style is a blend of **Minimalism** and **Cinematic High-Contrast**. It utilizes heavy whitespace to prioritize legibility of Persian script, contrasted with deep, "asphalt-inspired" dark surfaces and "cabin-amber" interactive elements. 

### The Journey Line
The signature visual element is a live vector path that anchors the UI. It acts as both a functional progress indicator and a metaphorical "road" connecting different states of the user's trip. This line should be fluid, tapering at the ends, and always rendered in `dawn-500` or `amber-500` depending on the trip status.

## Colors
The palette follows a "Road Phase" narrative. The primary interaction color, **Cabin Amber**, is reserved strictly for call-to-action elements, simulating the warm glow of a vehicle's interior lights at night. 

- **Primary (Cabin Amber):** All high-priority actions and trip confirmations.
- **Secondary (Dawn Sky):** Path indicators, route data, and subtle informational accents.
- **Neutral (Midnight Road):** The foundational dark mode surface.
- **Asphalt Surface:** Used for card elevations and secondary containers to create depth against the Midnight Road background.
- **Safety Teal:** Dedicated to trust signals—insurance badges, verified drivers, and SOS confirmation.

## Typography
The system uses **Estedad Variable** to ensure perfect weight control for Persian script. The hierarchy is optimized for RTL (Right-to-Left) reading patterns.

- **Persian Optimization:** Line heights are set higher than standard Latin defaults (minimum 1.6x) to accommodate the ascending and descending strokes of Persian characters.
- **Numerical Data:** Price displays and time estimates must use `font-variant-numeric: tabular-nums` to ensure alignment in lists, using Persian numeral glyphs where appropriate for the local context.
- **The Cinematic Header:** Large display titles should use the maximum variable weight (850) to create a bold, authoritative "hero" feel.

## Layout & Spacing
The layout employs a **Fluid Grid** with "Cinematic Framing." While maintaining standard Material 3 spacing for touch targets (min 44px), the system uses generous horizontal margins to focus the user's eye on the "Journey Line" in the center of the screen.

- **RTL Alignment:** All structural logic is flipped for Persian—navigation drawers on the right, back buttons pointing right, and progress moving from right to left.
- **Mobile Narrative:** On mobile, the "Journey Line" transitions from a horizontal path to a vertical timeline, guiding the user through the steps of booking and transit.
- **Safe Areas:** Ensure interactive elements do not collide with the Android navigation bar or camera notches, especially when using full-bleed cinematic imagery in the background.

## Elevation & Depth
Depth is conveyed through **Lighting and Tonal Layers** rather than traditional drop shadows.

- **Base Layer:** `Midnight Road` (#071A23).
- **Raised Surfaces:** `Asphalt` (#16252D) is used for cards and modals. Instead of a shadow, these elements use a 1px inner border of `white` at 5% opacity to simulate a "rim light" effect on the edge of the road.
- **Glow Effects:** Critical interactive elements (like the active car in the Journey Line) use a soft `Cabin Amber` outer glow to suggest illumination from vehicle headlights.
- **Backdrop Blurs:** Modals and bottom sheets use a heavy backdrop blur (20px) to maintain the cinematic feel while ensuring legibility over map backgrounds.

## Shapes
The shape language is **Contextual Roundedness**. While primary buttons use soft radii to feel approachable, the "Journey Line" and container elements use sharper, more structural geometry to feel professional and secure.

- **Standard Elements:** 0.5rem (8px) for cards and input fields.
- **Interactive Highlights:** `rounded-xl` (1.5rem) for car class selectors to emphasize comfort and "softness" of the interior cabin.
- **The Journey Line:** A constant 2px stroke width, rounded at the caps to prevent a "raw" or "unrefined" feel.

## Components
- **Primary CTA (Amber Button):** High-contrast black text on `amber-500` background. No shadows; uses a slight scale-up (1.02x) on press for tactile feedback.
- **The Journey Line (Progress):** A live vector path. Completed segments are `dawn-500`, the current position is a glowing `amber-500` pulse, and future segments are semi-transparent.
- **Car Class Cards:** Instead of a simple list, these are horizontal scrolls with high-quality imagery. The active selection is indicated by a `dawn-500` border and an amber price tag.
- **Input Fields (Asphalt):** Dark backgrounds with thin `dawn-500` bottom borders. Label text floats upward on focus.
- **Verification Badges:** Use `safety-teal` with a linear icon. These should be placed prominently next to driver names to reinforce the "Trustworthy" brand pillar.
- **Bottom Sheets:** Follow Material 3 behavior but with "Asphalt" surfaces and "Rim Light" edge treatment.