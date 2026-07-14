# Backend FZAC

API Express del portfolio con Supabase Auth, Supabase Storage, Prisma y PostgreSQL.

## Inicio local

```bash
npm install
npm run catalog:sync
npm run prisma:generate
npm run prisma:deploy:portfolio
npm run prisma:seed
npm run dev
```

El servidor utiliza el puerto configurado en `PORT` y falla con un mensaje claro si ese puerto ya está ocupado.

## Deploy en Render

- Crear un Blueprint desde el repositorio para que Render use `/render.yaml`.
- El Blueprint establece `backend` como Root Directory, genera Prisma Client, inicia Express con `npm start` e inspecciona `/health`.
- Render inyecta `PORT`; las credenciales de Supabase, Prisma y `ADMIN_EMAILS` deben cargarse como variables privadas del servicio.
- `CLIENT_URL` y `CORS_ORIGINS` deben contener el dominio exacto del frontend desplegado en Vercel.
- Las migraciones y el seed se ejecutan una sola vez antes del primer deploy, no como parte de cada inicio.

## Comandos

- `npm run dev`: inicia Express.
- `npm start`: inicio de producción Node.
- `npm run catalog:sync`: actualiza el catálogo de respaldo del backend desde el fallback del frontend.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:deploy:portfolio`: aplica SQL aditivo usando `DIRECT_URL`.
- `npm run prisma:seed`: agrega categorías, textos, admins y obras faltantes.
- `npm run check`: valida JavaScript y Prisma.

La documentación completa de variables, endpoints, uploads, administradores y deploy está en el [README principal](../README.md).
