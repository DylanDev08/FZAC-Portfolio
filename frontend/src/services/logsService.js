import { apiRequest, unwrapData } from './httpService.js';
import { normalizeDate } from './utils.js';

export async function createLoginLog({ email, success, reason = '' }) {
  try {
    await apiRequest('/login-logs', {
      method: 'POST',
      body: {
        email: String(email || '').toLowerCase(),
        success: Boolean(success),
        reason,
        userAgent: navigator.userAgent,
      },
    });
  } catch (error) {
    console.warn('[FZAC] No se pudo registrar evento de login:', error.message);
  }
}

export async function getLoginEvents() {
  const payload = await apiRequest('/login-logs', { auth: true });
  return unwrapData(payload).map((item) => ({
    id: item.id,
    ...item,
    createdAt: normalizeDate(item.createdAt),
  }));
}
