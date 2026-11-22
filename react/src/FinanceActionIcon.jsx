const paths={
  income:<><path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>,
  expense:<><path d="M12 21V8"/><path d="m7 13 5-5 5 5"/><path d="M5 4h14"/></>,
  upload:<><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 17v3h14v-3"/></>
};

export function FinanceActionIcon({name}) {
  return <svg className="finance-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
