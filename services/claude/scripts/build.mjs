import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
mkdirSync("dist/server", { recursive: true });
mkdirSync("dist/.openai", { recursive: true });
const files = ['shared/story-merge.js', 'shared/knowledge.js', 'worker/knowledge.js', 'worker/index.js'];
const known = new Set([`import { packById, packVariants, knowledgeBoard } from '../shared/knowledge.js';`, 'import { mergeBriefs } from "../shared/story-merge.js";', 'import { knowledgeRequest, parseKnowledgeResponse, knowledgeReviewRequest } from "./knowledge.js";', 'import { packById } from "../shared/knowledge.js";']);
const bundle = files.map(file => readFileSync(file, 'utf8').replace(/^import .*;\r?$/gm, line => { if (!known.has(line.trim())) throw new Error('Unexpected service import: ' + line); return ''; }).replace(/^export /gm, '')).join('\n');
// The hosting runtime requires a default ESM handler.
writeFileSync("dist/server/index.js", bundle.replace('default {', 'export default {'));
copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");
console.log("Built private Claude service with knowledge packs and story merging");
