export const recordKeys={vehicle:'vehicles',km:'odometerReadings',fuel:'fuel',service:'services',reminder:'reminders'};
const keys=Object.values(recordKeys);
export function normalizeGarage(data={}){return{...data,...Object.fromEntries(keys.map(key=>[key,Array.isArray(data[key])?data[key].map(item=>({...item})):[]]))}}
export function currentOdometer(state,vehicleId){
 const vehicle=state.vehicles.find(item=>item.id===vehicleId);
 const readings=state.odometerReadings.filter(item=>item.vehicleId===vehicleId).sort((a,b)=>a.date.localeCompare(b.date));
 return Number(readings.at(-1)?.odometer??vehicle?.odometer??0);
}
export function applyGarageChange(data,change){
 const next=normalizeGarage(data),key=recordKeys[change.kind];
 if(!key)throw Error('Unknown Garage record type.');
 if(change.action==='delete'){
  next[key]=next[key].filter(item=>item.id!==change.id);
  if(change.kind==='vehicle')for(const related of keys.filter(value=>value!=='vehicles'))next[related]=next[related].filter(item=>item.vehicleId!==change.id);
 }else if(change.action==='upsert'){
  const index=next[key].findIndex(item=>item.id===change.item.id),old=next[key][index];
  if(change.editing&&!old)throw Error('This record was removed on another device. Reopen Garage before editing.');
  if(change.kind!=='vehicle'&&!next.vehicles.some(item=>item.id===change.item.vehicleId))throw Error('This vehicle is no longer available.');
  const item={...old,...change.item};
  if(index>=0)next[key][index]=item;else next[key].push(item);
  if(change.kind==='vehicle'&&(!old||Number(old.odometer)!==Number(item.odometer))){
   const reading=next.odometerReadings.find(entry=>entry.vehicleId===item.id&&entry.date===change.date);
   if(reading)reading.odometer=item.odometer;
   else next.odometerReadings.push({id:change.readingId,vehicleId:item.id,date:change.date,odometer:item.odometer});
  }
 }else throw Error('Unknown Garage operation.');
 for(const vehicle of next.vehicles)vehicle.odometer=currentOdometer(next,vehicle.id);
 return next;
}
