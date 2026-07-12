import {
  getAllObras,
  getObraById,
  createObra,
  updateObra,
  deleteObra,
} from '../models/fzac.model.js';
import { listSiteTexts, listWorks } from '../models/admin.model.js';

export async function listPortfolioWorks(_req, res) {
  try {
    const works = await listWorks();
    const visible = works.filter((work) => !['draft', 'archived'].includes(work.status));
    res.json({ ok: true, data: visible });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function listPublicSiteTexts(_req, res) {
  try {
    res.json({ ok: true, data: await listSiteTexts() });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function listObras(req, res) {
  try {
    const obras = await getAllObras();
    res.json({ ok: true, data: obras });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getObra(req, res) {
  try {
    const obra = await getObraById(req.params.id);
    if (!obra) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    res.json({ ok: true, data: obra });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createObraController(req, res) {
  try {
    const obra = await createObra(req.body);
    res.status(201).json({ ok: true, status: 201, data: obra });
  } catch (error) {
    res.status(400).json({ ok: false, status: 400, error: error.message });
  }
}

export async function updateObraController(req, res) {
  try {
    const obra = await updateObra(req.params.id, req.body);
    res.status(200).json({ ok: true, status: 200, data: obra });
  } catch (error) {
    res.status(400).json({ ok: false, status: 400, error: error.message });
  }
}

export async function deleteObraController(req, res) {
  try {
    const result = await deleteObra(req.params.id);
    res.status(200).json({ ok: true, status: 200, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, status: 400, error: error.message });
  }
}
