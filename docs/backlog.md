# Backlog ideas

Run the backend and frontend locally to smoke-test manually:
Start backend: in /backend run npm run dev
Start frontend: in /frontend run npm run dev
Try typing in the search input to see suggestions.
I can add unit tests for the backend search endpoint (Task 3.2). I’ll:
Create backend/tests/search.test.ts with happy path and empty query cases,
Use Jest and mock the Neo4j client or run against a test DB.
Then run the test suite and follow the task completion protocol.
Improve frontend UX:
Add keyboard navigation (arrow keys + Enter),
Style the dropdown and make it position/size-aware.

## Backend architecture

[ ] Improve schema and property sets to ease search performance.
[ ] Backend endpoints (API) for Fabrica/Jingle data
[ ] Test connection AuraDB and "restarting" sequence commands

## Frontend architecture

[ ] Set up CI pipeline for frontend tests
[ ] Add lazy-loading for route components
[ ] Implement the Fabrica detail UI (player + jingle list) and deep-link playback behavior

## Frontend UX/UI

[ ] Engine loading gif? (referencia: sponsor bujias "no arranca")
[ ] Fábrica resumen

- Lista de Jingleros: Tarjeta de personal
- Lista de tematicas: Menú de la cantina
- Lista de Jingles: Remito salida
- Lista de Canciones: Listado de materiales
  [ ] Interaccion:
- Libro de quejas
- Pedidos de mejoras: Presencia sindical
- Me gusta?
-

- Login:
  - Member: Puerta de Entrada del personal
  - Subscripcion: Entrada a la Usina
  - Admin: Gerencia

## Monetizar

- Merchandise digital
  - Stickers
- Merchandise fisico
  - Remera
  - Gorra
  - Tazas
  - Llaveros
