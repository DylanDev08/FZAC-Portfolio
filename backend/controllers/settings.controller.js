import { getSiteSettings, saveSiteSettings } from '../models/settings.model.js';

export async function getSiteSettingsController(req, res) {
  try {
    const data = await getSiteSettings(req.params.id || 'main');
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function saveSiteSettingsController(req, res) {
  try {
    const data = await saveSiteSettings(req.params.id || 'main', req.body || {});
    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}
