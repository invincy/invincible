function assertAccess(auth,project){
 if(!auth)throw Error('Sign in to Creator Studio.');
 if(!project||!(project.ownerUid===auth.uid||(auth.token?.email_verified===true&&project.editorEmails?.includes(String(auth.token.email||'').toLowerCase()))))throw Error('Project access denied.');
}
function decodeVideo(data){
 if(!['video/mp4','video/webm'].includes(data.mimeType)||typeof data.base64!=='string'||data.base64.length>7000000||!data.base64.length||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.base64)||data.base64.length%4)throw Error('Use an MP4 or WebM file up to 5 MB.');
 const bytes=Buffer.from(data.base64,'base64');if(bytes.length>5*1024*1024||bytes.length<12)throw Error('Invalid or oversized video.');
 if(data.mimeType==='video/mp4'&&bytes.toString('ascii',4,8)!=='ftyp')throw Error('Invalid MP4 file header.');
 if(data.mimeType==='video/webm'&&!bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])))throw Error('Invalid WebM file header.');return bytes;
}
module.exports={assertAccess,decodeVideo};
