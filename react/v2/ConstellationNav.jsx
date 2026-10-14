import React, {useEffect, useRef, useState} from 'react';
import {navigationPages} from '../../shared/navigation';

// Spatial groupings only. Shared navigation remains the source for names and URLs.
const islands = [
  {id: 'create', name: 'Create', color: 'cyan', pages: ['ai', 'journal', 'creator']},
  {id: 'organize', name: 'Organize', color: 'gold', pages: ['workday', 'reminders', 'garage']},
  {id: 'grow', name: 'Grow', color: 'emerald', pages: ['finance', 'lic', 'portfolio']},
];
const pageById = new Map(navigationPages.map(page => [page.id, page]));

export default function ConstellationNav({selected, onSelect, onTravel}) {
  const root = useRef(null);
  const back = useRef(null);
  const lastSelected = useRef(null);
  const lastWheel = useRef(0);
  const wheelProgress = useRef(0);
  const current = islands.find(island => island.id === selected);

  useEffect(() => {
    if (selected) {lastSelected.current = selected; back.current?.focus({preventScroll: true});}
    else if (lastSelected.current) root.current?.querySelector(`[data-island="${lastSelected.current}"]`)?.focus({preventScroll: true});
  }, [selected]);

  useEffect(() => {
    const element = root.current;
    const wheel = event => {
      if (matchMedia('(max-width: 900px)').matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target.closest('.v2-guide-mission,.v2-guide-timer,.v2-guide-work,.v2-guide-orb-label,.v2-branch-link,.v2-branch-back')) return;
      const bounds = element.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
      const x = (event.clientX - bounds.left) / bounds.width;
      if (x < .2 || x > .8 || !event.deltaY) return;
      const approaching = event.deltaY > 0;
      if ((approaching && selected) || (!approaching && !selected)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel.current < 450) return;
      if (Math.sign(wheelProgress.current) !== Math.sign(event.deltaY)) wheelProgress.current = 0;
      wheelProgress.current += event.deltaY;
      if (Math.abs(wheelProgress.current) < 45) return;
      wheelProgress.current = 0;
      lastWheel.current = now;
      if (!approaching) {onSelect(null); return;}
      const nearest = islands.map(island => {
        const rect = element.querySelector(`[data-island="${island.id}"]`).getBoundingClientRect();
        return {id: island.id, distance: Math.hypot(rect.left + rect.width / 2 - event.clientX, rect.top + rect.height / 2 - event.clientY)};
      }).sort((a, b) => a.distance - b.distance)[0];
      onSelect(nearest.id);
    };
    document.addEventListener('wheel', wheel, {passive: false});
    return () => document.removeEventListener('wheel', wheel);
  }, [selected, onSelect]);

  return <div ref={root} className="v2-constellation" aria-label="Explore Invincible pages"
    onKeyDown={event => {if (event.key === 'Escape' && selected) {event.stopPropagation(); onSelect(null);}}}>
    <svg className="v2-constellation-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <path d="M500 300 Q420 160 290 65" className="v2-route-create"/>
      <path d="M500 300 Q600 145 670 65" className="v2-route-organize"/>
      <path d="M500 300 Q420 460 300 554" className="v2-route-grow"/>
    </svg>
    <div className="v2-map-caption" aria-hidden="true">INVINCIBLE · EXPLORE</div>
    {islands.map(island => <button key={island.id} type="button" data-island={island.id}
      className={'v2-island v2-island-'+island.color} aria-expanded={selected === island.id} aria-hidden={selected ? true : undefined} tabIndex={selected ? -1 : 0}
      aria-label={`${island.name}, ${island.pages.length} pages`}
      onClick={() => onSelect(selected === island.id ? null : island.id)}>
      <span className="v2-island-point" aria-hidden="true"/><span>{island.name}</span><small>{island.pages.length} places</small>
    </button>)}
    {current && <div className={'v2-branch v2-branch-'+current.color} role="group" aria-label={`${current.name} destinations`}>
      <div className="v2-branch-heading"><span>APPROACHING</span><h3>{current.name}</h3><button ref={back} className="v2-branch-back" type="button" onClick={() => onSelect(null)}>← Back to map</button></div>
      <svg className="v2-branch-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M500 300 Q410 230 215 193"/><path d="M500 300 Q610 265 735 302"/><path d="M500 300 Q425 440 275 530"/></svg>
      {current.pages.map((id, index) => {
        const page = pageById.get(id);
        return <a key={id} className="v2-branch-link" data-position={index} href={page.href}
          target={page.external ? '_blank' : undefined} rel={page.external ? 'noopener noreferrer' : undefined}
          onClick={event => {if (page.external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;event.preventDefault();onTravel(page);}}>
          <span className="v2-branch-point" aria-hidden="true"/><span>{page.label}</span><small>{page.external ? 'External ↗' : 'Open page ↗'}</small>
        </a>;
      })}
      <p className="v2-branch-hint"><span>Choose a point to enter its page · Scroll up to return</span><span>Choose a point to enter its page · Back to map returns</span></p>
    </div>}
  </div>;
}
