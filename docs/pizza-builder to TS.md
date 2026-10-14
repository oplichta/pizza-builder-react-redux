# Migracja pizza-builder-redux z JavaScript na TypeScript

## Kontekst

Projekt to portfolio React 19 + Redux Toolkit + Vite, obecnie w 100% JS/JSX (13 plików `.jsx`, 6 `.js` w `src`, zero `tsconfig.json`). W poprzedniej rozmowie ustalono, że TypeScript jest dziś praktycznie domyślnym wymogiem w ogłoszeniach o pracę na React (mid/senior, a coraz częściej i junior), więc migracja ma sens jako inwestycja pod rekrutację.

Użytkownik jest doświadczonym developerem Angular/TypeScript, ale nowym w tym konkretnym stacku (React + Redux Toolkit + Vite). Migrację wykonuje **ręcznie, samodzielnie pisząc kod** — to ma być ćwiczenie z TS w React, nie zadanie do zrobienia przez Claude'a. Plan jest podzielony na małe, niezależnie weryfikowalne kroki: po każdym kroku użytkownik pisze `check` (Claude weryfikuje zmiany), a po akceptacji `next` (przejście do kolejnego kroku).

Plan i wszystkie szczegóły techniczne zostały zweryfikowane bezpośrednio w repo i `node_modules` (nie zgadywane) — patrz sekcja "Zweryfikowane fakty techniczne" niżej.

**Decyzja użytkownika:** martwe pole `pizza.valid` (odczytywane w `PizzaCreator.jsx:78`, nigdy nie ustawiane — ikona statusu zawsze pokazuje `fa-times`) ma zostać **usunięte** z JSX przy okazji migracji tego komponentu (Krok 17), a nie zachowane jako "udokumentowany dług".

## Zweryfikowane fakty techniczne (podstawa decyzji w planie)

- **`@types/geojson` nie jest potrzebny.** `mapbox-gl@3.26.0` ma własny, samodzielny `.d.ts` bez zależności — ale jego typy GeoJSON (`Feature`, `LineString` itd.) są **nieeksportowane**, więc dla ręcznie budowanego obiektu trasy napiszemy własny minimalny lokalny interfejs (typowanie strukturalne wystarczy).
- **`react-redux@9.3.0` wspiera `.withTypes()`** (potwierdzone w `node_modules/react-redux/dist/react-redux.d.ts`) — używamy `useSelector.withTypes<RootState>()` / `useDispatch.withTypes<AppDispatch>()`, to dziś rekomendowany idiom RTK, zamiast starszego `TypedUseSelectorHook`.
- **`vite.config.ts` musi importować `defineConfig` z `'vitest/config'`**, nie z `'vite'` — inaczej `tsc` zgłosi, że pole `test` nie istnieje na `UserConfig`. To nie ujawni się przy `npm run dev`/`build` (Vite i tak wczyta config w runtime), tylko przy `npm run typecheck`.
- **`store.js` przekazuje reducer bezpośrednio**: `configureStore({ reducer: orderReducer })`, nie `{ order: orderReducer }`. `RootState` będzie więc płaski (`state.pizzas`, nie `state.order.pizzas`) — to celowo zostaje bez zmian, nie "poprawiamy" architektury przy okazji typowania.
- **`Ingredient.id` to `number`** (generowany jako `ingredients.length + 1` w `PizzaIngredients.jsx`), a **`Pizza.id` to `string`** (generowany przez `nanoid()` w `prepare` callbacku `addPizza`). To realna niespójność w kodzie — zostaje bez zmian (poza zakresem migracji typów), ale trzeba ją poprawnie odzwierciedlić w typach, inaczej testy się nie skompilują.
- **Pola formularza są stałym, znanym z góry zestawem**: `name`, `email`, `address`, `postcode`, `phone` (potwierdzone w `OrderForm.jsx`) — więc `OrderDetails`/`values`/`errors` da się otypować precyzyjnie (`Record<FieldName, string>` z unią literałów) zamiast przez luźny `Record<string, string>`, praktycznie bez dodatkowego kosztu.
- **Testowe fixture'y w `orderSlice.test.js`, `selectors.test.js`, `PizzaSize.test.jsx`, `PizzaIngredients.test.jsx`** używają miejscami liczbowych id pizzy (`id: 0`, `activePizzaId: 0`, `setActivePizza(3)`) — po otypowaniu trzeba je zmienić na stringi. Fixture'y w `selectors.test.js` są dodatkowo niekompletne względem pełnego kształtu `OrderState`/`Pizza` — trzeba je dopełnić.
- **`document.getElementById('root')`** w `main.jsx` nie ma null-checka — pod `strict: true` wymaga asercji `!` lub jawnej obrony.
- Zero PropTypes, zero barrel files, zero generyków/render-props w całym repo — migracja jest "czysta", bez architektonicznych niespodzianek poza powyższymi punktami.

