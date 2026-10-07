import {createReadStream, existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {stat} from 'node:fs/promises';
import {resolveProjectRoot} from './catalog.mjs';

const projectRoot = await resolveProjectRoot();
const playgroundRoot = resolve(projectRoot, 'playground');
const port = Number(process.env.LL_VIDEO_MOTION_PLAYGROUND_PORT || 4173);

if (!existsSync(resolve(playgroundRoot, 'index.html'))) {
  throw new Error(`没有找到 Playground：${playgroundRoot}`);
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `127.0.0.1:${port}`}`);
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = resolve(playgroundRoot, `.${requested}`);
    if (filePath !== playgroundRoot && !filePath.startsWith(playgroundRoot + sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const info = await stat(filePath);
    if (!info.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
    });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end(error instanceof Error ? error.message : 'Playground 启动失败');
  }
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    process.stderr.write(`端口 ${port} 已被占用。可以设置 LL_VIDEO_MOTION_PLAYGROUND_PORT 后重试。\n`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, '127.0.0.1', () => {
  const baseUrl = `http://127.0.0.1:${port}/index.html`;
  process.stdout.write(`${JSON.stringify({
    ok: true,
    baseUrl,
    chooseUrl: `${baseUrl}?category=transition`,
    instruction: '请观看两个真实动态样片，然后回复“样式 A”或“样式 B”。',
  }, null, 2)}\n`);
});
