import React, {useEffect, useRef} from 'react';

export default function EditorDialog({title, onClose, busy, children, closeLabel = 'Close saved work'}) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => {previous?.focus?.({preventScroll: true});};
  }, []);
  return <dialog ref={dialog} className="v2-inspector v2-editor" aria-labelledby="v2-editor-title" onCancel={event => {if (busy) event.preventDefault();}} onClose={() => {if (!busy) onClose();}}>
    <header className="v2-editor-heading"><h2 id="v2-editor-title">{title}</h2><button autoFocus type="button" disabled={busy} onClick={onClose} aria-label={closeLabel}>Close ×</button></header>
    {children}
  </dialog>;
}
