import { ensureAdminProfile } from '../models/admin.model.js';

export async function bootstrapAdminController(req, res) {
  try {
    const profile = await ensureAdminProfile(req.user?.email);
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
      },
    });
  } catch (error) {
    console.warn(`[auth] No se pudo preparar el perfil administrador: ${error.message}`);
    return res.status(500).json({ ok: false, status: 500, error: 'No se pudo preparar el perfil administrador.' });
  }
}
