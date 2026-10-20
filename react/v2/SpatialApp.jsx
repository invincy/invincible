import React, {lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useAuth} from '../src/AuthContext';
import {FocusOrb} from '../src/FocusOrb';
import {newId} from '../src/task-model';
import {regions, regionFromHash, resolvePlan} from './model';
import {useWorkspaceData} from './useWorkspaceData';
import {useFocusSession} from './useFocusSession';
const Dashboard = lazy(() => import('./DashboardRegion'));
const Workspace = lazy(() => import('./WorkspaceRegion'));
const TaskEditor = lazy(() => import('./TaskEditor'));
const PlanImporter = lazy(() => import('./PlanImporter'));
const TaskFocusView = lazy(() => import('./TaskFocusView'));
const DashboardTools = lazy(() => import('./DashboardTools'));

function Region({region, viewport, children, onScroll}) {
  const element = useRef(null);
  const scrollTop = useRef(0);
  const contentHeight = useRef(600);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && element.current) contentHeight.current = element.current.scrollHeight;
      setNearby(entries[0].isIntersecting);
    },
      {root: viewport.current, rootMargin: '0px 20% 0px 20%'});
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [viewport]);
  useLayoutEffect(() => {if (nearby && element.current) element.current.scrollTop = scrollTop.current;}, [nearby]);
  return <section ref={element} className="v2-region" id={'v2-region-'+region.id} aria-labelledby={region.id+'-title'}
    onScroll={event => {scrollTop.current = event.currentTarget.scrollTop; onScroll();}}>
    <header className="v2-region-heading"><span>{region.number} /</span><h1 id={region.id+'-title'} tabIndex={-1}>{region.label}</h1><span className="v2-region-tag">CONNECTED SPACE</span></header>
    {nearby ? <Suspense fallback={<p role="status">Opening this space…</p>}>{children}</Suspense> : <div className="v2-region-placeholder" style={{minHeight:contentHeight.current}} aria-hidden="true"/>}
  </section>;
}
function SignedInWorkspace({user, logout}) {
  const data = useWorkspaceData(user.uid), plan = resolvePlan(data.tasks, data.plan), timer = useFocusSession(user.uid);
  const viewport = useRef(null), orbAnchor = useRef(null), lastFraction = useRef(0), idle = useRef(null);
  const [active, setActive] = useState(regionFromHash(location.hash)), [selected, setSelected] = useState(null), [focusedTaskId, setFocusedTaskId] = useState(null);
  const [travelPage, setTravelPage] = useState(null);
  const [importPlan, setImportPlan] = useState(null);
  const inspect = id => setFocusedTaskId(id);
  const [authError, setAuthError] = useState('');
  const [orbBox, setOrbBox] = useState({left: innerWidth-66, top: 12, width: 48, height: 48, compact: true});
  const [theme, setTheme] = useState(() => {try {return localStorage.getItem('invincible-orb-theme') || 'gold';} catch {return 'gold';}});
  useEffect(() => {
    const returnFromPage = () => setTravelPage(null);
    window.addEventListener('pageshow', returnFromPage);
    return () => window.removeEventListener('pageshow', returnFromPage);
  }, []);
  useEffect(() => {
    if (!travelPage) return;
    const timer = setTimeout(() => {window.location.assign(travelPage.href);}, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520);
    return () => clearTimeout(timer);
  }, [travelPage]);
  const moveOrb = useCallback(() => {
    const rect = orbAnchor.current?.getBoundingClientRect();
    const canvas = viewport.current;
    const viewportRect = canvas?.getBoundingClientRect();
    const visibleHeight = rect && viewportRect
      ? Math.max(0, Math.min(rect.bottom, viewportRect.bottom) - Math.max(rect.top, viewportRect.top)) : 0;
    const prominent = rect && canvas && visibleHeight >= Math.min(rect.height * .35, 180)
      && canvas.scrollLeft < canvas.clientWidth*.35;
    const box = prominent ? {left: rect.left, top: rect.top, width: rect.width, height: rect.height, compact: false}
      : {left: innerWidth-66, top: 12, width: 48, height: 48, compact: true};
    setOrbBox(previous => Object.keys(box).every(key => box[key] === previous[key]) ? previous : box);
  }, []);
  const mountOrbAnchor = useCallback(node => {orbAnchor.current = node; if (node) requestAnimationFrame(moveOrb);}, [moveOrb]);
  const savePosition = () => {
    const canvas = viewport.current;
    if (!canvas) return;
    const fraction = canvas.scrollLeft/canvas.clientWidth;
    const region = regions[Math.min(regions.length-1, Math.round(fraction))];
    history.replaceState({...history.state, v2Position: fraction}, '', '#'+region.id);
  };
  const navigate = (id, {restore = false, fraction} = {}) => {
    const canvas = viewport.current, index = regions.findIndex(region => region.id === id);
    if (!canvas || index < 0) return;
    if (!restore) {savePosition(); history.pushState({v2Position: index}, '', '#'+id);}
    canvas.scrollTo({left: (fraction ?? index)*canvas.clientWidth,
      behavior: restore || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    document.querySelector('.v2-topbar nav a[href="#'+id+'"]')?.focus({preventScroll: true});
  };
  useEffect(() => {
    const canvas = viewport.current;
    const restore = () => {clearTimeout(idle.current); navigate(regionFromHash(location.hash), {restore: true, fraction: typeof history.state?.v2Position === 'number' ? history.state.v2Position : undefined});};
    restore();
    let previousWidth = canvas.clientWidth;
    const resize = new ResizeObserver(() => {
      if (canvas.clientWidth !== previousWidth) {
        canvas.scrollTo({left: lastFraction.current*canvas.clientWidth, behavior: 'instant'});
        previousWidth = canvas.clientWidth;
      }
      moveOrb();
    });
    resize.observe(canvas);
    window.addEventListener('popstate', restore);
    // Hash edits and native anchor activation also remain valid direct links.
    const hash = () => {if (!history.state?.v2Position) navigate(regionFromHash(location.hash), {restore: true});};
    window.addEventListener('hashchange', hash);
    return () => {resize.disconnect(); clearTimeout(idle.current); window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', hash);};
  }, []);
  useEffect(() => {
    // Observe lazy content mounting and vertical reflow without another Orb renderer.
    const observer = new ResizeObserver(moveOrb);
    const anchor = orbAnchor.current;
    if (anchor) observer.observe(anchor);
    const frame = requestAnimationFrame(moveOrb);
    return () => {observer.disconnect(); cancelAnimationFrame(frame);};
  }, [active, data.tasksReady, data.planReady]);
  const scroll = () => {
    const canvas = viewport.current;
    if (!canvas) return;
    lastFraction.current = canvas.scrollLeft/canvas.clientWidth;
    setActive(regions[Math.min(regions.length-1, Math.round(lastFraction.current))].id);
    moveOrb(); clearTimeout(idle.current); idle.current = setTimeout(savePosition, 180);
  };
  const ready = data.tasksReady && data.planReady;
  const error = data.taskError || data.planError;
  const changeTheme = () => setTheme(current => {
    const themes = ['cyan','gold','emerald'], next = themes[(themes.indexOf(current)+1)%themes.length];
    try {localStorage.setItem('invincible-orb-theme', next);} catch {}
    return next;
  });
  return <div className="v2-shell">
    <header className="v2-topbar"><a className="v2-brand" href="#dashboard" onClick={event => {event.preventDefault();navigate('dashboard');}}><span className="v2-brand-mark">I</span><span>INVINCIBLE<small>PERSONAL WORKSPACE</small></span></a>
      <nav aria-label="Explore spaces"><span className="v2-nav-caption" aria-hidden="true">VIEWS</span>{regions.map(region => <a key={region.id} href={'#'+region.id} aria-current={active === region.id ? 'location' : undefined} onClick={event => {if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;event.preventDefault();navigate(region.id);}}><span>{region.number}</span>{region.label}</a>)}</nav>
      <div className="v2-account"><Suspense fallback={null}><DashboardTools/></Suspense><button aria-label="Sign out" onClick={async () => {try {await logout();} catch {setAuthError('Sign-out did not complete. Try again.');}}}>Sign out</button></div>
    </header>
    <div className="v2-connection" role="status"><span className={error ? 'v2-dot error' : 'v2-dot'}/>{authError || error || (!ready ? 'Restoring your workspace…' : data.tasksCached || data.planCached ? 'Showing cached records · Waiting for connection' : 'Connected to your existing workspace')}<span className="v2-preview-label">WORKSPACE</span>{error && <button onClick={data.retry}>Retry sync</button>}</div>
    <main ref={viewport} className="v2-canvas" aria-label="Continuous spatial workspace" tabIndex={0} onScroll={scroll}
      onKeyDown={event => {if (event.target !== event.currentTarget) return;let index = regions.findIndex(region => region.id === active);if (event.key === 'ArrowRight') index++;else if (event.key === 'ArrowLeft') index--;else if (event.key === 'Home') index=0;else if (event.key === 'End') index=regions.length-1;else return;event.preventDefault();navigate(regions[Math.max(0,Math.min(regions.length-1,index))].id);}}>
      {regions.map(region => <Region key={region.id} region={region} viewport={viewport} onScroll={moveOrb}>
        {!ready ? <div className="v2-panel v2-loading" role="status">Restoring tasks and your daily plan…</div> :
          region.id === 'dashboard' ? <Dashboard data={data} plan={plan} timer={timer} onInspect={inspect} orbAnchor={mountOrbAnchor} theme={theme} onChangeTheme={changeTheme} onOpenWorkspace={() => navigate('workspace')} onTravel={setTravelPage}/> :
          <Workspace data={data} plan={plan} timer={timer} onInspect={inspect} uid={user.uid} onCreate={() => setSelected({id: newId('t'), create: true})} onPaste={() => setImportPlan({targetId: ''})}/>}
      </Region>)}
    </main>
    <div className={'v2-orb '+(orbBox.compact ? 'is-compact' : travelPage && active === 'dashboard' ? 'is-approaching' : '')} style={{left: orbBox.left, top: orbBox.top, width: orbBox.width, height: orbBox.height}}
      onWheel={event => {const distance = event.deltaX + (event.shiftKey ? event.deltaY : 0); if (distance && viewport.current) {event.preventDefault(); viewport.current.scrollLeft += distance;}}}><FocusOrb theme={theme} spin={false} allowDrag={false} richParticles followPagePointer/>
      {orbBox.compact && <button className="v2-orb-theme" aria-label={'Orb theme: '+theme+'. Change theme'} onClick={changeTheme}>◐</button>}
    </div>
    <footer className="v2-footer"><span>DASHBOARD MAP · PERSONAL WORKSPACE</span><span className="v2-footer-desktop">Choose a glow to enter its page · Swipe sideways for widgets</span><span className="v2-footer-mobile">Tap a glow to enter its page · Swipe sideways for widgets</span><span>{active === 'dashboard' ? '01' : '02'} / 02</span></footer>
    {travelPage && <div className="v2-travel" role="status" aria-live="polite"><span>ENTERING</span><strong>{travelPage.label}</strong><i aria-hidden="true"/></div>}
    <Suspense fallback={<p className="v2-editor-loading" role="status">Opening editor…</p>}>
      {selected && <TaskEditor key={selected.id} uid={user.uid} taskId={selected.id} isNew={selected.create} task={data.tasks.find(task => task.id === selected.id)} onClose={() => setSelected(null)} onPaste={id => {setSelected(null); setImportPlan({targetId: id});}}/>}
      {importPlan && <PlanImporter uid={user.uid} tasks={data.tasks} targetId={importPlan.targetId} onClose={() => setImportPlan(null)}/>}
      {focusedTaskId && <TaskFocusView key={focusedTaskId} uid={user.uid} task={data.tasks.find(task => task.id === focusedTaskId)} onClose={() => setFocusedTaskId(null)} onPaste={id => {setFocusedTaskId(null); setImportPlan({targetId: id});}}/>}
    </Suspense>
  </div>;
}
export function SpatialApp() {
  const {user, ready, error, login, logout} = useAuth();
  useEffect(() => {document.body.classList.add('spatial-page'); return () => document.body.classList.remove('spatial-page');}, []);
  if (!ready) return <div className="v2-auth"><p role="status">Restoring your Invincible session…</p></div>;
  if (!user) return <main className="v2-auth"><div><p className="v2-eyebrow">INVINCIBLE</p><h1>A little more space.<br/>For everything you do.</h1><p>Your existing account. Your existing work.<br/>One continuous environment.</p>{error && <p role="alert">{error}</p>}<button className="v2-primary" onClick={login}>Continue with Google</button><small>Main Dashboard + My Workspace</small></div></main>;
  // Keyed lifetime prevents any frame of the previous account's records or timer.
  return <SignedInWorkspace key={user.uid} user={user} logout={logout}/>;
}
