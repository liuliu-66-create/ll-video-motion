import {existsSync} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {resolveProjectRoot} from './catalog.mjs';

const projectRoot = await resolveProjectRoot();
const outputDir = resolve(projectRoot, 'output', 'chapter-transition-digit-regression');
const contactSheet = resolve(outputDir, '00-99-contact-sheet.png');
const reportPath = resolve(outputDir, 'report.json');
const samples = Array.from({length: 100}, (_, index) => String(index).padStart(2, '0'));

await mkdir(outputDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: resolve(projectRoot, 'src', 'index.ts'),
  publicDir: resolve(projectRoot, 'public'),
  rootDir: projectRoot,
  onProgress: () => undefined,
});

const frames = [];
for (const sectionNumber of samples) {
  const inputProps = {sectionNumber, title: `章节 ${sectionNumber}`};
  const composition = await selectComposition({
    serveUrl,
    id: 'ChapterTransitionSplitNewspaper',
    inputProps,
    logLevel: 'error',
  });
  const output = resolve(outputDir, `${sectionNumber}.png`);
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    frame: 90,
    output,
    imageFormat: 'png',
    scale: 0.25,
    overwrite: true,
    logLevel: 'error',
  });
  if (!existsSync(output)) throw new Error(`章节数字 ${sectionNumber} 的检查帧没有生成。`);
  frames.push(output);
  process.stdout.write(`[${frames.length}/100] ${sectionNumber}\n`);
}

const ffmpegArgs = ['-v', 'error', '-y'];
for (const frame of frames) ffmpegArgs.push('-i', frame);

const filters = [];
const labels = [];
const layout = [];
for (let index = 0; index < frames.length; index += 1) {
  filters.push(`[${index}:v]scale=240:135[v${index}]`);
  labels.push(`[v${index}]`);
  layout.push(`${(index % 10) * 240}_${Math.floor(index / 10) * 135}`);
}
ffmpegArgs.push(
  '-filter_complex',
  `${filters.join(';')};${labels.join('')}xstack=inputs=100:layout=${layout.join('|')}[out]`,
  '-map',
  '[out]',
  '-frames:v',
  '1',
  contactSheet,
);

await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn('ffmpeg', ffmpegArgs, {cwd: projectRoot, windowsHide: true, stdio: 'inherit'});
  child.on('error', rejectPromise);
  child.on('close', (code) => code === 0
    ? resolvePromise()
    : rejectPromise(new Error(`数字联系表生成失败，退出码 ${code}`)));
});

const report = {
  ok: existsSync(contactSheet) && frames.length === 100,
  checked: frames.length,
  range: '00-99',
  contactSheet,
  outputDir,
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({...report, reportPath}, null, 2)}\n`);
if (!report.ok) process.exitCode = 1;
