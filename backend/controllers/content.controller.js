import {
  createContent,
  deleteContent,
  getAllContent,
  updateContent,
} from '../models/content.model.js';

export function makeContentController(kind) {
  return {
    async list(_req, res) {
      try {
        const data = await getAllContent(kind);
        res.json({ ok: true, data });
      } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
      }
    },

    async create(req, res) {
      try {
        const data = await createContent(kind, req.body);
        res.status(201).json({ ok: true, status: 201, data });
      } catch (error) {
        res.status(400).json({ ok: false, status: 400, error: error.message });
      }
    },

    async update(req, res) {
      try {
        const data = await updateContent(kind, req.params.id, req.body);
        res.status(200).json({ ok: true, status: 200, data });
      } catch (error) {
        res.status(400).json({ ok: false, status: 400, error: error.message });
      }
    },

    async remove(req, res) {
      try {
        const data = await deleteContent(kind, req.params.id);
        res.status(200).json({ ok: true, status: 200, data });
      } catch (error) {
        res.status(400).json({ ok: false, status: 400, error: error.message });
      }
    },
  };
}
