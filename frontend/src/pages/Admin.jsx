import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Images, Plus, Trash2 } from 'lucide-react';
import { deleteProject, getAdminProjects, saveProject, syncProjectCatalog, updateProjectStatus } from '../services/projectsService.js';
import { logout } from '../services/authService.js';
import { slugify } from '../services/utils.js';
import { COLLECTIONS, deleteContentItem, getAdminEventos, getAdminTrabajos, saveContentItem } from '../services/contentService.js';
import { isStorageUploadReady, uploadAsset, uploadManyAssets } from '../services/storageService.js';
import { deleteCategory, deleteSiteText, getCategories, getSiteTexts, saveCategory, saveSiteText } from '../services/adminContentService.js';
import { subscribeAdminCrud } from '../services/realtimeService.js';

const EMPTY = {
  id: '',
  nombre: '',
  titulo: '',
  slug: '',
  tipo: 'Local gastronómico',
  categoria: '',
  direccion: '',
  ubicacion: '',
  anio: '',
  estado: 'finalizada',
  avance: 100,
  descripcion: '',
  proceso: '',
  finalizacion: '',
  portada: '',
  imagenes: [],
  imagenesAntes: [],
  imagenesProceso: [],
  imagenesFinal: [],
  video: '',
  videos: [],
  galeriaVideo: [],
  sucursales: [],
  stages: [],
  puntos: [],
  destacado: false,
  order: 0,
};

const EMPTY_CATEGORY = {
  id: '',
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  isActive: true,
};

const EMPTY_SITE_TEXT = {
  id: '',
  key: '',
  title: '',
  value: '',
  section: 'general',
  description: '',
};

const RESOURCE_CONFIG = {
  obras: {
    label: 'Obras',
    singular: 'obra',
    collection: 'obras',
    fetch: getAdminProjects,
    save: saveProject,
    remove: deleteProject,
    folder: 'obras',
    fields: 'obra',
  },
  trabajos: {
    label: 'Trabajos varios',
    singular: 'trabajo',
    collection: COLLECTIONS.trabajos,
    fetch: getAdminTrabajos,
    save: (item) => saveContentItem(COLLECTIONS.trabajos, item),
    remove: (id) => deleteContentItem(COLLECTIONS.trabajos, id),
    folder: 'trabajos-varios',
    fields: 'referencia',
  },
  eventos: {
    label: 'Eventos',
    singular: 'evento',
    collection: COLLECTIONS.eventos,
    fetch: getAdminEventos,
    save: (item) => saveContentItem(COLLECTIONS.eventos, item),
    remove: (id) => deleteContentItem(COLLECTIONS.eventos, id),
    folder: 'eventos',
    fields: 'evento',
  },
};

const ESTADOS = [
  ['finalizada', 'Finalizada'],
  ['construyendo', 'En proceso'],
  ['por-comenzar', 'Por comenzar'],
];

const IMAGE_STAGE_OPTIONS = [
  { value: 'imagenes', label: 'Galeria general' },
  { value: 'imagenesAntes', label: 'Antes' },
  { value: 'imagenesProceso', label: 'En proceso' },
  { value: 'imagenesFinal', label: 'Finalizada' },
];

const BRANCH_IMAGE_KEYS = IMAGE_STAGE_OPTIONS.map(({ value }) => value);

const TIPOS_OBRA = [
  'Local gastronómico',
  'Local de juegos',
  'Planificación y ejecución integral',
  'Proyecto residencial integral',
  'Vivienda residencial',
  'Construcción húmeda y tradicional',
];

const TIPOS_TRABAJO = [
  'Planificación y ejecución integral',
  'Sistemas livianos / fachada',
  'Pintura y terminaciones',
  'Interiores / ambientación',
  'Sistema de aluminio / terminaciones',
  'Pérgolas / escaleras / entrepisos',
  'Electricidad',
  'Plomería integral / gas',
];

const TIPOS_EVENTO = [
  'Evento gastronómico',
  'Participación comercial',
  'Armado de espacios',
];

