# JavaScript / TypeScript Coding Style Reference

## Implementation Style

Use modern language features wherever the target platform supports them:

- `'use strict';` (unless generating an ESM module)
- `x == null` to check existence, `x === value` for strict comparison — never use bare truthiness checks like `if (x)`; write `if (x == null)` instead
- Default parameter values
- `destroy()` methods in classes when cleanup is needed
- `const` and `let` instead of `var` — prefer `const` whenever possible
- `#identifier` for private fields and methods in classes
- Arrow functions for callbacks (be careful with `this` binding), but **never** for exported functions — write `export function x (...) {...}` instead of `export const x = (...) => ...`
- Template literals, optionally with tagged template functions
- Object and array destructuring
- Object and array spreading
- Object shorthand syntax
- Optional chaining `?.`
- Nullish coalescing `??`
- `async`/`await` instead of `.then`/`.catch`
- Top-level `await`
- `try`-`catch`-`finally` (also for async code)
- `structuredClone()` for deep copies
- `Temporal` instead of `Date` (if the runtime supports it)
- `Promise.withResolvers()`
- `Object.groupBy()`
- `Array.at()`
- Array methods (`map`, `filter`, etc.) instead of loops
- Assignment operators `??=`, `||=` where appropriate

Avoid generators unless absolutely necessary.

## Design Patterns

Prefer these patterns:

- Factory
- Singleton
- Observer
- Strategy
- Dependency Injection

## SOLID Principles

- **SRP** — Single Responsibility
- **OCP** — Open-Closed
- **LSP** — Liskov Substitution
- **ISP** — Interface Segregation
- **DIP** — Dependency Inversion

## Additional Principles

- **DRY** — Don't Repeat Yourself
- **KISS** — Keep It Simple, Stupid
- **YAGNI** — You Aren't Gonna Need It
- **Composition over Inheritance**
- **Law of Demeter (LoD)**
- **Clean Code** — no unexpected side effects in functions, default parameters instead of conditionals
- Leverage prototype-based inheritance where appropriate
- Follow current best practices

## Defensive Programming

- Validate all incoming data at the interface boundary to the consumer (fail fast — not internally)
- Validate all user inputs and data read from external sources
- Use only sanitized HTML
- Handle all errors with descriptive messages (useful for AI-assisted debugging)
- Use `async`/`await` with timeouts (either locally or in the surrounding caller)
- Write robust, fault-tolerant, OWASP-Top-10-compliant code

## Implementation Details

- Always wrap `if`, `else if`, `else`, `for`, `while`, and `do` blocks in braces — exception: a standalone `throwError` call after `if`, e.g. `if (cond) throwError(...)`

## Idiomatic Constructs

### Switch-true instead of else-if chains

```javascript
switch (true) {
  case (conditionA): ...; break
  case (conditionB): ...; break
  default: ...
}
```

### Catch variable naming

The variable in a `catch` clause is usually named `Signal` or `innerSignal`.

## General Formatting Rules

- Avoid unnecessary semicolons
- Prefer compact code — blank lines only before/after header, section, and block comments, and where needed to group related statements
- Single quotes for string literals (`'...'`), except for HTML attributes which use double quotes (`<tag attr="value"/>`)
- No JSDoc comments, no annotations

## Naming Conventions

- Use expressive English identifiers, no longer than 40 characters (e.g. `Value` instead of `val`)
- Choose names so that usage reads like English prose:
  - `connect(redCable).with(blueSocket)`
  - `const Summary = summarized(Tutorial)`
  - Use a fluent API when it improves readability
- When destructuring external objects, explicitly map to new names: `const { old:new } = externalObject`

## Casing Rules

Ignore the internet's conventional casing — use these rules instead:

- Use CamelCase throughout
- Abbreviations are fully uppercased: `HTML`, `CSS`, `TCP` — the character immediately following an abbreviation is lowercase (unless another abbreviation or noun follows)
- Capitalize the first letter if the first part of the identifier is a noun or a name; lowercase otherwise
- Uppercase examples: `DataStore`, `WarpSpool`, `...Rest`
- Lowercase examples: `redSnapper`, `brokenHTMLParser`

## Whitespace Rules

- Space after the `!` operator: `! x`
- `if` statements always with `{` and `}`, except standalone `throwError`
- Single-line blocks with spaces after `{` and before `}`: `{ return }`
- Single-line object literals with spaces after `{` and before `}`: `{ x,y,z }`
- Single-line array literals with spaces after `[` and before `]`: `[ x,y,z ]`

## Indentation

- Always 2 spaces, never tabs
- Binary operators usually written **without** surrounding whitespace
- Ternary `?` and `:` always have surrounding whitespace
- After `:` in type annotations or object literals: **no** space, the expression follows immediately
- When a variable is created, configured by subsequent statements, then used/returned — indent the configuration statements by 2 extra spaces

## Parentheses

- Arrow function parameters always in parentheses
- Logical expressions always parenthesized to clarify precedence

## Line Length and Wrapping

- Group related short statements on one line separated by semicolons, as long as the line stays near 80 characters
- Wrap lines exceeding 100 characters

### Long strings

Split after spaces or special characters into a parenthesized expression joined with `+`.

### Multiline strings

Use template literals with content indented as the text requires. Start and end with a newline if needed, then `.trim()`.

### Long ternary expressions

For overly long or nested ternary expressions, format the outer expression as:

```
condition
  ? firstExpression
  : secondExpression
```

Wrap inner ternary expressions in parentheses.

## Comments

### Header comments

Once per module, application, or stylesheet — centered name, exactly 80-character lines, followed by a blank line. Always starts at column 1, never indented.

```
/*******************************************************************************
*                                                                              *
*                                (Module Name)                                 *
*                                                                              *
*******************************************************************************/

```

### Section comments

Before classes or groups of related constants, types, and functions — exactly 80-character lines, surrounded by blank lines. Always starts at column 1, never indented.

```

//----------------------------------------------------------------------------//
//                    (Class Name or Section Description)                      //
//----------------------------------------------------------------------------//

```

### Block comments

Before functions (or lambda constants) or groups of related statements — preferably not exceeding column 80, surrounded by blank lines. **Outdented by 2 characters** relative to the following line.

```

  /**** (Function Name or Block Description) ****/

```

### End-of-line comments

`// ...` at the end of lines that need annotation, positioned to end near column 80 — only longer when necessary.