## Założenia

- Split configów: `tsconfig.json` (solution/references) + `tsconfig.app.json` (przeglądarka/DOM) + `tsconfig.node.json` (Node, dla `vite.config.ts`) — standard dzisiejszego szablonu Vite React-TS.
- `allowJs: true`, `checkJs: false` przez cały czas migracji (pliki `.ts`/`.tsx` mogą swobodnie importować jeszcze niezmigrowane `.js`/`.jsx`), `strict: true` od razu.
- **`npm run typecheck` (nowy skrypt, `tsc -b`) to jedyny wiarygodny sygnał poprawności typów** — Vite/esbuild NIE type-checkuje przy `dev` ani `build`, więc "aplikacja się uruchomiła" nie znaczy "typy się zgadzają".
- Testy migrowane razem z plikiem/komponentem, którego dotyczą.
- Styl: bez `React.FC`, typowanie propsów wprost jako parametr funkcji (`({ color }: LoaderProps) => ...`) — konsekwentnie we wszystkich komponentach.

---

## Kroki migracji

### FAZA A — Fundament narzędziowy

**Krok 1 — Instalacja zależności**
`npm install -D typescript@latest typescript-eslint@latest @types/node@latest` (bez `@types/geojson` — patrz wyżej). `@types/react`/`@types/react-dom` już są zainstalowane. `typescript-eslint` to od v8 jeden meta-pakiet (parser + plugin + configs razem).
Weryfikacja: `npx tsc --version`, `git diff package.json` (tylko nowe devDependencies).

**Krok 2 — `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` + skrypt `typecheck`**
`tsconfig.json` — plik-referencja (`files: []`, `references` do app+node). `tsconfig.app.json` — `target: ES2022`, `lib: [ES2022, DOM, DOM.Iterable]`, `jsx: react-jsx`, `moduleResolution: bundler`, `strict: true`, `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch: true`, `allowJs: true`, `checkJs: false`, `noEmit: true`, `baseUrl: "."`, `paths: { "@/*": ["./src/*"] }` (zwierciedla alias z `vite.config.js`, dziś nieużywany ale niech będzie spójnie), **`types: ["vite/client", "vitest/globals", "@testing-library/jest-dom"]`** (potrzebne już teraz, żeby globalne `describe/it/expect` i matchery jest-dom były rozpoznane, zanim dojdziemy do testów). `tsconfig.node.json` — `target: ES2023`, `types: ["node"]`, `include: ["vite.config.ts"]`. `@types/node` celowo **tylko** w node-configu, nie w app-configu (ważne dla `setTimeout`/`setInterval` w Delivery, Krok 19). Dodaj do `package.json`: `"typecheck": "tsc -b"`.
Pułapka: żaden plik `.ts` jeszcze nie istnieje, więc `tsc -b` powinien przejść "trywialnie" — błąd na tym etapie to błąd składni JSON w configu, nie w kodzie.
Weryfikacja: `npm run typecheck`.