function toArray(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function assetUrl(item) {
  return typeof item === 'string' ? item : (item?.url || item?.publicUrl || item?.image_url || item?.imageUrl || '');
}

function arrToText(value) {
  return Array.isArray(value) ? value.map(assetUrl).filter(Boolean).join('\n') : String(value || '');
}

function moveArrayItem(items, index, direction) {
  const list = toArray(items);
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= list.length) return list;
  const next = [...list];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function editableImage(item) {
  if (typeof item === 'object' && item) return { ...item };
  const url = assetUrl(item);
  return { url, imageUrl: url, image_url: url, imagePath: url, image_path: url, alt: '' };
}

function uniqueImageCount(...sources) {
  const urls = sources
    .flatMap((source) => Array.isArray(source) ? source : [source])
    .map(assetUrl)
    .filter(Boolean);
  return new Set(urls).size;
}

function uniqueImages(items, seen = new Set()) {
  return toArray(items).filter((item) => {
    const url = assetUrl(item);
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function normalizeBranchGallery(branch = {}) {
  const seen = new Set();
  const coverUrl = assetUrl(branch.portada);
  if (coverUrl) seen.add(coverUrl);

  const normalized = {
    ...branch,
    nombre: String(branch.nombre || '').trim(),
    direccion: String(branch.direccion || '').trim(),
    portada: branch.portada || '',
  };

  // Las etapas tienen prioridad sobre la galeria general para evitar duplicados.
  ['imagenesAntes', 'imagenesProceso', 'imagenesFinal', 'imagenes'].forEach((key) => {
    normalized[key] = uniqueImages(branch[key], seen);
  });

  return normalized;
}

function branchImageUrls(branches) {
  const urls = new Set();
  toArray(branches).forEach((branch) => {
    [branch.portada, ...BRANCH_IMAGE_KEYS.flatMap((key) => toArray(branch[key]))]
      .map(assetUrl)
      .filter(Boolean)
      .forEach((url) => urls.add(url));
  });
  return urls;
}

function GalleryBalance({ count, label = 'Galería' }) {
  const state = count === 0 ? 'empty' : (count >= 5 && count <= 8 ? 'balanced' : 'attention');
  const detail = count === 0
    ? 'Todavía no tiene fotos.'
    : count < 5
      ? `Sumá ${5 - count} foto(s) para alcanzar el mínimo recomendado.`
      : count > 8
        ? 'Elegí las 8 fotos más representativas para mantener galerías parejas.'
        : 'Cantidad equilibrada. El rango recomendado es de 5 a 8 fotos.';

  return (
    <div className={`admin-gallery-balance admin-gallery-balance--${state}`}>
      <Images aria-hidden="true" size={19} />
      <div>
        <strong>{label}: {count} foto{count === 1 ? '' : 's'} única{count === 1 ? '' : 's'}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function gallerySummaries(work) {
  const branches = Array.isArray(work.sucursales) ? work.sucursales : [];
  const sources = branches.length ? branches : [work];
  return sources.map((source, index) => ({
    label: source.nombre || `Galería ${index + 1}`,
    count: uniqueImageCount(source.portada, source.imagenes, source.imagenesAntes, source.imagenesProceso, source.imagenesFinal),
  }));
}

function getOptions(kind) {
  if (kind === 'eventos') return TIPOS_EVENTO;
  if (kind === 'trabajos') return TIPOS_TRABAJO;
  return TIPOS_OBRA;
}

function normalizeForForm(item = {}) {
  const workImages = Array.isArray(item.workImages) ? item.workImages : [];
  const bySection = (section, fallback) => {
    const matches = workImages.filter((image) => image.section === section);
    return matches.length ? matches : (Array.isArray(fallback) ? fallback : []);
  };
  const branches = (Array.isArray(item.sucursales) ? item.sucursales : []).map(normalizeBranchGallery);
  const assignedToBranches = branchImageUrls(branches);
  const unassigned = (section, fallback) => bySection(section, fallback)
    .filter((image) => !assignedToBranches.has(assetUrl(image)));
  return {
    ...EMPTY,
    ...item,
    titulo: item.titulo || item.nombre || '',
    nombre: item.nombre || item.titulo || '',
    anio: item.anio || item.año || '',
    imagenes: unassigned('gallery', item.imagenes),
    imagenesAntes: unassigned('before', item.imagenesAntes),
    imagenesProceso: unassigned('process', item.imagenesProceso),
    imagenesFinal: unassigned('final', item.imagenesFinal),
    videos: Array.isArray(item.videos) ? item.videos : [],
    galeriaVideo: Array.isArray(item.galeriaVideo) ? item.galeriaVideo : [],
    stages: Array.isArray(item.stages) ? item.stages : [],
    puntos: Array.isArray(item.puntos) ? item.puntos : [],
    sucursales: branches,
  };
}

function buildPayload(form, kind) {
  const nombre = String(form.nombre || form.titulo || '').trim();
  const slug = slugify(form.slug || nombre);
  const base = {
    ...form,
    nombre,
    titulo: nombre,
    slug,
    direccion: String(form.direccion || '').trim(),
    anio: String(form.anio || '').trim(),
    order: Number(form.order || 0),
    avance: Math.max(0, Math.min(100, Number(form.avance || 0))),
    imagenes: toArray(form.imagenes),
    imagenesAntes: toArray(form.imagenesAntes),
    imagenesProceso: toArray(form.imagenesProceso),
    imagenesFinal: toArray(form.imagenesFinal),
    videos: toArray(form.videos),
    galeriaVideo: toArray(form.galeriaVideo),
    stages: toArray(form.stages),
    puntos: toArray(form.puntos),
    sucursales: toArray(form.sucursales).map(normalizeBranchGallery),
    destacado: Boolean(form.destacado),
  };

  if (kind === 'eventos') {
    base.categoria = form.categoria || 'Eventos y participaciones';
    base.estado = '';
  }

  if (kind === 'trabajos') {
    base.categoria = form.categoria || 'Trabajos varios';
    base.estado = 'finalizada';
    base.avance = 100;
  }

  return base;
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({ label, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <textarea rows={rows} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function FileInput({
  label,
  accept,
  multiple,
  onChange,
  help,
  disabled = false,
  previewItems = [],
  previewType = 'image',
  onRemovePreview,
  onMovePreview,
  onEditPreview,
  stageValue = '',
  stageOptions = [],
  onStageChange,
}) {
  const previews = Array.isArray(previewItems) ? previewItems.filter(Boolean) : [];

  return (
    <label className={`admin-upload-box ${disabled ? 'is-disabled' : ''}`}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onClick={(e) => { e.currentTarget.value = ''; }}
        onChange={(e) => onChange(e.target.files)}
      />
      <span className="admin-upload-box__icon">+</span>
      <strong>{label}</strong>
      {help && <small>{help}</small>}
      <em>Hacé clic para seleccionar desde tu equipo</em>
      {previews.length > 0 && (
        <div className="admin-upload-preview">
          {previews.map((item, index) => {
            const src = assetUrl(item);
            if (!src) return null;
            return (
            <span className="admin-upload-preview__item" key={`${src}-${index}`}>
              <span className="admin-upload-preview__position">{index + 1}</span>
              {previewType === 'video'
                ? <video src={src} preload="metadata" muted />
                : <img src={src} alt={`${label} ${index + 1}`} loading="lazy" />}
              <span className="admin-upload-preview__actions">
              {onMovePreview && (
                <>
                  <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onMovePreview(index, -1); }} disabled={index === 0} title="Mover a la izquierda" aria-label="Mover a la izquierda"><ArrowLeft size={15} /></button>
                  <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onMovePreview(index, 1); }} disabled={index === previews.length - 1} title="Mover a la derecha" aria-label="Mover a la derecha"><ArrowRight size={15} /></button>
                </>
              )}
              {onRemovePreview && (
                <button
                  className="is-danger"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onRemovePreview(index);
                  }}
                  title="Eliminar foto"
                  aria-label="Eliminar foto"
                >
                  <Trash2 size={15} />
                </button>
              )}
              </span>
              {stageOptions.length > 0 && onStageChange && (
                <select className="admin-upload-preview__stage" value={stageValue} onClick={(event) => event.stopPropagation()} onChange={(event) => onStageChange(index, event.target.value)} aria-label="Etapa de la foto">
                  {stageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              )}
              {previewType === 'image' && onEditPreview && (
                <input className="admin-upload-preview__alt" value={item?.alt || ''} onClick={(event) => event.stopPropagation()} onChange={(event) => onEditPreview(index, { alt: event.target.value })} placeholder="Descripcion de la foto" aria-label="Descripcion de la foto" />
              )}
            </span>
          ); })}
        </div>
      )}
    </label>
  );
}

function BranchGalleryEditor({ form, setForm, onUpload, uploading }) {
  const branches = Array.isArray(form.sucursales) ? form.sucursales : [];
  const setBranches = (next) => setForm((prev) => ({ ...prev, sucursales: next }));
  const updateBranch = (index, changes) => setBranches(branches.map((branch, branchIndex) => branchIndex === index ? { ...branch, ...changes } : branch));
  const moveBranch = (index, direction) => setBranches(moveArrayItem(branches, index, direction));
  const updateMedia = (branchIndex, key, updater) => {
    const branch = branches[branchIndex] || {};
    const current = toArray(branch[key]);
    updateBranch(branchIndex, { [key]: updater(current) });
  };
  const transferMedia = (branchIndex, fromKey, imageIndex, toKey) => {
    if (fromKey === toKey) return;
    const branch = branches[branchIndex] || {};
    const source = toArray(branch[fromKey]);
    const selected = source[imageIndex];
    if (!selected) return;
    updateBranch(branchIndex, {
      [fromKey]: source.filter((_, index) => index !== imageIndex),
      [toKey]: [...toArray(branch[toKey]), selected],
    });
  };
  const addBranch = () => setBranches([...branches, {
    id: '', nombre: `Sucursal ${branches.length + 1}`, direccion: '', portada: '', imagenes: [], imagenesAntes: [], imagenesProceso: [], imagenesFinal: [],
  }]);

  return (
    <section className="admin-branches-editor">
      <div className="admin-branches-editor__head">
        <div><span className="eyebrow">Galerías de la obra</span><h3>{branches.length ? 'Una galería por local' : 'Galería principal'}</h3><p>{branches.length ? 'Cada sucursal conserva su portada, dirección y etapas sin mezclar fotos.' : 'Esta obra usa la galería principal. Agregá una sucursal solo si tiene más de un local.'}</p></div>
        <button className="btn btn--ghost" type="button" onClick={addBranch}><Plus size={17} /> Agregar sucursal</button>
      </div>

      {!branches.length && (
        <div className="admin-branches-editor__empty">
          <Images size={20} aria-hidden="true" />
          <span>Las fotos se administran arriba como una única galería de obra.</span>
        </div>
      )}

      {branches.map((branch, branchIndex) => (
        <article className="admin-branch-card" key={branch.id || `${branch.nombre}-${branchIndex}`}>
          <div className="admin-branch-card__head">
            <div className="admin-branch-card__identity">
              <span>Galería {branchIndex + 1}</span>
              <strong>{branch.nombre || `Sucursal ${branchIndex + 1}`}</strong>
              {branch.direccion && <small>{branch.direccion}</small>}
            </div>
            <div className="admin-branch-card__actions">
              <button type="button" onClick={() => moveBranch(branchIndex, -1)} disabled={branchIndex === 0} title="Mover galería hacia arriba" aria-label="Mover galería hacia arriba"><ArrowUp size={16} /></button>
              <button type="button" onClick={() => moveBranch(branchIndex, 1)} disabled={branchIndex === branches.length - 1} title="Mover galería hacia abajo" aria-label="Mover galería hacia abajo"><ArrowDown size={16} /></button>
              <button className="admin-icon-danger" type="button" onClick={() => {
                if (window.confirm('¿Eliminar esta sucursal y su galería?')) setBranches(branches.filter((_, index) => index !== branchIndex));
              }} title="Eliminar sucursal" aria-label="Eliminar sucursal"><Trash2 size={17} /></button>
            </div>
          </div>
          <GalleryBalance
            label="Galería del local"
            count={uniqueImageCount(branch.portada, branch.imagenes, branch.imagenesAntes, branch.imagenesProceso, branch.imagenesFinal)}
          />
          <div className="admin-form__grid">
            <Field label="Nombre del local" value={branch.nombre} onChange={(value) => updateBranch(branchIndex, { nombre: value })} placeholder="Ej. Pellegrini" />
            <Field label="Dirección" value={branch.direccion} onChange={(value) => updateBranch(branchIndex, { direccion: value })} placeholder="Calle, número, ciudad" />
          </div>
          <div className="admin-upload-grid admin-upload-grid--branches">
            <FileInput
              label="Portada del local"
              accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
              disabled={uploading || !isStorageUploadReady}
              previewItems={branch.portada ? [branch.portada] : []}
              onRemovePreview={() => updateBranch(branchIndex, { portada: '' })}
              onChange={(files) => onUpload({ branchIndex, target: 'portada' }, files)}
            />
            {IMAGE_STAGE_OPTIONS.map(({ value: key, label }) => (
              <FileInput
                key={key}
                label={label}
                accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
                multiple
                disabled={uploading || !isStorageUploadReady}
                previewItems={branch[key]}
                onRemovePreview={(index) => updateMedia(branchIndex, key, (items) => items.filter((_, itemIndex) => itemIndex !== index))}
                onMovePreview={(index, direction) => updateMedia(branchIndex, key, (items) => moveArrayItem(items, index, direction))}
                onEditPreview={(index, changes) => updateMedia(branchIndex, key, (items) => items.map((item, itemIndex) => itemIndex === index ? { ...editableImage(item), ...changes } : item))}
                stageValue={key}
                stageOptions={IMAGE_STAGE_OPTIONS}
                onStageChange={(index, target) => transferMedia(branchIndex, key, index, target)}
                onChange={(files) => onUpload({ branchIndex, target: key }, files)}
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function UnassignedGalleryEditor({ form, setForm }) {
  const branches = toArray(form.sucursales);
  const groups = IMAGE_STAGE_OPTIONS
    .map(({ value, label }) => ({ key: value, label, items: toArray(form[value]) }))
    .filter(({ items }) => items.length);

  if (!branches.length || !groups.length) return null;

  const assignToBranch = (sourceKey, imageIndex, branchIndex) => {
    setForm((prev) => {
      const source = toArray(prev[sourceKey]);
      const image = source[imageIndex];
      if (!image) return prev;

      return {
        ...prev,
        [sourceKey]: source.filter((_, index) => index !== imageIndex),
        sucursales: toArray(prev.sucursales).map((branch, index) => index === branchIndex
          ? { ...branch, [sourceKey]: [...toArray(branch[sourceKey]), image] }
          : branch),
      };
    });
  };

  const removeImage = (sourceKey, imageIndex) => setForm((prev) => ({
    ...prev,
    [sourceKey]: toArray(prev[sourceKey]).filter((_, index) => index !== imageIndex),
  }));

  return (
    <section className="admin-unassigned-gallery">
      <div className="admin-unassigned-gallery__head">
        <div>
          <span className="eyebrow">Pendiente de ordenar</span>
          <h3>Fotos sin sucursal asignada</h3>
          <p>Estas fotos antiguas no están mezcladas con los locales. Asignalas a la galería correcta o eliminalas.</p>
        </div>
        <strong>{groups.reduce((total, group) => total + group.items.length, 0)} pendiente(s)</strong>
      </div>
      <div className="admin-unassigned-gallery__grid">
        {groups.flatMap(({ key, label, items }) => items.map((item, imageIndex) => {
          const src = assetUrl(item);
          return (
            <article className="admin-unassigned-image" key={`${key}-${src}-${imageIndex}`}>
              <img src={src} alt={item?.alt || `Foto sin asignar ${imageIndex + 1}`} loading="lazy" />
              <div>
                <span>{label}</span>
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value !== '') assignToBranch(key, imageIndex, Number(event.target.value));
                  }}
                  aria-label="Asignar foto a una sucursal"
                >
                  <option value="" disabled>Asignar a un local...</option>
                  {branches.map((branch, branchIndex) => (
                    <option key={branch.id || `${branch.nombre}-${branchIndex}`} value={branchIndex}>
                      {branch.nombre || `Sucursal ${branchIndex + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => removeImage(key, imageIndex)} title="Eliminar foto sin asignar" aria-label="Eliminar foto sin asignar"><Trash2 size={16} /></button>
            </article>
          );
        }))}
      </div>
    </section>
  );
}

function ContentForm({ kind, form, setForm, onSubmit, onClear, onUpload, uploading, message, categories = [] }) {
  const cfg = RESOURCE_CONFIG[kind];
  const isEvent = kind === 'eventos';
  const isWork = kind === 'trabajos';
  const isObra = kind === 'obras';
  const hasBranchGalleries = isObra && toArray(form.sucursales).length > 0;

  const set = (key, value) => setForm((prev) => {
    const next = { ...prev, [key]: value };
    if ((key === 'nombre' || key === 'titulo') && !prev.id) next.slug = slugify(value);
    return next;
  });

  const removeFrom = (key, index) => set(key, toArray(form[key]).filter((_, i) => i !== index));
  const moveIn = (key, index, direction) => set(key, moveArrayItem(form[key], index, direction));
  const editIn = (key, index, changes) => setForm((prev) => ({
    ...prev,
    [key]: toArray(prev[key]).map((item, itemIndex) => itemIndex === index ? { ...editableImage(item), ...changes } : item),
  }));
  const transferFrom = (fromKey, index, toKey) => {
    if (fromKey === toKey) return;
    setForm((prev) => {
      const source = toArray(prev[fromKey]);
      const selected = source[index];
      if (!selected) return prev;
      return {
        ...prev,
        [fromKey]: source.filter((_, itemIndex) => itemIndex !== index),
        [toKey]: [...toArray(prev[toKey]), selected],
      };
    });
  };

  return (
    <article className="admin-card admin-card--form">
      <div className="admin-card__header">
        <span className="eyebrow">{cfg.label}</span>
        <h2>{form.id ? `Editar ${cfg.singular}` : `Nuevo ${cfg.singular}`}</h2>
        <p>Cargá el contenido desde acá. El sitio público se actualiza automáticamente y el panel se sincroniza en tiempo real.</p>
      </div>

      {message && <p className="admin-feedback" role="status">{message}</p>}

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-form__grid">
          <Field label="Nombre" value={form.nombre} onChange={(v) => set('nombre', v)} placeholder="Ej. Marvel Food Rosario" />
          <Field label="Slug" value={form.slug} onChange={(v) => set('slug', v)} placeholder="marvel-food-rosario" />
          <Select label="Tipo" value={form.tipo} onChange={(v) => set('tipo', v)} options={getOptions(kind)} />
          {isObra && categories.length > 0 && (
            <div className="form-row">
              <label>Categoría</label>
              <select value={form.categoryId || ''} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name || category.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <Field label="Dirección" value={form.direccion} onChange={(v) => set('direccion', v)} placeholder="Jujuy 2254, Rosario, Santa Fe" />
          <Field label="Ubicación" value={form.ubicacion} onChange={(v) => set('ubicacion', v)} placeholder="Rosario, Santa Fe" />
          <Field label="Año" value={form.anio} onChange={(v) => set('anio', v)} placeholder="2026" />
          <Field label="Orden" value={form.order} onChange={(v) => set('order', v)} type="number" />
          {isObra && <Field label="Avance %" value={form.avance} onChange={(v) => set('avance', v)} type="number" />}
          {isObra && (
            <div className="form-row">
              <label>Estado</label>
              <select value={form.estado || 'finalizada'} onChange={(e) => set('estado', e.target.value)}>
                {ESTADOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          )}
          {(isEvent || isWork) && <Field label="Categoría" value={form.categoria} onChange={(v) => set('categoria', v)} placeholder={isEvent ? 'Eventos y participaciones' : 'Trabajos varios'} />}
        </div>

        <label className="admin-check">
          <input type="checkbox" checked={Boolean(form.destacado)} onChange={(e) => set('destacado', e.target.checked)} />
          <span>Destacar en el sitio</span>
        </label>

        <div className="admin-media-panel">
          <div className="admin-media-panel__head">
            <span className="eyebrow">Multimedia</span>
            <h3>{hasBranchGalleries ? 'Portada general de la obra' : 'Galería principal de la obra'}</h3>
            <p>
              {hasBranchGalleries
                ? 'Esta portada identifica la obra en el portfolio. Las fotos del recorrido se administran por local más abajo.'
                : 'Subí fotos desde el panel y ordenalas por portada, galería, antes, proceso y finalizada. Supabase Storage guarda el archivo y la base registra la URL automáticamente.'}
            </p>
            {!isStorageUploadReady && (
              <p className="admin-media-warning">
                Para habilitar carga real de archivos revisá que las credenciales de Supabase Storage estén completas
                en el archivo <code>.env</code>.
              </p>
            )}
          </div>

          {isObra && !hasBranchGalleries && (
            <GalleryBalance
              label="Galería principal"
              count={uniqueImageCount(form.portada, form.imagenes, form.imagenesAntes, form.imagenesProceso, form.imagenesFinal)}
            />
          )}

          <div className="admin-upload-grid">
            <FileInput
              label="Subir portada"
              accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
              help="Imagen principal para la card y el detalle. Se admiten fotos comunes de celular y cámara."
              disabled={uploading || !isStorageUploadReady}
              previewItems={form.portada ? [form.portada] : []}
              onRemovePreview={() => set('portada', '')}
              onChange={(files) => onUpload('portada', files)}
            />
            {!hasBranchGalleries && (
              <>
            <FileInput
              label="Subir galería general"
              accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
              multiple
              help="Fotos visibles en el registro visual general."
              disabled={uploading || !isStorageUploadReady}
              previewItems={form.imagenes}
              onRemovePreview={(index) => removeFrom('imagenes', index)}
              onMovePreview={(index, direction) => moveIn('imagenes', index, direction)}
              onEditPreview={(index, changes) => editIn('imagenes', index, changes)}
              stageValue="imagenes"
              stageOptions={isObra ? IMAGE_STAGE_OPTIONS : []}
              onStageChange={(index, target) => transferFrom('imagenes', index, target)}
              onChange={(files) => onUpload('imagenes', files)}
            />
            {isObra && (
              <>
                <FileInput
                  label="Subir fotos: antes"
                  accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
                  multiple
                  help="Estado inicial o relevamiento de la obra."
                  disabled={uploading || !isStorageUploadReady}
                  previewItems={form.imagenesAntes}
                  onRemovePreview={(index) => removeFrom('imagenesAntes', index)}
                  onMovePreview={(index, direction) => moveIn('imagenesAntes', index, direction)}
                  onEditPreview={(index, changes) => editIn('imagenesAntes', index, changes)}
                  stageValue="imagenesAntes"
                  stageOptions={IMAGE_STAGE_OPTIONS}
                  onStageChange={(index, target) => transferFrom('imagenesAntes', index, target)}
                  onChange={(files) => onUpload('imagenesAntes', files)}
                />
                <FileInput
                  label="Subir fotos: en proceso"
                  accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
                  multiple
                  help="Avances, ejecución y etapas intermedias."
                  disabled={uploading || !isStorageUploadReady}
                  previewItems={form.imagenesProceso}
                  onRemovePreview={(index) => removeFrom('imagenesProceso', index)}
                  onMovePreview={(index, direction) => moveIn('imagenesProceso', index, direction)}
                  onEditPreview={(index, changes) => editIn('imagenesProceso', index, changes)}
                  stageValue="imagenesProceso"
                  stageOptions={IMAGE_STAGE_OPTIONS}
                  onStageChange={(index, target) => transferFrom('imagenesProceso', index, target)}
                  onChange={(files) => onUpload('imagenesProceso', files)}
                />
                <FileInput
                  label="Subir fotos: finalizada"
                  accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.heic,.heif,.bmp,.tif,.tiff"
                  multiple
                  help="Resultado final para mostrar el cierre de obra."
                  disabled={uploading || !isStorageUploadReady}
                  previewItems={form.imagenesFinal}
                  onRemovePreview={(index) => removeFrom('imagenesFinal', index)}
                  onMovePreview={(index, direction) => moveIn('imagenesFinal', index, direction)}
                  onEditPreview={(index, changes) => editIn('imagenesFinal', index, changes)}
                  stageValue="imagenesFinal"
                  stageOptions={IMAGE_STAGE_OPTIONS}
                  onStageChange={(index, target) => transferFrom('imagenesFinal', index, target)}
                  onChange={(files) => onUpload('imagenesFinal', files)}
                />
              </>
            )}
              </>
            )}
          </div>

          {uploading && <p className="admin-uploading-state">Subiendo archivos. No cierres esta pestaña...</p>}

          <details className="admin-advanced-media">
            <summary>Agregar enlace manual</summary>
            <p>Usalo solamente si la imagen ya está subida online o si querés agregar un video externo por URL.</p>
            <div className="admin-form__grid">
              <Field label="Ruta o URL de portada" value={form.portada} onChange={(v) => set('portada', v)} placeholder="/assets/img/obras/marvel-pellegrini/marvel-pellegrini-02.jpg" />
              <Field label="Ruta o URL de video principal" value={form.video} onChange={(v) => set('video', v)} placeholder="https://.../video.mp4" />
            </div>
            {!hasBranchGalleries && <Area label="Galería general" value={arrToText(form.imagenes)} onChange={(v) => set('imagenes', v)} rows={5} placeholder="Una ruta o URL por línea" />}
            {isObra && !hasBranchGalleries && <Area label="Galería antes" value={arrToText(form.imagenesAntes)} onChange={(v) => set('imagenesAntes', v)} rows={4} placeholder="Una ruta o URL por línea" />}
            {isObra && !hasBranchGalleries && <Area label="Galería en proceso" value={arrToText(form.imagenesProceso)} onChange={(v) => set('imagenesProceso', v)} rows={4} placeholder="Una ruta o URL por línea" />}
            {isObra && !hasBranchGalleries && <Area label="Galería finalizada" value={arrToText(form.imagenesFinal)} onChange={(v) => set('imagenesFinal', v)} rows={4} placeholder="Una ruta o URL por línea" />}
            <Area label="Videos extra" value={arrToText(isEvent ? form.videos : form.galeriaVideo)} onChange={(v) => set(isEvent ? 'videos' : 'galeriaVideo', v)} rows={4} placeholder="Una ruta o URL por línea" />
          </details>
        </div>

        {isObra && <UnassignedGalleryEditor form={form} setForm={setForm} />}
        {isObra && <BranchGalleryEditor form={form} setForm={setForm} onUpload={onUpload} uploading={uploading} />}

        {form.portada && (
          <div className="admin-cover-preview">
            <span>Portada actual</span>
            <img src={assetUrl(form.portada)} alt="Portada actual" loading="lazy" />
          </div>
        )}

        <Area label="Descripción" value={form.descripcion} onChange={(v) => set('descripcion', v)} rows={4} placeholder="Texto profesional visible en el sitio." />
        {isObra && <Area label="Proceso" value={form.proceso} onChange={(v) => set('proceso', v)} rows={4} />}
        {isObra && <Area label="Finalización" value={form.finalizacion} onChange={(v) => set('finalizacion', v)} rows={4} />}
        <Area label={isEvent ? 'Puntos / rol (uno por línea)' : 'Etapas (una por línea)'} value={arrToText(isEvent ? form.puntos : form.stages)} onChange={(v) => set(isEvent ? 'puntos' : 'stages', v)} rows={4} />

        <div className="admin-form__actions">
          <button type="submit" className="btn btn--primary">{form.id ? 'Guardar cambios' : `Crear ${cfg.singular}`}</button>
          <button type="button" className="btn btn--ghost" onClick={onClear}>Limpiar</button>
        </div>
      </form>
    </article>
  );
}

function ContentList({ title, items, kind, onEdit, onDelete, onStatusChange, statusUpdatingId }) {
  const cfg = RESOURCE_CONFIG[kind];
  if (!items.length) return <div className="admin-list__empty">No hay contenido cargado en {cfg.label.toLowerCase()}.</div>;

  return (
    <div className="admin-list admin-list--projects">
      {items.map((item) => (
        <div className="admin-item admin-item--project" key={item.id}>
          <img
            className="admin-item__thumb"
            src={assetUrl(item.portada) || assetUrl(item.imagenes?.[0]) || '/assets/img/logo/fzac-logo.jpg'}
            alt={item.nombre || item.titulo}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = '/assets/img/logo/fzac-logo.jpg'; }}
          />
          <div className="admin-item__content">
            <div className="admin-item__top">
              <h3>{item.nombre || item.titulo}</h3>
              {item.destacado && <span className="admin-featured-pill">Destacado</span>}
            </div>
            <div className="admin-item__meta">
              <span>{item.tipo}</span>
              {kind === 'obras' && (
                <label className="admin-item__status-control">
                  <span>Estado</span>
                  <select
                    value={item.estado || 'finalizada'}
                    onChange={(event) => onStatusChange(item, event.target.value)}
                    disabled={statusUpdatingId === item.id}
                    aria-label={`Cambiar estado de ${item.nombre || item.titulo}`}
                  >
                    {ESTADOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              )}
              {kind !== 'obras' && item.estado && <span>{item.estado}</span>}
              {item.direccion && <span>{item.direccion}</span>}
              {item.ubicacion && <span>{item.ubicacion}</span>}
              {item.anio && <span>{item.anio}</span>}
            </div>
            {kind === 'obras' && (
              <div className="admin-item__galleries" aria-label="Galerías de la obra">
                <span className="admin-item__galleries-title"><Images size={16} aria-hidden="true" /> Galerías</span>
                {gallerySummaries(item).map(({ label, count }, index) => (
                  <span className="admin-item__gallery-pill" key={`${label}-${index}`}>
                    {label} <strong>{count}</strong>
                  </span>
                ))}
              </div>
            )}
            <p className="admin-item__desc">{item.descripcion}</p>
            <div className="admin-item__actions">
              <button className="admin-item__btn" type="button" onClick={() => onEdit(kind, item)}>Editar</button>
              <button className="admin-item__btn admin-item__btn--danger" type="button" onClick={() => onDelete(kind, item.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryManager({ items, form, setForm, onSubmit, onClear, onEdit, onDelete, message }) {
  const set = (key, value) => setForm((prev) => {
    const next = { ...prev, [key]: value };
    if (key === 'name' && !prev.id) next.slug = slugify(value);
    return next;
  });

  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <span className="eyebrow">Categorías</span>
        <h2>Menú y clasificación de obras</h2>
        <p>Creá categorías simples para ordenar el portfolio y asociarlas a cada obra.</p>
      </div>

      {message && <p className="admin-feedback" role="status">{message}</p>}

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-form__grid">
          <Field label="Nombre" value={form.name} onChange={(v) => set('name', v)} placeholder="Ej. Gastronomía" />
          <Field label="Slug" value={form.slug} onChange={(v) => set('slug', slugify(v))} placeholder="gastronomia" />
          <Field label="Orden" value={form.displayOrder} onChange={(v) => set('displayOrder', v)} type="number" />
        </div>
        <Area label="Descripción" value={form.description} onChange={(v) => set('description', v)} rows={3} />
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive !== false} onChange={(e) => set('isActive', e.target.checked)} />
          <span>Categoría activa</span>
        </label>
        <div className="admin-form__actions">
          <button type="submit" className="btn btn--primary">{form.id ? 'Guardar categoría' : 'Crear categoría'}</button>
          <button type="button" className="btn btn--ghost" onClick={onClear}>Limpiar</button>
        </div>
      </form>

      <div className="admin-list admin-list--projects" style={{ marginTop: 24 }}>
        {items.map((category) => (
          <div className="admin-item admin-item--project" key={category.id}>
            <div className="admin-item__content">
              <div className="admin-item__top">
                <h3>{category.name || category.nombre}</h3>
                <span className="admin-featured-pill">{category.isActive ? 'Activa' : 'Oculta'}</span>
              </div>
              <div className="admin-item__meta">
                <span>{category.slug}</span>
                <span>Orden {category.displayOrder || category.order || 0}</span>
              </div>
              <p className="admin-item__desc">{category.description}</p>
              <div className="admin-item__actions">
                <button className="admin-item__btn" type="button" onClick={() => onEdit(category)}>Editar</button>
                <button className="admin-item__btn admin-item__btn--danger" type="button" onClick={() => onDelete(category.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SiteTextManager({ items, form, setForm, onSubmit, onClear, onEdit, onDelete, message }) {
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <article className="admin-card">
      <div className="admin-card__header">
        <span className="eyebrow">Textos</span>
        <h2>Textos editables del sitio</h2>
        <p>Administrá los textos institucionales visibles en el sitio y mantené cada sección actualizada.</p>
      </div>

      {message && <p className="admin-feedback" role="status">{message}</p>}

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-form__grid">
          <Field label="Clave" value={form.key} onChange={(v) => set('key', v)} placeholder="home.hero.title" />
          <Field label="Título interno" value={form.title} onChange={(v) => set('title', v)} placeholder="Título principal" />
          <Field label="Sección" value={form.section} onChange={(v) => set('section', v)} placeholder="home" />
        </div>
        <Area label="Texto" value={form.value} onChange={(v) => set('value', v)} rows={8} />
        <Area label="Descripción interna" value={form.description} onChange={(v) => set('description', v)} rows={4} />
        <div className="admin-form__actions">
          <button type="submit" className="btn btn--primary">{form.id ? 'Guardar texto' : 'Crear texto'}</button>
          <button type="button" className="btn btn--ghost" onClick={onClear}>Limpiar</button>
        </div>
      </form>

      <div className="admin-list admin-list--projects" style={{ marginTop: 24 }}>
        {items.map((text) => (
          <div className="admin-item admin-item--project admin-item--text" key={text.id}>
            <div className="admin-item__content">
              <div className="admin-item__top">
                <h3>{text.title || text.key}</h3>
                <span className="admin-featured-pill">{text.section}</span>
              </div>
              <div className="admin-item__meta"><span>{text.key}</span></div>
              <p className="admin-item__desc admin-item__desc--long">{text.value}</p>
              <div className="admin-item__actions">
                <button className="admin-item__btn" type="button" onClick={() => onEdit(text)}>Editar</button>
                <button className="admin-item__btn admin-item__btn--danger" type="button" onClick={() => onDelete(text.id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Admin() {
  const [items, setItems] = useState({ obras: [], trabajos: [], eventos: [] });
  const [categories, setCategories] = useState([]);
  const [siteTexts, setSiteTexts] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [kind, setKind] = useState('obras');
  const [form, setForm] = useState(EMPTY);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [siteTextForm, setSiteTextForm] = useState(EMPTY_SITE_TEXT);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState('');
  const [realtimeTick, setRealtimeTick] = useState(0);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const imageUrls = new Set();
    items.obras.forEach((obra) => {
      const sources = [obra, ...(Array.isArray(obra.sucursales) ? obra.sucursales : [])];
      sources.forEach((source) => {
        [source.portada ? [source.portada] : [], source.imagenes, source.imagenesAntes, source.imagenesProceso, source.imagenesFinal]
          .forEach((group) => {
            if (!Array.isArray(group)) return;
            group.map(assetUrl).filter(Boolean).forEach((url) => imageUrls.add(url));
          });
      });
    });

    return {
      obras: items.obras.length,
      trabajos: items.trabajos.length,
      eventos: items.eventos.length,
      categorias: categories.length,
      textos: siteTexts.length,
      fotos: imageUrls.size,
      destacadas: items.obras.filter((p) => p.destacado).length,
      enCurso: items.obras.filter((p) => p.estado === 'construyendo').length,
    };
  }, [items, categories, siteTexts]);

  useEffect(() => { refresh(); }, []);

  useEffect(() => subscribeAdminCrud(() => {
    setRealtimeTick((value) => value + 1);
    refresh({ silent: true });
  }), []);

  function notify(text) {
    setMsg(text);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setMsg(''), 4500);
  }

  async function refresh(options = {}) {
    try {
      const [obras, trabajos, eventos, nextCategories, nextSiteTexts] = await Promise.all([
        getAdminProjects(),
        getAdminTrabajos(),
        getAdminEventos(),
        getCategories(),
        getSiteTexts(),
      ]);
      setItems({ obras, trabajos, eventos });
      setCategories(nextCategories);
      setSiteTexts(nextSiteTexts);
    } catch (error) {
      if (!options.silent) notify(error.message || 'No se pudieron cargar los datos.');
    }
  }

  function openNew(nextKind) {
    setKind(nextKind);
    setForm(EMPTY);
    setTab('editar');
  }

  function editItem(nextKind, item) {
    setKind(nextKind);
    setForm(normalizeForForm(item));
    setTab('editar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeItem(targetKind, id) {
    const cfg = RESOURCE_CONFIG[targetKind];
    if (!window.confirm(`¿Eliminar este ${cfg.singular}? Esta acción no se puede deshacer.`)) return;
    try {
      await cfg.remove(id);
      notify(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} eliminado correctamente.`);
      await refresh();
    } catch (error) {
      notify(error.message || 'No se pudo eliminar.');
    }
  }

  async function changeWorkStatus(item, nextStatus) {
    if (!item?.id || item.estado === nextStatus || statusUpdatingId) return;

    try {
      setStatusUpdatingId(item.id);
      const result = await updateProjectStatus(item.id, nextStatus);
      setItems((current) => ({
        ...current,
        obras: current.obras.map((work) => work.id === item.id ? result.item : work),
      }));
      notify(`Status ${result.status}: estado de la obra actualizado.`);
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo cambiar el estado.'}`);
    } finally {
      setStatusUpdatingId('');
    }
  }

  async function upload(target, fileList) {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;

    if (!isStorageUploadReady) {
      notify('Status 400: Supabase Storage no está listo. Mientras tanto podés pegar una ruta/URL en "Agregar enlace manual".');
      return;
    }

    const cfg = RESOURCE_CONFIG[kind];
    const baseSlug = slugify(form.slug || form.nombre || cfg.singular || 'contenido');
    const folder = `fzac/${cfg.folder}/${baseSlug}`;

    try {
      setUploading(true);
      notify('Subiendo archivos...');

      if (typeof target === 'object' && Number.isInteger(target.branchIndex)) {
        const branch = toArray(form.sucursales)[target.branchIndex] || {};
        const branchSlug = slugify(branch.nombre || `sucursal-${target.branchIndex + 1}`);
        const branchFolder = `${folder}/sucursales/${branchSlug}`;

        if (target.target === 'portada') {
          const uploaded = await uploadAsset(files[0], `${branchFolder}/portada`);
          setForm((prev) => ({
            ...prev,
            sucursales: toArray(prev.sucursales).map((item, index) => index === target.branchIndex ? { ...item, portada: uploaded.url } : item),
          }));
          notify(`Status ${uploaded.status}: portada de la sucursal cargada. Guardá la obra para publicarla.`);
          return;
        }

        const uploaded = await uploadManyAssets(files, `${branchFolder}/${target.target}`);
        setForm((prev) => ({
          ...prev,
          sucursales: toArray(prev.sucursales).map((item, index) => index === target.branchIndex
            ? { ...item, [target.target]: [...toArray(item[target.target]), ...uploaded.items] }
            : item),
        }));
        notify(`Status ${uploaded.status}: ${uploaded.urls.length} foto(s) cargada(s) en la sucursal. Guardá la obra para publicarlas.`);
        return;
      }

      if (target === 'portada') {
        const uploaded = await uploadAsset(files[0], `${folder}/portada`);
        setForm((prev) => ({ ...prev, portada: uploaded.url }));
        notify(`Status ${uploaded.status}: portada cargada. Guardá el contenido para publicarla.`);
      }

      if (target === 'video') {
        const uploaded = await uploadAsset(files[0], `${folder}/videos`);
        setForm((prev) => ({ ...prev, video: uploaded.url }));
        notify(`Status ${uploaded.status}: video cargado. Guardá el contenido para publicarlo.`);
      }

      if (['imagenes', 'imagenesAntes', 'imagenesProceso', 'imagenesFinal'].includes(target)) {
        const sectionFolder = target === 'imagenes' ? 'galeria' : target.replace('imagenes', '').toLowerCase();
        const uploaded = await uploadManyAssets(files, `${folder}/${sectionFolder}`);
        setForm((prev) => ({ ...prev, [target]: [...toArray(prev[target]), ...uploaded.items] }));
        notify(`Status ${uploaded.status}: ${uploaded.urls.length} imagen(es) cargada(s). Guardá el contenido para publicarlas.`);
      }

      if (target === 'videos' || target === 'galeriaVideo') {
        const uploaded = await uploadManyAssets(files, `${folder}/videos`);
        setForm((prev) => ({ ...prev, [target]: [...toArray(prev[target]), ...uploaded.urls] }));
        notify(`Status ${uploaded.status}: ${uploaded.urls.length} video(s) cargado(s). Guardá el contenido para publicarlos.`);
      }
    } catch (error) {
      console.warn('[FZAC] No se pudo subir el archivo:', error?.message || error);
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo subir el archivo.'}`);
    } finally {
      setUploading(false);
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    const cfg = RESOURCE_CONFIG[kind];
    const payload = buildPayload(form, kind);
    if (!payload.nombre) return notify('Status 400: El contenido necesita un nombre.');
    if (!payload.descripcion) return notify('Status 400: Agregá una descripción profesional.');
    if (kind === 'obras') {
      const unbalanced = gallerySummaries(payload).filter(({ count }) => count < 5 || count > 8);
      if (unbalanced.length) {
        const detail = unbalanced.map(({ label, count }) => `${label}: ${count}`).join('\n');
        const shouldContinue = window.confirm(
          `Hay galerías fuera del rango recomendado de 5 a 8 fotos:\n\n${detail}\n\n¿Guardar de todos modos?`
        );
        if (!shouldContinue) return;
      }
    }

    try {
      const result = await cfg.save({ ...payload, id: form.id });
      const status = result?.status || (form.id ? 200 : 201);
      notify(`Status ${status}: ${form.id ? 'Contenido actualizado correctamente.' : 'Contenido creado correctamente.'}`);
      setForm(EMPTY);
      setTab(kind);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo guardar el contenido.'}`);
    }
  }

  async function submitCategory(event) {
    event.preventDefault();
    try {
      const result = await saveCategory(categoryForm);
      notify(`Status ${result.status}: categoría guardada correctamente.`);
      setCategoryForm(EMPTY_CATEGORY);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo guardar la categoría.'}`);
    }
  }

  async function removeCategory(id) {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      const result = await deleteCategory(id);
      notify(`Status ${result.status}: categoría eliminada.`);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo eliminar la categoría.'}`);
    }
  }

  async function submitSiteText(event) {
    event.preventDefault();
    try {
      const result = await saveSiteText(siteTextForm);
      notify(`Status ${result.status}: texto guardado correctamente.`);
      setSiteTextForm(EMPTY_SITE_TEXT);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo guardar el texto.'}`);
    }
  }

  async function removeSiteText(id) {
    if (!window.confirm('¿Eliminar este texto?')) return;
    try {
      const result = await deleteSiteText(id);
      notify(`Status ${result.status}: texto eliminado.`);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo eliminar el texto.'}`);
    }
  }

  async function syncCatalog() {
    try {
      const result = await syncProjectCatalog();
      notify(`Status ${result.status}: catálogo sincronizado. ${result.created || 0} obra(s) agregada(s).`);
      await refresh();
    } catch (error) {
      notify(`Status ${error.status || 400}: ${error.message || 'No se pudo sincronizar el catálogo.'}`);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <Link to="/" className="brand">
              <img src="/assets/img/logo/fzac-logo.jpg" className="brand__logo" alt="FZAC" />
              <div className="brand__text"><span className="brand__name">FORTALEZA</span><span className="brand__sub">ADMIN</span></div>
            </Link>
          </div>

          <div className="admin-session-card"><p>Sesión activa</p><strong>Administrador autorizado</strong></div>

          <nav className="admin-nav">
            <button className={`admin-nav__btn ${tab === 'dashboard' ? 'is-active' : ''}`} onClick={() => setTab('dashboard')} type="button">Dashboard</button>
            <button className={`admin-nav__btn ${tab === 'obras' ? 'is-active' : ''}`} onClick={() => setTab('obras')} type="button">Obras</button>
            <button className={`admin-nav__btn ${tab === 'categorias' ? 'is-active' : ''}`} onClick={() => setTab('categorias')} type="button">Categorías</button>
            <button className={`admin-nav__btn ${tab === 'textos' ? 'is-active' : ''}`} onClick={() => setTab('textos')} type="button">Textos</button>
            <button className={`admin-nav__btn ${tab === 'trabajos' ? 'is-active' : ''}`} onClick={() => setTab('trabajos')} type="button">Trabajos varios</button>
            <button className={`admin-nav__btn ${tab === 'eventos' ? 'is-active' : ''}`} onClick={() => setTab('eventos')} type="button">Eventos</button>
          </nav>

          <div className="admin-sidebar__footer">
            <Link to="/" className="btn btn--ghost btn--full" style={{ marginBottom: 10 }}>Ver sitio →</Link>
            <button className="btn btn--ghost btn--full" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-topbar">
            <div>
              <span className="eyebrow">Panel administrativo</span>
              <h1>Gestión de contenido FZAC</h1>
              <p>Administrá obras, trabajos varios, eventos, textos e imágenes desde un solo lugar.</p>
            </div>
            <span className="admin-realtime-pill">CRUD en vivo {realtimeTick > 0 ? `+${realtimeTick}` : ''}</span>
            {msg && <p className="admin-feedback admin-feedback--top" role="status">{msg}</p>}
          </div>

          {tab === 'dashboard' && (
            <div className="admin-dashboard">
              <article className="admin-stat"><span>Obras</span><strong>{stats.obras}</strong><p>Proyectos principales</p></article>
              <article className="admin-stat"><span>Categorías</span><strong>{stats.categorias}</strong><p>Clasificación del portfolio</p></article>
              <article className="admin-stat"><span>Textos</span><strong>{stats.textos}</strong><p>Copies editables del sitio</p></article>
              <article className="admin-stat"><span>Trabajos</span><strong>{stats.trabajos}</strong><p>Referencias de servicios</p></article>
              <article className="admin-stat"><span>Eventos</span><strong>{stats.eventos}</strong><p>Participaciones destacadas</p></article>
              <article className="admin-stat"><span>Fotos</span><strong>{stats.fotos}</strong><p>Imágenes registradas en obras</p></article>
              <article className="admin-stat"><span>Destacadas</span><strong>{stats.destacadas}</strong><p>Obras visibles como prioridad</p></article>
              <article className="admin-stat"><span>En curso</span><strong>{stats.enCurso}</strong><p>Obras activas</p></article>
            </div>
          )}

          {['obras', 'trabajos', 'eventos'].includes(tab) && (
            <article className="admin-card">
              <div className="admin-card__header admin-card__header--row">
                <div><span className="eyebrow">{RESOURCE_CONFIG[tab].label}</span><h2>Contenido cargado</h2></div>
                <div className="admin-card__header-actions">
                  {tab === 'obras' && <button className="btn btn--ghost" type="button" onClick={syncCatalog}>Sincronizar obras actuales</button>}
                  <button className="btn btn--primary" type="button" onClick={() => openNew(tab)}>Nuevo</button>
                </div>
              </div>
              <ContentList
                title={RESOURCE_CONFIG[tab].label}
                items={items[tab]}
                kind={tab}
                onEdit={editItem}
                onDelete={removeItem}
                onStatusChange={changeWorkStatus}
                statusUpdatingId={statusUpdatingId}
              />
            </article>
          )}

          {tab === 'categorias' && (
            <CategoryManager
              items={categories}
              form={categoryForm}
              setForm={setCategoryForm}
              onSubmit={submitCategory}
              onClear={() => setCategoryForm(EMPTY_CATEGORY)}
              onEdit={(category) => setCategoryForm({
                id: category.id,
                name: category.name || category.nombre || '',
                slug: category.slug || '',
                description: category.description || '',
                displayOrder: category.displayOrder || category.order || 0,
                isActive: category.isActive !== false,
              })}
              onDelete={removeCategory}
              message={msg}
            />
          )}

          {tab === 'textos' && (
            <SiteTextManager
              items={siteTexts}
              form={siteTextForm}
              setForm={setSiteTextForm}
              onSubmit={submitSiteText}
              onClear={() => setSiteTextForm(EMPTY_SITE_TEXT)}
              onEdit={(text) => setSiteTextForm({
                id: text.id,
                key: text.key || '',
                title: text.title || text.titulo || '',
                value: text.value || text.contenido || '',
                section: text.section || 'general',
                description: text.description || '',
              })}
              onDelete={removeSiteText}
              message={msg}
            />
          )}

          {tab === 'editar' && (
            <ContentForm kind={kind} form={form} setForm={setForm} onSubmit={submitForm} onClear={() => setForm(EMPTY)} onUpload={upload} uploading={uploading} message={msg} categories={categories} />
          )}

        </section>
      </div>
    </main>
  );
}
