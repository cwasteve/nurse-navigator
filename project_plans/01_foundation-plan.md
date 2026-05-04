# Nurse Navigator — UI Foundation Plan

## Color Palette

Healthcare-appropriate palette: calm, trustworthy, high-contrast for readability.

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#1A6B4F` (teal-green) | `#34D399` | Primary actions, active states, header accents |
| `--primary-hover` | `#145740` | `#6EE7B7` | Button/link hover states |
| `--primary-bg` | `#F0FAF6` | `rgba(52,211,153,0.08)` | Subtle primary backgrounds (selected rows, badges) |
| `--danger` | `#B91C1C` | `#F87171` | Reject actions, destructive confirmations |
| `--danger-bg` | `#FEF2F2` | `rgba(248,113,113,0.08)` | Danger highlights |
| `--warning` | `#B45309` | `#FBBF24` | Low-confidence warnings, caution badges |
| `--warning-bg` | `#FFFBEB` | `rgba(251,191,36,0.08)` | Warning highlights |
| `--success` | `#15803D` | `#4ADE80` | Confirmed matches, success feedback |
| `--success-bg` | `#F0FDF4` | `rgba(74,222,128,0.08)` | Success highlights |
| `--neutral-50` | `#F9FAFB` | `#1F2937` | Page background |
| `--neutral-100` | `#F3F4F6` | `#283040` | Card/table backgrounds |
| `--neutral-200` | `#E5E7EB` | `#374151` | Borders, dividers |
| `--neutral-500` | `#6B7280` | `#9CA3AF` | Secondary text |
| `--neutral-800` | `#1F2937` | `#F3F4F6` | Primary text |
| `--neutral-900` | `#111827` | `#F9FAFB` | Headings |

Rationale: Teal-green reads as clinical and trustworthy without being the overused "hospital blue." Red/amber/green semantics align with the confirm/reject/caution workflow.

## Typography

- **Font stack:** `Inter, system-ui, -apple-system, sans-serif` — clean, highly legible at small sizes (table data), widely available.
- **Base size:** `15px` body, `13px` table cells — dense but readable for data-heavy views.
- **Headings:** Semibold (600), not bold — feels professional without shouting.
- **Monospace (IDs, scores):** `'JetBrains Mono', ui-monospace, monospace`

| Element | Size | Weight |
|---------|------|--------|
| Page title (h1) | 24px | 600 |
| Section heading (h2) | 18px | 600 |
| Body text | 15px | 400 |
| Table header | 13px | 600, uppercase, tracked |
| Table cell | 14px | 400 |
| Badge / chip | 12px | 500 |
| Caption / helper text | 13px | 400 |

## Layout

- Max content width: `1280px`, centered
- Top bar with app name + minimal nav (just the views the nurse needs)
- Main content area: full-width table with horizontal padding `24px`
- No sidebar — the workflow is linear (overview → detail), not branching

## Shared Components

### ConfirmDialog
Modal overlay for confirm/reject actions. Requires explicit action — no clicking outside to dismiss for destructive operations. Props: title, message, confirmLabel, cancelLabel, variant (danger | primary).

### DataTable
Sortable, filterable table. Fixed header on scroll. Row hover highlight. Supports row-click to navigate to detail. Column definitions passed as config. Zebra striping via alternating row backgrounds.

### TableRow
Individual row component. Supports status indicators (confirmed, rejected, pending) via left border color or status badge. Highlights on hover.

### Button
Variants: `primary`, `secondary`, `danger`, `ghost`. Sizes: `sm`, `md`. All include focus-visible ring for accessibility. Disabled state with reduced opacity.

### SearchBar
Text input with debounced filtering. Autocomplete dropdown showing matching patient names as the nurse types. Clear button when input has value. Filters the DataTable in real time.

### Badge / Chip
Small colored label for confidence levels and match status:
- High confidence (≥0.85): green
- Medium confidence (0.60–0.84): amber
- Low confidence (<0.60): red
- Status chips: Pending (gray), Confirmed (green), Rejected (red)

### Tooltip / InfoIcon
Small `(i)` icon that shows a tooltip on hover/focus explaining a column or concept (e.g., "Confidence Score: How likely the algorithm thinks these two records are the same patient. Higher is better."). Accessible via keyboard focus.

### StatusIndicator
Visual indicator for match status — small colored dot or left-border accent on table rows. Pending = neutral, Confirmed = green, Rejected = red.

## Confidence Score Display

The confidence score (0–1) should be displayed as:
- A percentage (`87%`) — more intuitive for a non-technical nurse than a decimal
- Accompanied by the colored Badge (high/medium/low)
- Column is sortable so the nurse can triage highest-confidence matches first

## Overview Table Columns

| Column | Source | Notes |
|--------|--------|-------|
| Status | app state | Badge: Pending / Confirmed / Rejected |
| Confidence | matches.csv | Percentage + colored badge |
| Hospital Patient | internal.csv | LastName, FirstName |
| Clinic Patient | external.csv | LastName, FirstName |
| DOB Match | both | Show both DOBs side-by-side; highlight if mismatch |
| Sex Match | both | Show both; highlight if mismatch |
| Phone Match | both | Show both; highlight if mismatch |
| Actions | — | Confirm / Reject buttons (or Undo if already acted on) |

The table should default-sort by confidence descending so the nurse works through the most likely matches first.
