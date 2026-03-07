---
name: js-coding-style
description: Enforces a custom JavaScript and TypeScript coding style for all generated JS/TS code. Use this skill whenever generating, editing, refactoring, or reviewing JavaScript or TypeScript code — including ESM modules, Node.js backends, frontends, PWAs, React components, HTML artifacts with embedded scripts, and standalone scripts. Also triggers when the user asks to fix, convert, or write any .js, .ts, .mjs, .mts, .jsx, or .tsx file. If JavaScript or TypeScript code is being produced in any form, consult this skill first to ensure the correct coding style is applied.
---

# JS/TS Coding Style Enforcement

## Purpose

This skill ensures that all generated JavaScript and TypeScript code conforms to a specific personal coding style. The style covers naming conventions, formatting, whitespace, comments, design patterns, and idiomatic constructs.

## When This Skill Applies

Any time Claude generates, edits, reviews, or refactors JavaScript or TypeScript code — regardless of context. This includes:

- Standalone `.js`, `.ts`, `.mjs`, `.mts`, `.jsx`, `.tsx` files
- Code inside HTML artifacts (`<script>` blocks)
- React/JSX components
- Node.js backend code
- ESM modules
- Code snippets in explanations (when producing runnable examples)
- Refactoring or fixing existing user code

## How to Use

**Before writing any JS/TS code**, read the style reference:

```
view references/coding-style.md
```

Then apply every rule from that file while generating code. The style reference is the single source of truth — if it changes, the behavior of this skill changes with it.

## Quick Reference (Key Differentiators)

These are the rules most likely to be missed because they differ from common conventions. Always double-check these when writing code:

### Casing — not standard camelCase

- First letter is uppercase if the first word is a **noun or name**: `DataStore`, `WarpSpool`
- First letter is lowercase if the first word is **not** a noun: `redSnapper`, `brokenHTMLParser`
- Abbreviations are fully uppercased: `HTML`, `CSS`, `TCP`

### Whitespace — non-standard spacing

- Space **after** the `!` operator: `! isReady`
- **No** space after `:` in type annotations and object literals: `{ name:"Alice", age:30 }`
- Binary operators **without** surrounding whitespace: `a+b`, `x*y`
- Ternary operators **with** surrounding whitespace: `cond ? a : b`
- Single-line blocks, objects, arrays have inner spaces: `{ return }`, `{ x,y }`, `[ a,b ]`

### Strings

- Single quotes `'...'` for string literals
- Double quotes `"..."` for HTML attributes

### Semicolons

- Avoid unnecessary semicolons (ASI-friendly style)

### Comments — specific formats

- **Header**: 80-char boxed comment with centered module name (column 1, not indented)
- **Section**: 80-char `//---...---//` banner (column 1, not indented)
- **Block**: `/**** Name ****/` — outdented 2 chars relative to following code
- **No** JSDoc, no annotations

### Control Flow

- `switch (true) { ... }` instead of `else if` chains
- `catch` variable named `Signal` or `innerSignal`
- Always use braces on blocks — exception: `if (cond) throwError(...)`

### Exports

- Never export arrow functions — use `export function name (...) {...}`

### Existence Checks

- `x == null` to check existence — never bare `if (x)`

### Configuration Pattern

When a variable is created, configured, then used:

```javascript
const Widget = createWidget()
  Widget.color = "red"
  Widget.size = 42
return Widget
```

The configuration lines are indented 2 extra spaces.

## Applying the Style

1. Read `references/coding-style.md` at the start of the task
2. Write all code following every rule from that reference
3. Before finalizing, mentally review the Quick Reference checklist above
4. Pay special attention to the non-standard rules (casing, spacing, semicolons, comment formats)

## Updating the Style

The concrete style rules live entirely in `references/coding-style.md`. To change the coding style, edit only that file. The SKILL.md does not need to change unless the skill's triggering behavior or workflow changes.