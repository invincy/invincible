import { createLocalAgentServer } from './agent-server.mjs';
const service = await createLocalAgentServer({ ownerUid: process.env.INVINCIBLE_LOCAL_OWNER_UID, port: Number(process.env.INVINCIBLE_LOCAL_AI_PORT || 8787), appOrigin: process.env.INVINCIBLE_APP_ORIGIN || null });
await service.listen();
console.log('Invincible Local AI: ' + service.origin);
console.log('Open locally to pair this browser (keep this link private): ' + service.origin + '/#pair=' + service.token);
if (!service.images.storage().available) console.error(service.images.storage().error);
process.on('SIGINT', async () => { await service.close(); process.exit(0); });
