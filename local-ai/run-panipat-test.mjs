import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { askOllama, executeLocalCommand } from './invincible-local-controller.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, '.test-data');
const outputPath = path.join(dataDir, 'panipat-project.json');
const toolsModule = await import(pathToFileURL('E:/Development/Worktrees/invincible-storage-manager/functions/src/tools/invincible-tools.js'));
const { executeInvincibleTool } = toolsModule.default ?? toolsModule;

const repository = {
  async createProject(args) {
    const project = {
      id: 'local-test-panipat',
      title: args.title,
      description: args.description,
      status: 'Not Started',
      currentStage: args.currentStage,
      steps: args.stages.map((title, index) => ({ id: `stage-${index + 1}`, title, done: false })),
      environment: 'isolated-local-ai-test',
    };
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
    return project;
  },
};

const output = await executeLocalCommand({
  message: 'Invincible, create a new Panipat project.',
  ask: ({ message }) => askOllama({ message, model: 'qwen3:4b' }),
  executeTool: (name, args) => executeInvincibleTool(repository, name, args),
});

const saved = JSON.parse(await fs.readFile(outputPath, 'utf8'));
if (!output.verified || saved.title !== 'Panipat' || saved.environment !== 'isolated-local-ai-test') {
  throw new Error('Panipat verification failed.');
}
console.log(JSON.stringify({ output, savedPath: outputPath, verified: true }, null, 2));
