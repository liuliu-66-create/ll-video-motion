import {createReadStream, existsSync} from 'node:fs';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const prototypeDir = fileURLToPath(new URL('.', import.meta.url));
const prototypeRoot = resolve(prototypeDir);
const projectDir = resolve(prototypeDir, '..');
const outputDir = resolve(prototypeDir, 'output');
const jobsDir = resolve(prototypeDir, 'jobs');
const port = Number(process.env.MOTION_EDITOR_PORT || 4174);

await mkdir(outputDir, {recursive: true});
await mkdir(jobsDir, {recursive: true});

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
};

const templates = {
  'concept-explainer-topdown': {
    composition: 'ConceptExplainerTopDownEditable',
    prefix: 'topdown',
    fields: {coreTitle: 18, definition: 30, leftPrefix: 8, leftHighlight: 8, leftSuffix: 8, middleText: 14, rightText: 14},
    optional: ['leftPrefix', 'leftSuffix'],
  },
  'concept-explainer-radial': {
    composition: 'ConceptExplainerRadialEditable',
    prefix: 'radial',
    fields: {coreTitle: 12, coreSubtitle: 20, leftLabel: 8, leftText: 12, rightLabel: 8, rightPrefix: 8, rightHighlight: 8, rightSuffix: 8, bottomLabel: 8, bottomLine1: 14, bottomLine2: 18},
    optional: ['rightPrefix', 'rightSuffix'],
  },
};

const validate = (input) => {
  if (!input || typeof input !== 'object' || !templates[input.templateId]) {
    throw new Error('模板配置无效。');
  }
  const template = templates[input.templateId];
  const result = {templateId: input.templateId};
  for (const [key, max] of Object.entries(template.fields)) {
    const value = String(input[key] ?? '').trim();
    if (!value && !template.optional.includes(key)) throw new Error(`${key} 不能为空。`);
    if (Array.from(value).length > max) throw new Error(`${key} 超出 ${max} 个字符。`);
    result[key] = value;
  }
  const durationSeconds = Number(input.durationSeconds);
  if (!Number.isInteger(durationSeconds) || durationSeconds < 4 || durationSeconds > 10) {
    throw new Error('视频时长必须是4至10秒的整数。');
  }
  result.durationSeconds = durationSeconds;
  return result;
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {'Content-Type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(data));
};

const readBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('请求内容过大。');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const renderVideo = (composition, propsPath, outputPath) => new Promise((resolvePromise, rejectPromise) => {
  const cliPath = resolve(projectDir, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const args = [
    cliPath,
    'render',
    'editor-prototype/remotion/index.ts',
    composition,
    outputPath,
    `--props=${propsPath}`,
    '--codec=h264',
    '--crf=18',
  ];
  const child = spawn(process.execPath, args, {cwd: projectDir, windowsHide: true});
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', rejectPromise);
  child.on('close', (code) => {
    if (code === 0) resolvePromise();
    else rejectPromise(new Error(stderr.slice(-1600) || `渲染失败，退出码 ${code}`));
  });
});

const safeStaticPath = (pathname) => {
  if (pathname === '/') return resolve(prototypeDir, 'index.html');
  if (pathname === '/radial.html') return resolve(prototypeDir, 'radial.html');
  if (pathname === '/radial-default-config.json') return resolve(prototypeDir, 'radial-default-config.json');
  if (pathname === '/default-config.json') return resolve(prototypeDir, 'default-config.json');
  if (pathname.startsWith('/assets/')) return resolve(projectDir, 'public', pathname.slice(1));
  if (pathname.startsWith('/output/')) return resolve(outputDir, pathname.slice('/output/'.length));
  return null;
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    if (req.method === 'GET' && url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/render') {
      const config = validate(await readBody(req));
      const template = templates[config.templateId];
      const id = `${template.prefix}-${Date.now()}`;
      const propsPath = resolve(jobsDir, `${id}.json`);
      const outputPath = resolve(outputDir, `${id}.mp4`);
      await writeFile(propsPath, JSON.stringify(config, null, 2), 'utf8');
      await renderVideo(template.composition, propsPath, outputPath);
      const editPath = config.templateId === 'concept-explainer-radial' ? `/radial.html?job=${id}` : `/?job=${id}`;
      sendJson(res, 200, {ok: true, videoUrl: `/output/${id}.mp4`, editUrl: editPath, jobId: id, config});
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/job') {
      const id = url.searchParams.get('id') || '';
      if (!/^(topdown|radial)-\d+$/.test(id)) throw new Error('任务编号无效。');
      const jobPath = resolve(jobsDir, `${id}.json`);
      if (!existsSync(jobPath)) {
        sendJson(res, 404, {ok: false, error: '没有找到这个动效配置。'});
        return;
      }
      sendJson(res, 200, {ok: true, config: JSON.parse(await readFile(jobPath, 'utf8')), videoUrl: existsSync(resolve(outputDir, `${id}.mp4`)) ? `/output/${id}.mp4` : null});
      return;
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, {ok: false, error: '不支持这个请求。'});
      return;
    }

    const filePath = safeStaticPath(url.pathname);
    if (!filePath || ((!filePath.startsWith(prototypeRoot + sep)) && (!filePath.startsWith(resolve(projectDir, 'public') + sep))) || !existsSync(filePath)) {
      sendJson(res, 404, {ok: false, error: '没有找到这个页面。'});
      return;
    }
    const info = await stat(filePath);
    if (!info.isFile()) {
      sendJson(res, 404, {ok: false, error: '没有找到这个页面。'});
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
    });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    sendJson(res, 400, {ok: false, error: error instanceof Error ? error.message : '处理失败。'});
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Editable motion prototype: http://127.0.0.1:${port}`);
});
