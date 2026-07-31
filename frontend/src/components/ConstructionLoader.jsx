import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const CONTACT_ITEMS = [
  { label: 'Instagram', value: '@fzaconstrucciones', Icon: Instagram },
  { label: 'WhatsApp', value: '+54 9 341 584 7000', Icon: Phone },
  { label: 'Email', value: 'fortalezaconstruccionesrosario@gmail.com', Icon: Mail },
  { label: 'Zona de trabajo', value: 'Rosario, Santa Fe', Icon: MapPin },
];

export default function ConstructionLoader({ ready = false, onEnter }) {
  const enterButtonRef = useRef(null);

  useEffect(() => {
    if (ready) enterButtonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  return (
    <main
      className={`construction-loader${ready ? ' is-ready' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={ready ? 'Sitio listo' : 'Cargando Fortaleza Construcciones'}
    >
      <div className="construction-loader__inner">
        <div className="construction-loader__brand">
          <img src="/assets/img/logo/fzac-logo.webp" alt="Fortaleza Construcciones" width="82" height="82" />
          <div>
            <strong>Fortaleza Construcciones</strong>
            <span>Portfolio profesional de obras</span>
          </div>
        </div>

        <div className="construction-loader__headline">
          <span>FZAC · Rosario, Santa Fe</span>
          <h1>{ready ? 'Listo para construir' : 'Cargando portfolio'}</h1>
          <p>Obras, galerías y servicios de Fortaleza Construcciones en un recorrido simple y profesional.</p>
        </div>

        <div className="construction-loader__socials" aria-label="Datos de contacto de FZAC">
          {CONTACT_ITEMS.map(({ label, value, Icon }) => (
            <span key={label}>
              <Icon size={16} aria-hidden="true" />
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
          ))}
        </div>

        <div className="construction-loader__status">
          {ready && <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />}
          <span>{ready ? 'La presentación está lista' : 'Preparando el sitio'}</span>
        </div>

        <button
          ref={enterButtonRef}
          className="construction-loader__enter"
          type="button"
          disabled={!ready}
          onClick={onEnter}
        >
          {ready ? 'Ingresar' : 'Preparando...'}
        </button>

        <p className="construction-loader__hint">
          {ready ? 'Tocá ingresar para ver el portfolio.' : 'Un momento, estamos cargando el contenido principal.'}
        </p>

        <div className="construction-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}
