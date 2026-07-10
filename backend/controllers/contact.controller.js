import { createContact, listContacts, updateContactStatus } from '../models/contact.model.js';

export async function createContactController(req, res) {
  try {
    const data = await createContact(req.body);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}

export async function listContactsController(_req, res) {
  try {
    const data = await listContacts();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function updateContactController(req, res) {
  try {
    const data = await updateContactStatus(req.params.id, req.body?.estado);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}
