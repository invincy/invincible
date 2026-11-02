// Integrating the speed curve keeps motion continuous as the two-second burst ends.
export function startupMotion(seconds,reduced=false){
 if(reduced)return {speed:1,phase:8,storm:0,links:1};
 const elapsed=Math.max(0,seconds),t=Math.min(1,elapsed/2),storm=(1-t)**3;
 return {speed:1+8*storm,phase:8+elapsed+4*(1-(1-t)**4),storm,links:t*t*(3-2*t)};
}
