# ember-grid-layout

Ember.js addon providing draggable, resizable grid layout components. Inspired by React-Grid-Layout and GridStack. Uses the Embroider V2 addon format.

## Project Structure

Monorepo with yarn workspaces:

- `addon/` — Main addon source code (components, modifiers, utils)
- `docs/` — Documentation / demo Ember app (also serves as test host)

Key source files:

- `addon/src/components/grid-layout.js` — Main layout container component
- `addon/src/components/grid-item.js` — Individual draggable/resizable grid item
- `addon/src/modifiers/position.js` — DOM modifier for inline positioning
- `addon/src/utils/index.ts` — Layout algorithm utilities (TypeScript)
- `addon/src/styles/grid-layout.css` — Component styles

## Tech Stack

- Ember.js 4.4 (Octane edition) with Glimmer components
- TypeScript for utility functions, JavaScript for components
- Rollup for addon bundling (V2 addon via `@embroider/addon-dev`)
- `ember-modifier` for DOM modifiers

## Common Commands

```bash
# Install dependencies (from repo root)
yarn install

# Build the addon
cd addon && npm run build

# Start addon in watch mode
cd addon && npm start

# Run the docs/demo app
cd docs && npm start

# Run all linting + tests (from docs/)
cd docs && npm test

# Run only Ember tests
cd docs && npm run test:ember

# Lint JavaScript
cd docs && npm run lint:js

# Lint Handlebars templates
cd docs && npm run lint:hbs

# Auto-fix lint issues
cd docs && npm run lint:fix
```

Tests live in `docs/tests/`. The addon itself has no tests directory — all tests run through the docs app.

## Code Style

- **Prettier**: single quotes, 4-space indentation, 100 char line width, trailing commas, semicolons
- **ESLint**: `eslint:recommended` + `plugin:ember/recommended` + `plugin:prettier/recommended`, parser `babel-eslint` with ES2018
- **Template lint**: `recommended` preset (Octane)
- **TypeScript**: strict mode, ESNext target, decorators enabled (in `addon/`)

## Conventions

- Components are class-based Glimmer components (`@glimmer/component`) with `@tracked` properties and `@action` decorators
- Co-located templates: `.hbs` files alongside `.js` files in `components/`
- File names use kebab-case (`grid-layout.js`), component classes use PascalCase (`GridLayout`)
- Private methods prefixed with underscore (`_updatePosition`)
- Layout algorithm ported from React-Grid-Layout; utility functions in `addon/src/utils/index.ts` handle collision detection, compaction, and element movement
