// Firestore rejects undefined values at any depth and rejects arrays nested directly
// inside another array. Map routes and polygon rings legitimately use that shape, so
// encode only the inner array as a tagged JSON value for storage. Runtime callers get
// the original geometry back through restoreProjectFromFirestore().
const SERIALIZED_ARRAY_KEY='__invincibleSerializedArray';
const isPlainObject=value=>value&&Object.getPrototypeOf(value)===Object.prototype;

function encode(value,inArray=false){
 if(Array.isArray(value)){
  const clean=value.filter(item=>item!==undefined);
  if(inArray)return {[SERIALIZED_ARRAY_KEY]:JSON.stringify(clean.map(item=>encode(item,false)))};
  return clean.map(item=>encode(item,true));
 }
 if(isPlainObject(value))return Object.fromEntries(Object.entries(value).filter(([,item])=>item!==undefined).map(([key,item])=>[key,encode(item,false)]));
 return value;
}

function decode(value){
 if(Array.isArray(value))return value.map(decode);
 if(isPlainObject(value)){
  if(typeof value[SERIALIZED_ARRAY_KEY]==='string'&&Object.keys(value).length===1){
   try{return decode(JSON.parse(value[SERIALIZED_ARRAY_KEY]));}catch{return value;}
  }
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,decode(item)]));
 }
 return value;
}

export function copyProjectForWrite(value){return encode(value,false);}
export function restoreProjectFromFirestore(value){return decode(value);}
