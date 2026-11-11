// An exponential tail lets both dashboard particle layers settle gradually.
export function dashboardStartupMotion(seconds,reduced=false){
 if(reduced)return startupMotion(0,true);
 const elapsed=Math.max(0,seconds);
 const storm=Math.exp(-elapsed*1.45),turn=4.2*(-Math.expm1(-elapsed*1.45));
 return {phase:8+elapsed+turn,turn,storm,speed:1+6.09*storm,links:(1-storm)**2};
}

export function startupMotion(seconds,reduced=false){
 if(reduced)return {speed:1,phase:8,turn:0,storm:0,links:1};
 const elapsed=Math.max(0,seconds),t=Math.min(1,elapsed/2),storm=(1-t)**3;
 return {speed:1+8*storm,phase:8+elapsed+4*(1-(1-t)**4),turn:4*(1-(1-t)**4),storm,links:t*t*(3-2*t)};
}
