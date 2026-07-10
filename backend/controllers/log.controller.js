import { createLoginLog, listLoginLogs } from '../models/log.model.js';

export async function createLoginLogController(req, res) {
  try {
    const data = await createLoginLog(req.body || {});
    res.status(201).json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}

export async function listLoginLogsController(_req, res) {
  try {
    const data = await listLoginLogs();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
