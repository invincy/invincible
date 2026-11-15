// Accessible in-page confirmation, including keyboard cancellation.
export function confirmAction(message,actionLabel='Confirm'){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog'),text=document.createElement('p'),actions=document.createElement('div'),cancel=document.createElement('button'),apply=document.createElement('button');
  text.id='creator-confirm-message';text.textContent=message;dialog.setAttribute('aria-labelledby',text.id);
  cancel.textContent='Keep current';apply.textContent=actionLabel;cancel.type=apply.type='button';actions.className='vs-actions';actions.append(cancel,apply);dialog.append(text,actions);document.body.append(dialog);
  const finish=value=>{dialog.close();dialog.remove();resolve(value);};cancel.onclick=()=>finish(false);apply.onclick=()=>finish(true);dialog.oncancel=event=>{event.preventDefault();finish(false);};dialog.showModal();cancel.focus();
 });
}
