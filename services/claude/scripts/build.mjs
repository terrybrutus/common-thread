import { mkdirSync, copyFileSync } from 'node:fs';
import { build } from 'esbuild';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built account-authenticated Claude gateway.');
