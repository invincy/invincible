const nav=document.querySelector('.global-nav');
const trigger=nav?.querySelector('.nav-trigger');
const backdrop=document.querySelector('.nav-backdrop');
const links=nav?.querySelector('.nav-links');
if(links&&!links.querySelector('a[href="/invincible/workday/"]')){
 const portfolio=[...links.querySelectorAll('a')].find(link=>link.textContent.includes('Portfolio'));
 const workday=document.createElement('a');
 workday.href='/invincible/workday/';
 workday.innerHTML='<span class="nav-icon">06</span><span class="nav-label">Workday</span>';
 if(document.body.classList.contains('workday-page'))workday.setAttribute('aria-current','page');
 links.insertBefore(workday,portfolio||null);
 portfolio?.querySelector('.nav-icon')&&(portfolio.querySelector('.nav-icon').textContent='07');
}
function closeNav(){document.body.classList.remove('nav-open');trigger?.setAttribute('aria-expanded','false')}
trigger?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');trigger.setAttribute('aria-expanded',String(open))});
backdrop?.addEventListener('click',closeNav);
nav?.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',closeNav));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav()});