**Krok 3 — ESLint: `typescript-eslint`**
W `eslint.config.js` rozdziel bloki `files` na `**/*.{js,jsx}` (bez zmian) i nowy `**/*.{ts,tsx}` (`js.configs.recommended` + `tseslint.configs.recommended` — **bez** `recommendedTypeChecked` na razie, to dopiero Krok 24) + te same reguły react/react-hooks/react-refresh co dziś. Popraw `settings.react.version` z `'18.3'` na `'19.2'`.
Weryfikacja: `npm run lint` (0 nowych błędów — nowy blok na razie niczego nie obejmuje, bo nie ma jeszcze plików `.ts`/`.tsx`).

**Krok 4 — `vite.config.js` → `vite.config.ts`**
Jedyna istotna zmiana: `import { defineConfig } from 'vitest/config'` (**nie** z `'vite'`) — to jedyny sposób, żeby pole `test` się typecheckowało. Reszta (`plugins`, `base`, `resolve.alias`) bez zmian.
Weryfikacja: `npm run typecheck`, `npm run dev` (odpal i zamknij), `npm run build`, `npx vitest run` (stare testy `.jsx`/`.js` nadal powinny się znaleźć).

**Krok 5 — `vitest.setup.js` → `vitest.setup.ts`**
Treść bez zmian (`import '@testing-library/jest-dom';`). Zaktualizuj `setupFiles: './vitest.setup.ts'` w `vite.config.ts`.
Weryfikacja: `npm run typecheck`, `npx vitest run`.

### FAZA B — Warstwa Redux

**Krok 6 — `environment.js` → `environment.ts` + `src/vite-env.d.ts`**
Nowy `src/vite-env.d.ts`: `/// <reference types="vite/client" />` + własny `interface ImportMetaEnv { readonly VITE_MAPBOX_ACCESS_TOKEN?: string }` (opcjonalne, bo ma fallback `||`) + `interface ImportMeta { readonly env: ImportMetaEnv }`. W `environment.ts` jawnie otypuj `pizzeriaOrigin: [number, number]` (bez tego wywnioskuje się jako `number[]`, co nie spełni typu oczekiwanego przez mapbox-gl w Kroku 19).
Weryfikacja: `npm run typecheck`, `npm run build`.

**Krok 7 — Typy domenowe Redux (`src/redux/types.ts`)**
`PizzaSizeValue` — union `'small' | 'medium' | 'large'` (nazwa celowo różna od komponentu `PizzaSize.tsx`, żeby uniknąć kolizji nazw). `Ingredient { id: number; name: string; quantity: number }`. `Pizza { id: string; size: PizzaSizeValue; name: string; price: number; quantity: number; ingredients: Ingredient[] }` — **bez** pola `valid` (usuwamy je z UI w Kroku 17, więc nie wprowadzamy go do typów). `OrderState { pizzas: Pizza[]; activePizzaId: string | null; totalAmount: number; orderDetails: OrderDetails | null }`. `OrderDetails` — precyzyjnie, bo pola są znane z góry: `{ name: string; email: string; address: string; postcode: string; phone: string }` (potwierdzone w `OrderForm.jsx`).
Pułapka: nie ujednolicaj `Ingredient.id`/`Pizza.id` do wspólnego typu "dla porządku" — to realnie zmieniłoby zachowanie generatora id w `PizzaIngredients.jsx`, co jest poza zakresem tej migracji.
Weryfikacja: `npm run typecheck`.

**Krok 8 — `orderSlice.js` → `orderSlice.ts` (+ test)**
`createSlice<OrderState, ...>`, reducery przez `PayloadAction<T>`. `addPizza`'s `prepare` przyjmuje `Omit<Pizza, 'id'>` (bo `id` dokłada `nanoid()` wewnątrz). `addIngredient`/`removeIngredient` — payload `Ingredient` / `Ingredient['id']` (czyli `number`).
Pułapka: w testach zmień liczbowe id **pizzy** na stringi (np. `setActivePizza(3)` → `setActivePizza('3')`); id **składników** (`id: 1` itp.) zostają liczbami bez zmian.
Weryfikacja: `npm run typecheck`, `npx vitest run src/redux/orderSlice.test.ts`.

