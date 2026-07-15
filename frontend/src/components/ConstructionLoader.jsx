import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BUILD_STAGES = ['Planificación', 'Ejecución', 'Entrega'];

export default function ConstructionLoader({ ready = false }) {
  return (
    <main
      className={`construction-loader${ready ? ' is-ready' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ready ? 'Sitio listo' : 'Cargando Fortaleza Construcciones'}
    >
      <div className="construction-loader__inner">
        <div className="construction-loader__brand">
          <img src="/assets/img/logo/fzac-logo.jpg" alt="Fortaleza Construcciones" width="58" height="58" />
          <div>
            <strong>Fortaleza Construcciones</strong>
            <span>Obras y servicios integrales</span>
          </div>
        </div>

        <div className="construction-loader__headline">
          <span>FZAC · Rosario, Santa Fe</span>
          <p>Construimos espacios<br /><strong>listos para crecer.</strong></p>
        </div>

        <div className="construction-loader__plan" aria-hidden="true">
          <span className="construction-loader__plan-label">Proyecto / 01</span>
          <div className="construction-loader__plan-mark">
            <i>F</i>
            <i>Z</i>
            <i>A</i>
            <i>C</i>
          </div>
          <span className="construction-loader__measure construction-loader__measure--top" />
          <span className="construction-loader__measure construction-loader__measure--side" />
        </div>

        <div className="construction-loader__stages" aria-hidden="true">
          {BUILD_STAGES.map((stage, index) => (
            <span key={stage}><i>{String(index + 1).padStart(2, '0')}</i>{stage}</span>
          ))}
        </div>

        <div className="construction-loader__status">
          {ready && <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />}
          <span>{ready ? 'Todo listo' : 'Preparando el sitio'}</span>
        </div>
        <div className="construction-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
