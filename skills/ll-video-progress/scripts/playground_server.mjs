import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {resolveProjectRoot} from './runtime.mjs';
const root=await resolveProjectRoot();
process.env.LL_VIDEO_PLAYGROUND_MODE='progress';
await import(pathToFileURL(resolve(root,'scripts/playground_server.mjs')).href);