**Krok 9 — `store.js` → `store.ts`**
`export type RootState = ReturnType<typeof store.getState>;` `export type AppDispatch = typeof store.dispatch;`
Pułapka: `RootState` wyjdzie płaski (bez zagnieżdżenia pod `order`) — zgodnie z tym, jak `configureStore` jest dziś wywołany. Nie "poprawiaj" tego.
Weryfikacja: `npm run typecheck`.

**Krok 10 — Typowane hooki (`src/redux/hooks.ts`)**
```ts
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
```
Od Kroku 13 wzwyż komponenty importują te hooki zamiast gołego `useSelector`/`useDispatch` z `react-redux`.
Weryfikacja: `npm run typecheck`.

**Krok 11 — `selectors.js` → `selectors.ts` (+ test)**
Każdy selektor: `(state: RootState) => ...`. Zachowaj referencyjną stabilność `EMPTY_INGREDIENTS: Ingredient[]` (ten sam singleton, nie twórz nowej tablicy w typie).
Pułapka: fixture'y w `selectors.test.js` są niekompletne względem pełnego `OrderState`/`Pizza` (brakuje np. `totalAmount`, `orderDetails`, `name`/`price`/`quantity`) — trzeba je dopełnić (rozważ lokalny helper `buildState`/`buildPizza`, analogicznie do wzorca już istniejącego w `orderSlice.test.ts`). Liczbowe `id`/`activePizzaId` pizzy → stringi.
Weryfikacja: `npm run typecheck`, `npx vitest run src/redux/selectors.test.ts`.

**Punkt kontrolny Fazy B:** `npm run typecheck && npm run lint && npx vitest run && npm run build` — cała warstwa Redux w TS, komponenty nadal `.jsx` i działają bez zmian dzięki `allowJs`.

### FAZA C — Komponenty (od najprostszego do najtrudniejszego)

**Krok 12 — `Loader.jsx` → `Loader.tsx`**
`interface LoaderProps { color?: string; height?: string }`, `const Loader = ({ color = 'white', height = '20px' }: LoaderProps) => {...}`. Ustala konwencję (bez `React.FC`) dla reszty komponentów.
Weryfikacja: `npm run typecheck`, `npm run lint`.

**Krok 13 — `PizzaPreview.jsx` → `PizzaPreview.tsx`**
Pierwszy komponent na `useAppSelector` (z Kroku 10) zamiast gołego `useSelector`.
Weryfikacja: `npm run typecheck`, `npm run lint`.

**Krok 14 — `OrderSummary.jsx` → `OrderSummary.tsx`**
`formatCurrency(value: number, currency: string = 'EUR', locale: string = 'en-US'): string`.
Weryfikacja: `npm run typecheck`, `npm run lint`.

**Krok 15 — `PizzaSize.jsx` + test → `.tsx`**
`useAppDispatch`/`useAppSelector`. `sizes` — tablica `{ type: PizzaSizeValue; centimeters: number }[]`.
Pułapka: w `PizzaSize.test.jsx` helper `buildState` ma `id: 0`/`activePizzaId: 0` — zmień na stringi (`configureStore({ reducer: orderReducer, preloadedState })` wymusi teraz zgodność z `OrderState`).
Weryfikacja: `npm run typecheck`, `npx vitest run src/components/PizzaSize/PizzaSize.test.tsx`, `npm run lint`.

