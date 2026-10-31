import {useEffect, useRef} from 'react';
import {mountAccountMenu} from '../../shared/account-menu.js';
export function AccountMenu({user, logout, login}) {
  const host = useRef(null);
  useEffect(() => {const menu = mountAccountMenu(host.current, {user,logout,login});return () => menu.destroy();}, [user,logout,login]);
  return <div className="inv-account-host" ref={host}/>;
}
