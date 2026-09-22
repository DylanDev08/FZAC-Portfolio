import React from 'react';
import { Folder } from 'lucide-react';

export default function AdminPanelSkeleton() {
  return (
    <main className="admin-page admin-page--loading" aria-busy="true" aria-label="Cargando panel administrativo">
      <div className="admin-shell">
        <aside className="admin-sidebar admin-skeleton__sidebar">
          <div className="admin-skeleton admin-skeleton--brand" />
          <div className="admin-skeleton admin-skeleton--session" />
          <div className="admin-skeleton__nav">
            <div className="admin-skeleton admin-skeleton--label" />
            {[0, 1, 2, 3].map((item) => <div className="admin-skeleton admin-skeleton--nav" key={item} />)}
            <div className="admin-skeleton admin-skeleton--label" />
            {[0, 1].map((item) => <div className="admin-skeleton admin-skeleton--nav" key={`settings-${item}`} />)}
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-topbar admin-skeleton__topbar">
            <div className="admin-skeleton__copy">
              <div className="admin-skeleton admin-skeleton--eyebrow" />
              <div className="admin-skeleton admin-skeleton--title" />
              <div className="admin-skeleton admin-skeleton--text" />
            </div>
            <div className="admin-skeleton admin-skeleton--button" />
          </div>

          <div className="admin-dashboard admin-dashboard--primary">
            {[0, 1, 2, 3].map((item) => (
              <article className="admin-stat admin-skeleton-card" key={item}>
                <div className="admin-skeleton admin-skeleton--eyebrow" />
                <div className="admin-skeleton admin-skeleton--metric" />
                <div className="admin-skeleton admin-skeleton--text-short" />
              </article>
            ))}
          </div>

          <div className="admin-card admin-skeleton__panel">
            <div className="admin-skeleton admin-skeleton--title-small" />
            <div className="admin-skeleton admin-skeleton--text" />
            {[0, 1, 2].map((item) => (
              <div className="admin-skeleton-row" key={item}>
                <div className="admin-skeleton admin-skeleton--thumb" />
                <div className="admin-skeleton__row-copy">
                  <div className="admin-skeleton admin-skeleton--title-small" />
                  <div className="admin-skeleton admin-skeleton--text" />
                  <div className="admin-skeleton admin-skeleton--text-short" />
                </div>
              </div>
            ))}
            <span className="admin-skeleton__sr"><Folder size={1} aria-hidden="true" /> Cargando contenido</span>
          </div>
        </section>
      </div>
    </main>
  );
}