**Krok 16 — `PizzaIngredients.jsx` + test → `.tsx`**
Generator `ingredientId = ingredients.length + 1` zostaje bez zmian — dzięki `Ingredient.id: number` z Kroku 7 skompiluje się bez rzutowań.
Pułapka: ten sam wzorzec co w Kroku 15 — `buildState` w teście ma liczbowe id pizzy, zmień na stringi; obiekty ingredientów zostają bez zmian.
Weryfikacja: `npm run typecheck`, `npx vitest run src/components/PizzaIngredients/PizzaIngredients.test.tsx`, `npm run lint`.

**Krok 17 — `PizzaCreator.jsx` → `PizzaCreator.tsx`**
`useRef<boolean>(false)` dla `hasRequestedPizzaRef`. **Usuń martwy fragment** `<i className={... pizza.valid ? 'fa-check' : 'fa-times' ...}></i>` (linia 78) — zgodnie z decyzją użytkownika nie wprowadzamy pola `valid` do typu `Pizza`.
Weryfikacja: `npm run typecheck`, `npm run lint`, `npm run dev` (wizualnie sprawdź, że lista pizzy wygląda OK bez usuniętej ikony statusu).

**Krok 18 — `OrderForm.jsx` + test → `.tsx`**
Pola są stałym zestawem, więc otypuj precyzyjnie: `type FieldName = 'name' | 'email' | 'address' | 'postcode' | 'phone'`, `fields: { name: FieldName; label: string; type: string; placeholder: string }[]`, `values`/`errors`/`touched`: `Record<FieldName, string>` / `Record<FieldName, boolean>`. **Wyeksportuj** `export interface OrderFormChangePayload { formData: OrderDetails; isValid: boolean }` (reuse typu `OrderDetails` z `redux/types.ts`, Krok 7) — użyjesz go w propsach (`onFormChange?: (data: OrderFormChangePayload) => void`) i w `App.tsx` (Krok 20), zamiast redefiniować kształt dwa razy.
Pułapka: `Object.fromEntries(fields.map(...))` bywa kapryśne przy wnioskowaniu typu — jeśli TS zwęzi źle, dodaj jawną adnotację zwrotnego typu lub otypuj krotkę w `.map` (`.map((field): [FieldName, string] => [...])`). Test nie dotyka Reduxa (brak Providera) — najprostsza migracja testu.
Weryfikacja: `npm run typecheck`, `npx vitest run src/components/OrderForm/OrderForm.test.tsx`, `npm run lint`.

**Krok 19 — `Delivery.jsx` → `Delivery.tsx` (najtrudniejszy krok)**
Refs: `mapContainerRef: useRef<HTMLDivElement | null>`, `mapRef: useRef<mapboxgl.Map | null>`, `courierMarkerRef: useRef<mapboxgl.Marker | null>`, `animationFrameRef: useRef<number | null>` (requestAnimationFrame), `intervalRef`/`paymentTimeoutRef: useRef<ReturnType<typeof setInterval/setTimeout> | null>` (nie `number` — bezpieczne niezależnie od tego, które `lib`/`@types` akurat widzi dany plik). Minimalne własne interfejsy odpowiedzi REST (`MapboxGeocodeResponse`, `MapboxDirectionsResponse`) dla `geocodeAddress`/`getDirections` — rzutuj `await response.json() as ...`, inaczej `any` przecieknie. Lokalny `interface RouteGeoJSON { type: 'Feature'; properties: Record<string, never>; geometry: { type: 'LineString'; coordinates: [number, number][] } }` dla ręcznie budowanego obiektu trasy (typowanie strukturalne, bez `@types/geojson`). `origin`/`destination`/`coordinates` — wszędzie `[number, number]` / `[number, number][]`, spójnie z `environment.pizzeriaOrigin` z Kroku 6.
Pułapka: `map.getSource('route')` zwraca `mapboxgl.Source | undefined` — przed `.setData()` rzutuj `as mapboxgl.GeoJSONSource | undefined`.
Weryfikacja: `npm run typecheck`, `npm run lint`, **`npm run dev` z pełnym ręcznym przejściem ekranu Delivery** (płatność → mapa → animacja kuriera → dostarczono) — jedyny komponent bez testów automatycznych, więc ręczna weryfikacja jest tu obowiązkowa.

