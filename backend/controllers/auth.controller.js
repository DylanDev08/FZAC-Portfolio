import { ensureAdminProfile } from '../models/admin.model.js';

export async function bootstrapAdminController(req, res) {
  const email = String(req.user?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, status: 400, error: 'No se pudo identificar al administrador.' });
  }

  try {
    const profile = await ensureAdminProfile(email);
    if (!profile) {
      return res.status(400).json({ ok: false, status: 400, error: 'No se pudo identificar al administrador.' });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        profileReady: true,
      },
    });
  } catch (error) {
    console.warn(`[auth] Perfil administrador no disponible, se permite acceso por token/email autorizado: ${error.message}`);
    return res.status(200).json({
      ok: true,
      status: 200,
      warning: 'Perfil administrador pendiente de sincronizar.',
      data: {
        id: req.user?.sub || null,
        email,
        name: 'Fortaleza Construcciones',
        role: 'admin',
        profileReady: false,
      },
    });
  }
}
