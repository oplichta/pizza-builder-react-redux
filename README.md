# 🍕 Pizza Builder — React + Redux

A multi-step pizza ordering app: build one or more pizzas (size + toppings),
fill in a validated order form, and watch a simulated delivery follow a live
route on a map (Mapbox). Built as a portfolio project to practice state
management with Redux Toolkit and integrating a third-party API.

🔗 **Live demo:** https://oplichta.github.io/pizza-builder-react-redux/

## Features

- Build multiple pizzas in one order — choose a size and toppings for each,
  add or remove pizzas — with the price per pizza and the order total
  recalculated automatically
- Order form with real-time field validation (email, phone, postcode)
- Simulated payment and delivery: a courier route is calculated (Mapbox
  Directions API) and animated live on the map
- Code-splitting: the map module (mapbox-gl) is lazy-loaded (`React.lazy`)
  so it doesn't bloat the initial bundle

## Tech stack

- **React 19** (hooks, `lazy`/`Suspense`)
- **Redux Toolkit** (`createSlice`, `configureStore`) — order state management
- **react-redux** — connects the store to components
- **Mapbox GL JS** — address geocoding, route directions, live delivery map
- **Vite** — build and dev server
- **Vitest + Testing Library** — reducer and component tests
- **Sass** — styling

## Running locally

```sh
npm install
npm run dev
```

The app starts at `http://localhost:5173/pizza-builder-react-redux/`.

The delivery step uses Mapbox — if you want to use your own token, set it in
a `.env` file:

```
VITE_MAPBOX_ACCESS_TOKEN=your_token
```

## Testing

```sh
npm run test
```

Covers the order reducer's business logic (pricing, adding/removing pizzas
and ingredients, resizing) and the key interactive components (`PizzaSize`,
`PizzaIngredients`, `OrderForm`).

## What I learned

- Modeling multi-step wizard state (pizza builder → order details →
  delivery) in Redux and keeping it consistent across steps.
- Migrating a hand-written action/reducer setup to Redux Toolkit's
  `createSlice`, and why generating ids via `prepare`/`nanoid` instead of a
  derived value like array length avoids subtle id collisions once items
  can be removed.
- Integrating a mapping API (geocoding, directions, marker animation) with
  proper cleanup of intervals, `requestAnimationFrame`, and the map
  instance inside `useEffect`.
- Deliberate bundle-splitting (`React.lazy`) based on the real weight of a
  dependency (mapbox-gl).
- Debugging a React 19 StrictMode double-invoked mount effect that silently
  created two pizzas in development: an effect that dispatches an action
  needs to guard against running twice with the same stale state, not just
  check a condition once.

## Known limitations / next steps

- No PropTypes or TypeScript yet — component props aren't type-checked
- Component test coverage is still partial (a few key components, not the
  whole tree)