**Punkt kontrolny Fazy C:** `npm run typecheck && npm run lint && npx vitest run && npm run build && npm run dev` (pełny flow ręcznie: builder → order → delivery).

### FAZA D — Root aplikacji

**Krok 20 — `App.jsx` → `App.tsx`**
`type Step = (typeof STEP)[keyof typeof STEP]`, `useState<Step>(STEP.BUILDER)`. `orderForm` state: `useState<OrderFormChangePayload>(...)` (reużywając typ z Kroku 18, zamiast redefiniować). `handleOrderFormChange: (data: OrderFormChangePayload) => void`. `useAppDispatch()` zamiast gołego `useDispatch()`.
Weryfikacja: `npm run typecheck`, `npm run lint`, `npm run dev` (pełny flow ręcznie).

**Krok 21 — `main.jsx` → `main.tsx` + `index.html`**
`createRoot(document.getElementById('root')!)` — standardowy idiom asercji `!` w szablonach Vite TS (element gwarantowany przez `index.html`). **W tym samym kroku** zaktualizuj `index.html`: `<script type="module" src="/src/main.tsx">` — inaczej Vite dalej ładuje nieistniejący `main.jsx` (404 mimo zielonego typechecka).
Weryfikacja: `npm run typecheck`, `npm run lint`, `npm run dev` (pełny smoke test), `npm run build && npm run preview`.

### FAZA E — Domknięcie i zaostrzenie

**Krok 22 — Sprawdzenie kompletności**
`find src -name '*.jsx' -o -name '*.js'` musi zwrócić pustą listę. Jeśli coś zostało, wróć do brakującego kroku.

**Krok 23 — Zaostrzenie `tsconfig.app.json`**
`"allowJs": false`, usuń `"checkJs": false` (nieistotne bez `allowJs`).
Weryfikacja: `npm run typecheck` (musi dalej przechodzić — jeśli nie, coś zostało przeoczone w Kroku 22).

**Krok 24 — Finalny ESLint (opcjonalnie type-aware) i pełny przebieg**
Opcjonalnie włącz `tseslint.configs.recommendedTypeChecked` (z `parserOptions.projectService: true`) — dla projektu tej wielkości narzut jest pomijalny, rekomendowane. Opcjonalnie: `"build": "tsc -b && vite build"` w `package.json`, żeby build produkcyjny też blokował na błędach typów (dziś `vite build` przechodzi mimo błędów typów, bo esbuild ich nie sprawdza).
Weryfikacja końcowa (wszystko musi przejść czysto):
```
npm run typecheck
npm run lint
npx vitest run
npm run build
npm run dev      # ręczny smoke test całego flow
npm run preview
```

---

## Jak będzie wyglądać weryfikacja "check"

Po każdym kroku, gdy napiszesz `check`, przejrzę Twój diff (`git diff`/`git status`) i odpalę komendy wskazane w danym kroku (`npm run typecheck` jako główny sygnał poprawności typów, plus `lint`/`test`/`build`/`dev` gdy dotyczy). Zgłoszę błędy typów, niespójności z resztą kodu i pułapki wypisane w kroku — a jeśli wszystko gra, potwierdzę i poczekam na `next`.

## Krytyczne pliki

- `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts` — fundament, od którego zależy wszystko dalej
- `src/redux/store.js`, `src/redux/orderSlice.js`, `src/redux/selectors.js` — źródło typów domenowych dla całej reszty
- `src/components/Delivery/Delivery.jsx` — najtrudniejszy komponent (mapbox-gl)
- `src/components/OrderForm/OrderForm.jsx` — jedyny komponent z realnym propem, źródło `OrderFormChangePayload`
- `eslint.config.js` — wymaga rozszerzenia o `typescript-eslint`
