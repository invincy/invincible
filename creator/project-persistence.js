// Firestore rejects undefined values at any depth. Director drafts are deliberately
// retained on the Creator project, so sanitize the complete write without flattening
// Timestamp/Date/Blob values or discarding unknown compatible metadata.
export function copyProjectForWrite(value){
 if(Array.isArray(value))return value.filter(item=>item!==undefined).map(copyProjectForWrite);
 if(value&&Object.getPrototypeOf(value)===Object.prototype){
  return Object.fromEntries(Object.entries(value).filter(([,item])=>item!==undefined).map(([key,item])=>[key,copyProjectForWrite(item)]));
 }
 return value;
}
