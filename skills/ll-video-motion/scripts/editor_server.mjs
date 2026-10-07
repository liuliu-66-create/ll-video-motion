import {createReadStream, existsSync} from 'node:fs';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {basename, dirname, extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {absoluteStyle, buildCatalog, findStyle, resolveProjectRoot} from './catalog.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(scriptDir, '..');
const projectRoot = await resolveProjectRoot();
const jobsDir = resolve(projectRoot, 'output', 'skill-jobs');
const inputDir = resolve(projectRoot, 'output', 'skill-editor-inputs');
const outputDir = resolve(projectRoot, 'output', 'skill-renders');
const editorPath = resolve(skillDir, 'assets', 'editor.html');
const renderScript = resolve(scriptDir, 'render.mjs');
const port = Number(process.env.LL_VIDEO_MOTION_EDITOR_PORT || 4175);

await mkdir(jobsDir, {recursive: true});
await mkdir(inputDir, {recursive: true});
await mkdir(outputDir, {recursive: true});

const sendJson = (res, status, value) => {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length});
  res.end(body);
};

const readBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) throw new Error('请求内容过大。');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const runRender = (configPath, resultPath) => new Promise((resolvePromise, rejectPromise) => {
  const child = spawn(process.execPath, [renderScript, '--config', configPath, '--result', resultPath], {
    cwd: projectRoot,
    windowsHide: true,
  });
  let stderr = '';
  child.stdout.on('data', () => undefined);
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', rejectPromise);
  child.on('close', (code) => code === 0
    ? resolvePromise()
    : rejectPromise(new Error(stderr.slice(-1800) || `渲染失败，退出码 ${code}`)));
});

const safeMedia = (name) => {
  const fileName = basename(name);
  const path = resolve(outputDir, fileName);
  return path.startsWith(outputDir + sep) ? path : null;
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `127.0.0.1:${port}`}`);

    if (req.method === 'GET' && url.pathname === '/api/catalog') {
      const {styles} = await buildCatalog(projectRoot);
      sendJson(res, 200, {ok: true, styles: styles.map(({styleId, name, family, composition}) => ({styleId, name, family, composition}))});
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/template') {
      const id = url.searchParams.get('id') || '';
      const {style} = await findStyle(id, projectRoot);
      const resolvedStyle = absoluteStyle(style, projectRoot);
      const props = JSON.parse(await readFile(resolvedStyle.presetPath, 'utf8'));
      delete props.templateId;
      sendJson(res, 200, {ok: true, style: resolvedStyle, props});
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/job') {
      const id = url.searchParams.get('id') || '';
      if (!/^[a-z0-9-]+$/i.test(id)) throw new Error('任务编号无效。');
      const metadataPath = resolve(jobsDir, `${id}.meta.json`);
      if (!existsSync(metadataPath)) {
        sendJson(res, 404, {ok: false, error: '没有找到这个动效任务。'});
        return;
      }
      const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
      sendJson(res, 200, {
        ok: true,
        job: metadata,
        videoUrl: existsSync(metadata.outputPath) ? `/media/${encodeURIComponent(basename(metadata.outputPath))}` : null,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/render') {
      const input = await readBody(req);
      if (!input || typeof input.templateId !== 'string' || !input.props || typeof input.props !== 'object') {
        throw new Error('配置缺少 templateId 或 props。');
      }
      await findStyle(input.templateId, projectRoot);
      const requestId = `editor-${Date.now()}`;
      const configPath = resolve(inputDir, `${requestId}.json`);
      const resultPath = resolve(inputDir, `${requestId}.result.json`);
      await writeFile(configPath, `${JSON.stringify({templateId: input.templateId, selectionReason: input.selectionReason ?? '编辑页修改', props: input.props}, null, 2)}\n`, 'utf8');
      await runRender(configPath, resultPath);
      const result = JSON.parse(await readFile(resultPath, 'utf8'));
      sendJson(res, 200, {...result, videoUrl: `/media/${encodeURIComponent(basename(result.outputPath))}`});
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/media/')) {
      const filePath = safeMedia(decodeURIComponent(url.pathname.slice('/media/'.length)));
      if (!filePath || !existsSync(filePath)) {
        sendJson(res, 404, {ok: false, error: '没有找到视频。'});
        return;
      }
      const info = await stat(filePath);
      res.writeHead(200, {'Content-Type': 'video/mp4', 'Content-Length': info.size});
      createReadStream(filePath).pipe(res);
      return;
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/editor.html')) {
      const info = await stat(editorPath);
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Content-Length': info.size});
      createReadStream(editorPath).pipe(res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    sendJson(res, 404, {ok: false, error: '没有找到这个页面。'});
  } catch (error) {
    sendJson(res, 400, {ok: false, error: error instanceof Error ? error.message : '处理失败。'});
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`ll-video-motion editor: http://127.0.0.1:${port}/\n`);
});
