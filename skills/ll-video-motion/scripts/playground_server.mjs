import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {resolveProjectRoot} from './catalog.mjs';
const root=await resolveProjectRoot();
process.env.LL_VIDEO_PLAYGROUND_MODE='motion';
await import(pathToFileURL(resolve(root,'scripts/playground_server.mjs')).href);
