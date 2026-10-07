import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {basename, dirname, resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {absoluteStyle, findStyle, resolveProjectRoot} from './catalog.mjs';

const args = process.argv.slice(2);
const arg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const configArgument = arg('--config');
if (!configArgument) throw new Error('缺少 --config <JSON文件路径>。');
const configPath = resolve(configArgument);
if (!existsSync(configPath)) throw new Error(`找不到配置文件：${configPath}`);

const input = JSON.parse(await readFile(configPath, 'utf8'));
if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('配置必须是 JSON 对象。');
if (typeof input.templateId !== 'string' || !input.templateId.trim()) throw new Error('配置缺少 templateId。');

const projectRoot = await resolveProjectRoot();
const {style} = await findStyle(input.templateId.trim(), projectRoot);
const resolvedStyle = absoluteStyle(style, projectRoot);

const deepMerge = (base, override) => {
  if (Array.isArray(override)) return override;
  if (!override || typeof override !== 'object') return override;
  const output = base && typeof base === 'object' && !Array.isArray(base) ? {...base} : {};
  for (const [key, value] of Object.entries(override)) {
    output[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? deepMerge(output[key], value)
      : value;
  }
  return output;
};

let baseProps = {};
if (resolvedStyle.presetPath) {
  if (!existsSync(resolvedStyle.presetPath)) throw new Error(`找不到模板预设：${resolvedStyle.presetPath}`);
  baseProps = JSON.parse(await readFile(resolvedStyle.presetPath, 'utf8'));
}

const reserved = new Set(['templateId', 'selectionReason', 'outputPath', 'props']);
const flatProps = Object.fromEntries(Object.entries(input).filter(([key]) => !reserved.has(key)));
const overrideProps = input.props && typeof input.props === 'object' && !Array.isArray(input.props)
  ? input.props
  : flatProps;
const renderProps = deepMerge(baseProps, overrideProps);
delete renderProps.templateId;

const safeId = style.styleId.replace(/[^a-z0-9-]+/gi, '-');
const jobId = `${safeId}-${Date.now()}`;
const jobsDir = resolve(projectRoot, 'output', 'skill-jobs');
const outputDir = resolve(projectRoot, 'output', 'skill-renders');
const jobPath = resolve(jobsDir, `${jobId}.json`);
const metadataPath = resolve(jobsDir, `${jobId}.meta.json`);

const requestedOutput = arg('--output') ?? input.outputPath;
const outputPath = requestedOutput ? resolve(requestedOutput) : resolve(outputDir, `${jobId}.mp4`);
await mkdir(dirname(outputPath), {recursive: true});

const resultBase = {
  ok: true,
  dryRun: args.includes('--dry-run'),
  templateId: style.styleId,
  templateName: style.name,
  composition: style.composition,
  configPath,
  jobId,
  jobPath,
  metadataPath,
  outputPath,
  rulesPath: resolvedStyle.rulesPath,
  layoutPath: resolvedStyle.layoutPath,
  editUrl: `http://127.0.0.1:${Number(process.env.LL_VIDEO_MOTION_EDITOR_PORT || 4175)}/?job=${jobId}`,
};

if (args.includes('--dry-run')) {
  process.stdout.write(`${JSON.stringify({...resultBase, jobPath: null, metadataPath: null, props: renderProps}, null, 2)}\n`);
  process.exit(0);
}

await mkdir(jobsDir, {recursive: true});
await mkdir(outputDir, {recursive: true});
await writeFile(jobPath, `${JSON.stringify(renderProps, null, 2)}\n`, 'utf8');

const cliPath = resolve(projectRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
if (!existsSync(cliPath)) throw new Error(`Remotion 运行环境不存在：${cliPath}`);

const remotionArgs = [
  cliPath,
  'render',
  'src/index.ts',
  style.composition,
  outputPath,
  `--props=${jobPath}`,
  '--codec=h264',
  '--crf=18',
];

await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn(process.execPath, remotionArgs, {
    cwd: projectRoot,
    windowsHide: true,
    stdio: 'inherit',
  });
  child.on('error', rejectPromise);
  child.on('close', (code) => code === 0
    ? resolvePromise()
    : rejectPromise(new Error(`渲染失败，退出码 ${code}`)));
});

const runCapture = (command, commandArgs) => new Promise((resolvePromise) => {
  const child = spawn(command, commandArgs, {cwd: projectRoot, windowsHide: true});
  let stdout = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.on('error', () => resolvePromise(null));
  child.on('close', (code) => resolvePromise(code === 0 ? stdout : null));
});

let video = null;
const probe = await runCapture('ffprobe', [
  '-v', 'error',
  '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height,r_frame_rate,nb_frames',
  '-show_entries', 'format=duration',
  '-of', 'json',
  outputPath,
]);
if (probe) {
  try { video = JSON.parse(probe); } catch { video = null; }
}

const finalResult = {...resultBase, dryRun: false, fileName: basename(outputPath), video};
await writeFile(metadataPath, `${JSON.stringify({...finalResult, props: renderProps}, null, 2)}\n`, 'utf8');
const resultPath = arg('--result');
if (resultPath) {
  const absoluteResultPath = resolve(resultPath);
  await mkdir(dirname(absoluteResultPath), {recursive: true});
  await writeFile(absoluteResultPath, `${JSON.stringify(finalResult, null, 2)}\n`, 'utf8');
}
process.stdout.write(`\n${JSON.stringify(finalResult, null, 2)}\n`);
