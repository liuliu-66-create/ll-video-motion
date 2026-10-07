import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {buildCatalog, resolveProjectRoot} from './catalog.mjs';

const projectRoot = await resolveProjectRoot();
const {styles} = await buildCatalog(projectRoot);
const outputDir = resolve(projectRoot, 'output', 'skill-all-template-check');
await mkdir(outputDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint: resolve(projectRoot, 'src', 'index.ts'),
  publicDir: resolve(projectRoot, 'public'),
  rootDir: projectRoot,
  onProgress: () => undefined,
});

const results = [];
for (const [index, style] of styles.entries()) {
  const presetPath = resolve(projectRoot, style.preset);
  const inputProps = JSON.parse(await readFile(presetPath, 'utf8'));
  delete inputProps.templateId;
  const output = resolve(outputDir, `${style.styleId}.png`);
  process.stdout.write(`[${index + 1}/${styles.length}] ${style.styleId}\n`);
  try {
    const composition = await selectComposition({
      serveUrl,
      id: style.composition,
      inputProps,
      logLevel: 'error',
    });
    const frame = Math.min(composition.durationInFrames - 1, Math.floor(composition.durationInFrames * 0.8));
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      output,
      frame,
      imageFormat: 'png',
      overwrite: true,
      logLevel: 'error',
    });
    results.push({styleId: style.styleId, ok: existsSync(output), output});
  } catch (error) {
    results.push({
      styleId: style.styleId,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const report = {
  ok: results.every((item) => item.ok),
  checked: results.length,
  passed: results.filter((item) => item.ok).length,
  failed: results.filter((item) => !item.ok),
  outputDir,
};
await writeFile(resolve(outputDir, 'report.json'), `${JSON.stringify({...report, results}, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.ok) process.exitCode = 1;
