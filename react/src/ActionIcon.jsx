const paths={
  income:<><path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>,
  expense:<><path d="M12 21V8"/><path d="m7 13 5-5 5 5"/><path d="M5 4h14"/></>,
  upload:<><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 17v3h14v-3"/></>,
  copy:<><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  image:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></>,
  draw:<><path d="M13 21h8"/><path d="m15.5 5.5 3 3"/><path d="M4 16.5 16.5 4a2.12 2.12 0 0 1 3 3L7 19.5 3 21z"/></>
};

export function ActionIcon({name,className=''}) {
  return <svg className={`action-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
