import {
  createCategory,
  createSiteText,
  createWork,
  createWorkImage,
  deleteCategory,
  deleteSiteText,
  deleteWork,
  deleteWorkImage,
  getWork,
  listCategories,
  listSiteTexts,
  listWorkImages,
  listWorks,
  syncPortfolioCatalog,
  updateCategory,
  updateSiteText,
  updateWork,
  updateWorkStatus,
  updateWorkImage,
} from '../models/admin.model.js';
import { portfolioCatalog } from '../data/portfolio-catalog.js';
import { uploadImageToStorage } from '../services/upload.service.js';
import { parseMultipartForm } from '../utils/multipart.js';

function ok(res, status, data) {
  return res.status(status).json({ ok: true, status, data });
}

function fail(res, error, fallbackStatus = 400) {
  const status = error.status || fallbackStatus;
  console.warn(`[admin] ${status}: ${error.message}`);
  return res.status(status).json({ ok: false, status, error: error.message });
}

export async function uploadController(req, res) {
  try {
    const { fields, files } = await parseMultipartForm(req);
    const file = files[0];
    if (!file) {
      const error = new Error('No se recibió ningún archivo en el campo file.');
      error.status = 400;
      throw error;
    }

    const folder = fields.folder || 'uploads';
    console.info(`[admin] upload received name=${file.filename} type=${file.contentType} bytes=${file.buffer.length} folder=${folder}`);
    const uploaded = await uploadImageToStorage(file, folder);
    console.info(`[admin] upload ok bucket=${uploaded.bucket} path=${uploaded.path} bytes=${uploaded.sizeBytes}`);
    return ok(res, 201, uploaded);
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function listWorksController(_req, res) {
  try {
    return ok(res, 200, await listWorks());
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function getWorkController(req, res) {
  try {
    const data = await getWork(req.params.id);
    if (!data) {
      const error = new Error('Obra no encontrada.');
      error.status = 404;
      throw error;
    }
    return ok(res, 200, data);
  } catch (error) {
    return fail(res, error, error.status || 500);
  }
}

export async function createWorkController(req, res) {
  try {
    const data = await createWork(req.body, req.user?.email, req.user?.sub);
    console.info(`[admin] work created id=${data.id} slug=${data.slug}`);
    return ok(res, 201, data);
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function updateWorkController(req, res) {
  try {
    const data = await updateWork(req.params.id, req.body, req.user?.email, req.user?.sub);
    console.info(`[admin] work updated id=${data.id} slug=${data.slug}`);
    return ok(res, 200, data);
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function updateWorkStatusController(req, res) {
  try {
    const data = await updateWorkStatus(req.params.id, req.body?.status || req.body?.estado);
    console.info(`[admin] work status updated id=${data.id} status=${data.estado}`);
    return ok(res, 200, data);
  } catch (error) {
    return fail(res, error, error.status || 400);
  }
}

export async function deleteWorkController(req, res) {
  try {
    const data = await deleteWork(req.params.id);
    console.info(`[admin] work deleted id=${data.id}`);
    return ok(res, 200, data);
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function syncWorksController(req, res) {
  try {
    const data = await syncPortfolioCatalog(portfolioCatalog, req.user?.email);
    console.info(`[admin] portfolio catalog synchronized created=${data.created} total=${data.total}`);
    return ok(res, data.created ? 201 : 200, data);
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function listCategoriesController(_req, res) {
  try {
    return ok(res, 200, await listCategories());
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function createCategoryController(req, res) {
  try {
    return ok(res, 201, await createCategory(req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function updateCategoryController(req, res) {
  try {
    return ok(res, 200, await updateCategory(req.params.id, req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function deleteCategoryController(req, res) {
  try {
    return ok(res, 200, await deleteCategory(req.params.id));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function listSiteTextsController(_req, res) {
  try {
    return ok(res, 200, await listSiteTexts());
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function createSiteTextController(req, res) {
  try {
    return ok(res, 201, await createSiteText(req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function updateSiteTextController(req, res) {
  try {
    return ok(res, 200, await updateSiteText(req.params.id, req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function deleteSiteTextController(req, res) {
  try {
    return ok(res, 200, await deleteSiteText(req.params.id));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function listWorkImagesController(req, res) {
  try {
    return ok(res, 200, await listWorkImages(req.query.workId));
  } catch (error) {
    return fail(res, error, 500);
  }
}

export async function createWorkImageController(req, res) {
  try {
    return ok(res, 201, await createWorkImage(req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function updateWorkImageController(req, res) {
  try {
    return ok(res, 200, await updateWorkImage(req.params.id, req.body));
  } catch (error) {
    return fail(res, error, 400);
  }
}

export async function deleteWorkImageController(req, res) {
  try {
    return ok(res, 200, await deleteWorkImage(req.params.id));
  } catch (error) {
    return fail(res, error, 400);
  }
}
