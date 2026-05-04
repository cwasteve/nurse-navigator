# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nurse Navigator is a React + TypeScript web application built with Vite. Currently in early scaffold stage.

## Commands

- **Dev server:** `bun run dev`
- **Build:** `bun run build` (runs `tsc -b && vite build`)
- **Lint:** `bun run lint`
- **Preview production build:** `bun run preview`

No test framework is configured yet.

## Tech Stack

- **React 19** with TypeScript 6, using react-jsx transform
- **Vite 8** as build tool and dev server
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **Bun** as package manager (use `bun install`, not npm/yarn)
- **ESLint** with flat config format, TypeScript-ESLint, React Hooks, and React Refresh rules

## Architecture

Single-page app with no routing or state management library. Entry point is `src/main.tsx` → `src/App.tsx`.

### Styling

- Tailwind CSS imported via `@import "tailwindcss"` in `src/index.css`
- Component-scoped CSS in `src/App.css` using CSS nesting
- CSS custom properties define a light/dark mode color system (text, heading, background, border, accent)
- Dark mode via `prefers-color-scheme` media query

### TypeScript

Strict settings enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Target ES2023 with bundler module resolution.

## Code Standards

- Use shared components wherever/whenever possible
- Prefer hooks to prop drilling
- Meaningful tests that actually test real functions and behaviors as much as possible, rather than stubbing or mocking everything
- Prioritize DRY code
- Utilize TailwindCSS for styles

## Design Standards

- A simple, functional UI that is easy to navigate is preferred over bells and whistles
- Mistakes should be easily undone
- Confirmation should be required for important changes
- Prefer a page/feature architecture that provides Overview -> Detail
- The user should not have to think about what to do/how to do it
- The user should not be uncertain what any particular button, function, link, etc., does when they are clicking around on page
- Use the /frontend-design skill for anything that requires UX/UI enhancements
