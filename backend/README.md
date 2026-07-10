# Backend FZAC

## Estructura
- models: lógica de persistencia y validación de obras
- controllers: manejo de requests HTTP
- routes: endpoints del CRUD con protección básica
- middleware: seguridad y validaciones

## Endpoints
- GET /health
- GET /api/fzac
- GET /api/fzac/:id
- POST /api/fzac
- PUT /api/fzac/:id
- DELETE /api/fzac/:id

## Inicio
```bash
cd backend
npm install
node server.js
```
