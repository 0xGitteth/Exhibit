## Doel
Help de ontwikkelaar efficiënt met deze codebase: een React/TypeScript frontend voor een fotografie-georiënteerd sociaal netwerk (Exhibit).

Houd het beknopt — gebruik concrete voorbeelden uit de repository.

## Big picture
- Deze repo is een client-rendered React app (React 18) met TypeScript-typings. Belangrijke mappen:
  - `Components/` — herbruikbare UI-componenten en modals (bv. `CreatePostModal`).
  - `Entities/` — domain-modellen and simple data access helpers (e.g. `Post`, `User`, `Like`, `SavedPost`).
  - `Pages/` — route-level pages (bv. `Timeline`, `Discover`, `Profile`, `Analytics`).
  - `test-stubs/` — lightweight mocks used by smoke tests (see `scripts/smoke`).

Waarom deze structuur: Entities bevatten thin wrappers (static helpers like `User.me()` and `Post.create()`) used across components; Components are presentation + small behaviour (modals use `Dialog` primitives from `components/ui`).

## Dev workflows (quick)
- Install & lint/typecheck locally:

```bash
npm install
npm run typecheck    # runs `tsc --noEmit`
npm run lint         # runs eslint over TS/JS
```

- Smoke/render check (fast SSR-like render used during CI):

```bash
npm run smoke:test:cjs   # uses CJS entry, prints "CJS render OK" when successful
# or, if you prefer ts-node at runtime:
node -r ts-node/register ./scripts/smoke/smoke-render.ts
```

Notes: `package.json` previously ran a `smoke:test` that can error under plain Node ESM because `.ts` file extensions require `ts-node` or a compiled JS entry. The repo includes `smoke-test:cjs` which is reliable.

## Project-specific conventions & patterns
- Path aliases: `tsconfig.json` maps `@/*` to project root. Import with `@/components/...` or `@/entities/...`.
- Entities: each file in `Entities/` exposes small static helpers (e.g., `User.me()` in `Components/CreatePostModal`) — prefer using these instead of direct fetch calls when updating or reading user/post state.
- UI primitives: there is a `components/ui/` set of primitives (Dialog, Button, Input, Select, Badge, Alert, etc.). Prefer composing these rather than adding new raw HTML elements to keep styling consistent.
- Local state patterns: components use uncontrolled small state with React hooks and call entity helpers to perform actions (e.g., `Post.create()` in `Layout.js` after CreatePostModal completion).
- Content analysis integration: `Components/CreatePostModal` calls `InvokeLLM` and `UploadFile` from `integrations/Core` for image upload + safety checks. Treat these as external service boundaries — tests use `test-stubs/` to mock them.

## Testing & smoke harness
- `scripts/smoke/smoke-render.ts` renders `Pages/Analytics` with `react-dom/server` and prints a short success or failure. Use this for quick regression checks when changing page-level code.
- `test-stubs/` contains dummy implementations for `entities` and UI that the smoke script relies on. If adding new entity methods used by smoke tests, add a stub to `test-stubs/entities/`.

## Integration points & external deps
- LLM / Content analysis: `integrations/Core` provides `InvokeLLM` — pay attention to prompt & response_json_schema usage in `CreatePostModal`.
- File uploads: `UploadFile` returns `{ file_url }` and is consumed immediately by the analysis flow.
- Third-party libs: `lucide-react`, `framer-motion` and common tooling (ESLint, Prettier, TypeScript). Keep versions in `package.json` consistent when bumping.

## Common gotchas & troubleshooting
- ENOTDIR / file path errors: imports use `@/components/...` path alias. Ensure your editor/resolver supports `tsconfig` path mappings or use relative imports when uncertain.
- Running smoke tests: If you see "Unknown file extension .ts" run `npm run smoke:test:cjs` or invoke `node -r ts-node/register` as shown above.
- Lint-staged: this repo runs `lint-staged` via package.json. Recent automation auto-stages changes — do NOT include `git add` in staged command lists (already removed).

## Small examples to reference
- Create post flow: `Components/CreatePostModal` uploads image via `UploadFile`, runs `InvokeLLM` for moderation, then calls parent `onPostCreated` which in `Layout.js` calls `Post.create(newPost)`.
- User lookup: `Layout.js` loads current user with `User.me()` in a `useEffect` and stores in local state.

## When you edit code
- Run `npm run typecheck` and `npm run lint` before opening PRs.
- Update `test-stubs/` if you add or change entity APIs used by the smoke renderer.

If any section is unclear or you want more detail (e.g., entity method patterns, where integrations are implemented), tell me which area to expand and I'll iterate.
