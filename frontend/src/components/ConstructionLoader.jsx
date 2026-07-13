import React from 'react';
import { CheckCircle2, HardHat, Instagram, MessageCircle } from 'lucide-react';

const BRICKS = Array.from({ length: 24 }, (_, index) => index);

export default function ConstructionLoader({ ready = false }) {
  return (
    <main
      className={`construction-loader${ready ? ' is-ready' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ready ? 'Listo para construir' : 'Cargando Fortaleza Construcciones'}
    >
      <div className="construction-loader__inner">
        <div className="construction-loader__brand">
          <img src="/assets/img/logo/fzac-logo.jpg" alt="Logo de FZAC" width="62" height="62" />
          <div>
            <strong>Fortaleza Construcciones</strong>
            <span>FZAC · Rosario, Santa Fe</span>
          </div>
        </div>

        <div className="construction-loader__socials" aria-label="Redes sociales de Fortaleza Construcciones">
          <a href="https://www.instagram.com/fzaconstrucciones/" target="_blank" rel="noreferrer">
            <Instagram aria-hidden="true" size={16} />
            <span>@fzaconstrucciones</span>
          </a>
          <a href="https://wa.me/5493415847000" target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" size={16} />
            <span>WhatsApp</span>
          </a>
        </div>

        <div className="construction-loader__scene" aria-hidden="true">
          <div className="construction-loader__wall">
            {BRICKS.map((brick) => (
              <span key={brick} style={{ animationDelay: `${(23 - brick) * 42}ms` }} />
            ))}
          </div>
          <div className="construction-loader__vehicle">
            <span className="construction-loader__vehicle-cabin" />
            <span className="construction-loader__vehicle-body" />
            <span className="construction-loader__vehicle-arm" />
            <span className="construction-loader__vehicle-bucket" />
            <span className="construction-loader__vehicle-track">
              <i /><i /><i />
            </span>
          </div>
          <span className="construction-loader__ground" />
        </div>

        <div className="construction-loader__status">
          {ready
            ? <CheckCircle2 aria-hidden="true" size={19} strokeWidth={2} />
            : <HardHat aria-hidden="true" size={19} strokeWidth={1.8} />}
          <span>{ready ? 'Listo para construir' : 'Construyendo el portfolio'}</span>
        </div>
        <div className="construction-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
