import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BUILD_STAGES = ['Base', 'Estructura', 'Terminaciones'];
const BRICKS = Array.from({ length: 18 });

export default function ConstructionLoader({ ready = false }) {
  return (
    <main
      className={`construction-loader${ready ? ' is-ready' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ready ? 'Sitio listo' : 'Cargando Fortaleza Construcciones'}
    >
      <div className="construction-loader__inner">
        <section className="construction-loader__copy">
          <div className="construction-loader__brand">
            <img src="/assets/img/logo/fzac-logo.jpg" alt="Fortaleza Construcciones" width="64" height="64" />
            <div>
              <strong>Fortaleza Construcciones</strong>
              <span>FZAC · Obras y servicios integrales</span>
            </div>
          </div>

          <div className="construction-loader__headline">
            <span>Portfolio institucional · Rosario, Santa Fe</span>
            <h1>Levantando la obra digital</h1>
            <p>Preparando galerías, obras y contenido para una navegación rápida y prolija.</p>
          </div>

          <div className="construction-loader__socials" aria-label="Redes y contacto de FZAC">
            <span>@fzaconstrucciones</span>
            <span>Fortaleza Construcciones</span>
          </div>
        </section>

        <section className="construction-loader__site" aria-hidden="true">
          <div className="construction-loader__crane">
            <span />
            <i />
          </div>

          <div className="construction-loader__wall">
            {BRICKS.map((_, index) => (
              <span key={index} style={{ '--delay': `${index * 55}ms` }} />
            ))}
          </div>

          <div className="construction-loader__foundation">
            <span>FZAC</span>
            <i />
          </div>
        </section>

        <div className="construction-loader__stages">
          {BUILD_STAGES.map((stage, index) => (
            <span key={stage}><i>{String(index + 1).padStart(2, '0')}</i>{stage}</span>
          ))}
        </div>

        <div className="construction-loader__status">
          {ready && <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />}
          <span>{ready ? 'Listo para construir' : 'Preparando estructura visual'}</span>
        </div>

        <div className="construction-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
