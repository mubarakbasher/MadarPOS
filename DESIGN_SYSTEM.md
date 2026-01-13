# MADAR Design System & Style Guide

## 1. Design Philosophy
**"Modern Enterprise"**: A clean, high-contrast, and professional aesthetic designed for daily business use.
- **Visuals**: Royal Indigo primary actions, Slate neutrals, and Card-based layout with subtle elevation.
- **Typography**: Inter / Outfit for high legibility at all sizes.
- **Theme**: Fully adaptive Light and Dark modes.

## 2. Design Tokens
The system uses CSS Custom Properties (Variables) defined in `app/globals.css`.

### Colors (HSL)
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | Royal Blue `221 83% 53%` | Vivid Blue `217 91% 60%` | Primary buttons, active states, links |
| `--background` | Pale Slate `210 40% 98%` | Deep Navy `222 47% 11%` | Global application background |
| `--card` | White `0 0% 100%` | Dark Gray `217 33% 17%` | Card/Container backgrounds |
| `--foreground` | Deep Slate `222 47% 11%` | White `210 40% 98%` | Primary Body Text |
| `--muted` | Light Gray `210 40% 96%` | Darker Gray `217 32% 17%` | Secondary backgrounds, dividers |
| `--muted-foreground` | Slate Gray | Light Slate | Secondary text, captions |
| `--destructive` | Soft Red | Soft Red | Error states, delete actions |

### Typography
- **Font Family**: Inter (Default), Outfit (Headings if applied)
- **Base Size**: 16px (1rem)
- **Scale**: `text-xs` (12px), `text-sm` (14px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px)

### Radii & Shadows
- **Radius**: `--radius` (0.75rem / 12px) - Modern, friendly corners.
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-glow` (Brand colored glow).

## 3. UI Components (Styling Guidelines)
Existing components automatically inherit these styles via the updated `globals.css` and `tailwind.config.js`.

### Buttons
- **Primary**: `bg-indigo-600 text-white` -> mapped to `bg-primary text-primary-foreground`.
- **Secondary**: `bg-white border-gray-200` -> mapped to `bg-card border-border`.

### Cards
Cards use `bg-white` (mapped to `bg-card`) with `border-gray-100` (mapped to `border-border`).
- **Effect**: In dark mode, cards become dark gray `217 33% 17%` to distinguish from the deep navy background.

### Forms & Inputs
Inputs use `border-gray-200` (mapped to `border-border`) and `bg-gray-50` (mapped to `bg-background`).
- **Focus Ring**: Uses `--ring` (Primary Blue).

## 4. How to Enable Dark Mode
The project relies on the `.dark` class on the `<html>` or `<body>` element.
 To test Dark Mode:
1. Open Developer Tools in your browser.
2. Select the `<body>` tag.
3. Add `class="dark"`.
4. The UI will instantly flip to the Dark Theme.

## 5. Developer Usage
Use Tailwind classes as normal. They are now "Themed".
- Instead of finding a hex code, use standard classes:
  - `text-gray-500` -> automatically adapts to dark mode.
  - `bg-white` -> becomes dark in dark mode.
  - `border-gray-200` -> becomes dark border in dark mode.

**Do NOT use hardcoded hex values (e.g. `bg-[#123456]`).** always use semantic classes.
