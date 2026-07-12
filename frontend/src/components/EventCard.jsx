import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <article className="event-card reveal is-visible">
      <Link to={`/eventos/${event.slug}`} className="event-card__media" aria-label={`Ver evento ${event.nombre}`}>
        <img src={event.portada || '/assets/img/logo/fzac-logo.jpg'} alt={event.nombre} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = '/assets/img/logo/fzac-logo.jpg'; }} />
        <span>Evento</span>
      </Link>
      <div className="event-card__body">
        <span className="event-card__type">{event.tipo}</span>
        <h3>{event.nombre}</h3>
        <p>{event.descripcion}</p>
        <Link className="text-link" to={`/eventos/${event.slug}`}>Ver participación</Link>
      </div>
    </article>
  );
}
