const nav=document.querySelector('.global-nav');
const trigger=nav?.querySelector('.nav-trigger');
const backdrop=document.querySelector('.nav-backdrop');
function closeNav(){document.body.classList.remove('nav-open');trigger?.setAttribute('aria-expanded','false')}
trigger?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');trigger.setAttribute('aria-expanded',String(open))});
backdrop?.addEventListener('click',closeNav);
nav?.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',closeNav));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav()});
