# Auditoría acotada de FZAC Portfolio — 27/10/2026

## Alcance
Revisión no destructiva de código y rutas públicas, sin modificar esquema de obras, catálogo, estado de obras, imágenes, textos comerciales, diseño, credenciales ni configuración de backend.

## Verificaciones
- La portada del despliegue de Vercel `https://fzac-portfolio-ntt3.vercel.app/` respondió correctamente y mostró servicios y acceso a obras.
- La ficha `/obra/marvel` mostró las galerías por sucursal y textos de la obra.
- `/proyectos` falló en **dos consultas de la web pública** con `Unable to preload CSS for .../assets/Projects-Bfm2oPAD.css`. No se confirma todavía si la causa es caché, archivos de compilación ausentes, o distribución del asset en Vercel.
- Los intentos de leer `https://fortalezaconstrucciones.com.ar/` y su variante `www` con un extractor externo no pudieron validar la URL (`invalid_url`). **Eso no demuestra por sí solo que el dominio esté caído**; se debe comprobar DNS y propiedad desde el panel de hosting si se usa como URL pública.
- La web usa React/Vite, cargas diferidas, galerías por sucursal y navegación con flechas. El código conserva el esquema y diseño existentes.
- `robots.txt`, `sitemap.xml`, metadatos y schema JSON-LD ya están presentes. Son archivos estáticos: el sitemap actual no incorpora automáticamente obras nuevas creadas por administración; automatizar esto requeriría un corte distinto.

## Cambios mínimos de esta rama
1. Recuperación acotada de error específico de Vite `vite:preloadError`: recarga **una sola vez en la ventana de un minuto** cuando el navegador intenta precargar un chunk CSS/JS viejo, sin recargas infinitas.
2. Página de error de React con texto claro para usuarios, sin exponer instrucciones internas de desarrollo.
3. Galerías: al salir con el mouse o el foco se desactiva la captura de las flechas; también se ignoran entradas editables. Se marca la miniatura seleccionada con `aria-pressed`.
4. Imagen de respaldo: se intenta una única vez si el recurso original falla, evitando bucles si también falta la imagen de respaldo.

## Sin cambios
- Ninguna modificación a obras, sucursales, portadas, videos o API.
- Ningún CSS reescrito ni cambios de colores, espacios o posiciones.
- No se modifican envíos de materiales, checkout, Merchant Center o el PR #47 del e-commerce.
- No se modifica Render, Vercel, Supabase, DNS ni variables de entorno.
- El PR no se fusiona ni despliega automáticamente.

## Validación después del merge/despliegue (pendiente)
1. Confirmar que Vercel sirve el CSS `/assets/Projects-*.css` del build desplegado y devuelve 200.
2. Probar `/proyectos`, `/obra/marvel`, `/obra/sliders-hamburger` en escritorio y celular sin errores de consola.
3. Comprobar cambios de sucursal, flechas, miniaturas, ampliación y cierre con Escape.
4. Abrir página tras un nuevo despliegue para comprobar recuperación de caché sin bucles de recarga.
5. Revisar dominio canónico, sitemap y Search Console del portfolio si se desea indexarlo, sin confundir este sitio institucional con el e-commerce de materiales.
