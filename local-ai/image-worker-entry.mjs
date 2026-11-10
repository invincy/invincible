import os from 'node:os';
import fs from 'node:fs/promises';
import { createLocalAgentServer } from './agent-server.mjs';

const username = os.userInfo().username;
if (process.platform !== 'win32' || username.toLowerCase() !== 'invincibleagent') throw Error('Start this entry under the existing restricted InvincibleAgent account.');
const log = 'E:/Invincible/AgentWorkspace/imagegen-test-worker.log';
await fs.writeFile(log, `Worker identity: ${os.hostname()}\\${username}; administrator: false (account membership verified by setup)\n`);
try {
  let config = {};
  try { config = JSON.parse(await fs.readFile('E:/Invincible/ImageGen/worker-config.json', 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const service = await createLocalAgentServer({ ownerUid: config.ownerUid || process.env.INVINCIBLE_LOCAL_OWNER_UID || 'local-imagegen-test', port: Number(config.port || process.env.INVINCIBLE_LOCAL_AI_PORT || 8788), appOrigin: config.appOrigin || process.env.INVINCIBLE_APP_ORIGIN || null });
  if (!service.images.storage().available) throw Error(service.images.storage().error);
  await service.listen();
  await fs.appendFile(log, `Invincible Local AI: ${service.origin}\nOpen locally to pair: ${service.origin}/#pair=${service.token}\n`);
  process.on('SIGINT', async () => { await service.close(); process.exit(0); });
} catch (error) { await fs.appendFile(log, 'Worker startup failed: ' + error.message + '\n'); throw error; }
