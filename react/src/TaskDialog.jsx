import{useEffect,useRef}from'react';
export function TaskDialog({children,onClose,label,className=''}){
 const ref=useRef(null);
 useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close()},[]);
 return <dialog ref={ref} className={'dialog '+className} aria-label={label} onCancel={event=>{event.preventDefault();onClose?.()}}>{children}</dialog>;
}
