import {createReadStream, existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {stat, mkdir, mkdtemp} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';


const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const playgroundRoot = resolve(projectRoot, 'playground');
const port = Number(process.env.LL_VIDEO_MOTION_PLAYGROUND_PORT || 4173);
const generatedRoot = resolve(projectRoot, 'outputs', 'progress-playground-colors');
const scriptDir = resolve(projectRoot, 'skills/ll-video-progress/scripts');
const defaultMode = process.env.LL_VIDEO_PLAYGROUND_MODE || 'all';
const renders = new Map();
let renderQueue = Promise.resolve();
const jsonResponse = (res, status, data) => {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
};
const renderColor = (hex, styleId, fontSize) => {
  const cacheKey = styleId + ':' + hex + ':' + (fontSize || 'default');
  if (renders.has(cacheKey)) return renders.get(cacheKey);
  const job = renderQueue.then(async () => {
    await mkdir(generatedRoot, {recursive:true});
    const out = await mkdtemp(resolve(generatedRoot, hex + '-'));
    await new Promise((ok, fail) => {
      const args = ['-B','-X','utf8',resolve(scriptDir,'progress_preview.py'),'--color','#'+hex,'--style',styleId,'--out',out];
      if (fontSize !== undefined) args.push('--font-size',String(fontSize));
      const p = spawn(process.platform === 'win32' ? 'py' : 'python3', args, {windowsHide:true,stdio:['ignore','ignore','pipe']});
      let stderr = '';
      p.stderr.on('data', c => { stderr = (stderr + c).slice(-2000); });
      const timer = setTimeout(() => {p.kill(); fail(new Error('生成超时，请重试'));}, 60000);
      p.on('error', error => {clearTimeout(timer); fail(error);});
      p.on('close', code => {clearTimeout(timer); code === 0 ? ok() : fail(new Error(stderr || '生成失败'));});
    });
    const key = out.slice(generatedRoot.length + 1);
    return {preview:`/progress-generated/${key}/preview.webm`,poster:`/progress-generated/${key}/preview-alpha.png`,thumbnail:`/progress-generated/${key}/preview.png`,download:`/progress-generated/${key}/progress-strip.mov`,color:'#'+hex,styleId,fontSize};
  });
  renderQueue = job.catch(() => {});
  renders.set(cacheKey,job);
  job.catch(() => renders.delete(cacheKey));
  return job;
};

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
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `127.0.0.1:${port}`}`);
    if (url.pathname === '/api/progress-color') {
      if (req.method !== 'POST') return jsonResponse(res,405,{error:'请使用 POST'});
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return jsonResponse(res,403,{error:'来源不匹配'});
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 512) return jsonResponse(res,413,{error:'请求过大'});
      }
      let data;
      try {data = JSON.parse(body);} catch {return jsonResponse(res,400,{error:'无效请求'});}
      if (typeof data?.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(data.color)) return jsonResponse(res,400,{error:'请输入 #RRGGBB 色号'});
      const styleId = data.styleId || 'soft-white-green';
      if (!['soft-white-green','walking-leading','dot-line','short-segments','text-leading'].includes(styleId)) return jsonResponse(res,400,{error:'未知进度条样式'});
      const adjustable = ['dot-line','short-segments','text-leading'].includes(styleId);
      const fontSize = adjustable ? (data.fontSize ?? { 'dot-line':24,'short-segments':26,'text-leading':25 }[styleId]) : undefined;
      if (adjustable && (!Number.isInteger(fontSize) || fontSize < 18 || fontSize > 72)) return jsonResponse(res,400,{error:'字号请输入 18–72 之间的整数'});
      try {return jsonResponse(res,200,await renderColor(data.color.slice(1).toLowerCase(),styleId,fontSize));}
      catch (error) {return jsonResponse(res,500,{error:error.message});}
    }
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const generated = requested.match(/^\/progress-generated\/([0-9a-f]{6}-[A-Za-z0-9]+)\/(preview\.webm|preview\.png|preview-alpha\.png|poster\.png|progress-strip\.mov)$/);
    const root = generated ? generatedRoot : playgroundRoot;
    const filePath = generated ? resolve(root,generated[1],generated[2]) : resolve(root, `.${requested}`);
    if (filePath !== root && !filePath.startsWith(root + sep)) {
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
  const rootUrl = `http://127.0.0.1:${port}/index.html`;
  const baseUrl = defaultMode === 'motion' ? `${rootUrl}?mode=motion` : defaultMode === 'progress' ? `${rootUrl}?category=progress` : rootUrl;
  process.stdout.write(`${JSON.stringify({
    ok: true,
    baseUrl,
    chooseUrl: `${rootUrl}?mode=motion&category=transition`,
    progressUrl: `${rootUrl}?category=progress`,
    instruction: defaultMode === 'progress' ? '请观看真实动态样片，回复样式名称；可调整进度颜色。' : '请观看动态样片后选择样式。',
  }, null, 2)}\n`);
});
