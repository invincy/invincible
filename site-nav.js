const nav=document.querySelector('.global-nav');
const trigger=nav?.querySelector('.nav-trigger');
const backdrop=document.querySelector('.nav-backdrop');
const links=nav?.querySelector('.nav-links');
function insertPage({href,label,bodyClass}){
 if(!links||links.querySelector(`a[href="${href}"]`))return;
 const portfolio=[...links.querySelectorAll('a')].find(link=>link.textContent.includes('Portfolio'));
 const link=document.createElement('a');link.href=href;link.innerHTML=`<span class="nav-icon"></span><span class="nav-label">${label}</span>`;
 if(document.body.classList.contains(bodyClass))link.setAttribute('aria-current','page');
 links.insertBefore(link,portfolio||null);
}
insertPage({href:'/invincible/workday/',label:'Workday',bodyClass:'workday-page'});
insertPage({href:'/invincible/lic/',label:'LIC',bodyClass:'lic-page'});
insertPage({href:'/invincible/reminders/',label:'Reminders',bodyClass:'reminders-page'});
links?.querySelectorAll(':scope > a').forEach((link,index)=>{const icon=link.querySelector('.nav-icon');if(icon)icon.textContent=String(index+1).padStart(2,'0')});
function closeNav(){document.body.classList.remove('nav-open');trigger?.setAttribute('aria-expanded','false')}
trigger?.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');trigger.setAttribute('aria-expanded',String(open))});
backdrop?.addEventListener('click',closeNav);
nav?.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',closeNav));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav()});
