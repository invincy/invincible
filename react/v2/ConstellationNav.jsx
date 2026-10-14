import React from 'react';
import {navigationPages} from '../../shared/navigation';
import PageIcon from './PageIcon';

// The Dashboard is the home view; its nine other main destinations live on the Orb.
const destinations = navigationPages.filter(page => page.id !== 'dashboard');

export default function ConstellationNav({task, onInspect, onTravel}) {
  return <div className="v2-constellation">
    <nav className="v2-orb-pages" aria-label="Explore Invincible pages">
      {destinations.map(page => <a key={page.id} className="v2-page-point" data-page={page.id}
        href={page.href} target={page.external ? '_blank' : undefined}
        rel={page.external ? 'noopener noreferrer' : undefined}
        onClick={event => {
          if (page.external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onTravel(page);
        }}>
        <span className="v2-page-glow" aria-hidden="true"><PageIcon page={page.id}/></span>
        <span className="v2-page-name">{page.label}{page.external && <span aria-hidden="true"> ↗</span>}</span>
      </a>)}
    </nav>
    {task && <button className="v2-orb-task" type="button" onClick={() => onInspect(task.id)}
      aria-label={`Open current task: ${task.title || 'Untitled task'}`}>
      <small>CURRENT TASK</small><strong>{task.title || 'Untitled task'}</strong><span aria-hidden="true">↗</span>
    </button>}
  </div>;
}
