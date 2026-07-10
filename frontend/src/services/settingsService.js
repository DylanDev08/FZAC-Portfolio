import { apiRequest, unwrapData } from './httpService.js';

export async function getSiteSettings() {
  try {
    const payload = await apiRequest('/site-settings/main');
    return unwrapData(payload);
  } catch {
    return null;
  }
}

export async function saveSiteSettings(settings) {
  await apiRequest('/site-settings/main', {
    method: 'PUT',
    auth: true,
    body: settings,
  });
}
