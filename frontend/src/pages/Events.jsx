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
          <h1>FZAC en eventos y desarrollos comerciales</h1>
          <p>Participamos en montajes y espacios gastronómicos donde la coordinación, los tiempos y la calidad de ejecución son fundamentales.</p>
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
