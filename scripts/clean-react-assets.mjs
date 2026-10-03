import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('../react-dist/assets/',import.meta.url));
if(fs.existsSync(directory))for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
 if(entry.isFile())fs.unlinkSync(directory+entry.name);
}
