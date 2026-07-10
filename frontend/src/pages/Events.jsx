import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import Seo from '../components/Seo.jsx';
import { getEventos } from '../services/contentService.js';

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEventos().then(setEvents).catch(() => setEvents([]));
  }, []);

  return (
    <main>
      <Seo
        title="Eventos y participaciones | Fortaleza Construcciones"
        description="Participaciones y registros de Fortaleza Construcciones en eventos, locales y espacios comerciales con armado técnico y presencia operativa."
        image="/assets/img/eventos/burgerland/burgerland-01.jpg"
        canonicalPath="/eventos"
      />
      <section className="page-hero events-hero">
        <div className="container">
          <span className="eyebrow">Eventos</span>
          <h1>Participaciones que fortalecen presencia, experiencia y capacidad operativa</h1>
          <p>Además de obras comerciales y residenciales, FZAC participa en desarrollos, eventos y espacios de uso intensivo donde se requiere criterio técnico, armado prolijo y respuesta operativa.</p>
        </div>
      </section>

      <section className="section events-section">
        <div className="container events-grid">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>
    </main>
  );
}
