import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
const skillDir = resolve(scriptDir, '..');

const args = process.argv.slice(2);
const arg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const isProjectRoot = (candidate) =>
  existsSync(resolve(candidate, 'library.json')) &&
  existsSync(resolve(candidate, 'src', 'index.ts')) &&
  existsSync(resolve(candidate, 'package.json'));

const ancestors = (start) => {
  const result = [];
  let current = resolve(start);
  while (true) {
    result.push(current);
    const parent = dirname(current);
    if (parent === current) return result;
    current = parent;
  }
};

export const resolveProjectRoot = async () => {
  const candidates = [];
  if (process.env.LL_VIDEO_MOTION_PROJECT) candidates.push(process.env.LL_VIDEO_MOTION_PROJECT);
  if (process.env.LL_MOTION_PROJECT_DIR) candidates.push(process.env.LL_MOTION_PROJECT_DIR);

  const runtimePath = resolve(skillDir, 'runtime.local.json');
  if (existsSync(runtimePath)) {
    const runtimeText = (await readFile(runtimePath, 'utf8')).replace(/^\uFEFF/, '');
    const runtime = JSON.parse(runtimeText);
    if (runtime.projectRoot) candidates.push(runtime.projectRoot);
  }

  candidates.push(resolve(scriptDir, '..', '..', '..'));
  candidates.push(...ancestors(process.cwd()));

  for (const candidate of candidates) {
    const absolute = resolve(candidate);
    if (isProjectRoot(absolute)) return absolute;
  }
  throw new Error('找不到 video-motion-generator 项目。请从仓库安装 Skill，或设置 LL_VIDEO_MOTION_PROJECT。');
};

const primaryPresetOverrides = {
  'process-flow-zigzag': 'presets/process-flow-zigzag-03.json',
  'process-flow-journey': 'presets/process-flow-journey-03.json',
  'before-after-compare': 'presets/before-after-compare.json',
  'concept-explainer': 'editor-prototype/radial-default-config.json',
  'concept-topdown': 'editor-prototype/default-config.json',
  'key-conclusion': 'presets/key-conclusion.json',
};

const legacyStyleIds = {
  'multi-point-torn-list': 'multi-point-list',
  'multi-point-staggered-memo': 'multi-staggered',
  'multi-point-stamp-label': 'multi-stamp',
  'multi-point-index-tabs': 'multi-index',
  'multi-point-burst-stickers': 'multi-burst',
  'concept-explainer-radial': 'concept-explainer',
  'concept-explainer-topdown': 'concept-topdown',
  'key-conclusion-editorial-collage': 'key-editorial',
  'dynamic-data-chart-category-bars': 'dynamic-data-chart',
  'dynamic-data-chart-time-line': 'data-chart-time-line',
  'dynamic-data-chart-qualitative-rise': 'data-chart-qualitative-rise',
  'dynamic-data-chart-step-growth': 'data-chart-step-growth',
};
const canonicalStyleId = (styleId) => legacyStyleIds[styleId] ?? styleId;

const makeStyle = (template, options = {}) => ({
  styleId: options.styleId ?? template.id,
  templateId: template.id,
  variantId: options.variantId ?? template.variant ?? null,
  name: options.name ?? template.name,
  status: 'validated',
  family: template.family ?? template.id,
  layoutPattern: template.layoutPattern ?? null,
  composition: options.composition ?? template.composition,
  preset: options.preset ?? template.preset ?? primaryPresetOverrides[template.id] ?? null,
  rules: options.rules ?? template.templateRules ?? template.rules ?? null,
  layout: options.layout ?? template.layout ?? null,
  preview: options.preview ?? template.preview ?? null,
  semanticTypes: template.semanticTypes ?? [],
  avoidFor: template.avoidFor ?? [],
  editable: template.supports?.editable ?? [],
  itemCount: template.supports?.itemCount ?? [],
});

export const buildCatalog = async (requestedProjectRoot) => {
  const projectRoot = requestedProjectRoot ?? await resolveProjectRoot();
  const library = JSON.parse(await readFile(resolve(projectRoot, 'library.json'), 'utf8'));
  const styles = [];

  for (const template of library.templates.filter((item) => item.status === 'validated')) {
    styles.push(makeStyle(template));
  }

  return {projectRoot, library, styles};
};

export const findStyle = async (styleId, projectRoot) => {
  const catalog = await buildCatalog(projectRoot);
  const style = catalog.styles.find((item) => item.styleId === canonicalStyleId(styleId));
  if (!style) throw new Error(`没有找到已验证模板：${styleId}`);
  return {catalog, style};
};

export const absoluteStyle = (style, projectRoot) => ({
  ...style,
  presetPath: style.preset ? resolve(projectRoot, style.preset) : null,
  rulesPath: style.rules ? resolve(projectRoot, style.rules) : null,
  layoutPath: style.layout ? resolve(projectRoot, style.layout) : null,
  previewPath: style.preview ? resolve(projectRoot, style.preview) : null,
});

const runCli = async () => {
  const catalog = await buildCatalog();
  const requestedId = arg('--id');
  if (requestedId) {
    const style = catalog.styles.find((item) => item.styleId === canonicalStyleId(requestedId));
    if (!style) throw new Error(`没有找到已验证模板：${requestedId}`);
    process.stdout.write(`${JSON.stringify(absoluteStyle(style, catalog.projectRoot), null, 2)}\n`);
    return;
  }

  if (args.includes('--check')) {
    const rootSource = await readFile(resolve(catalog.projectRoot, 'src', 'Root.tsx'), 'utf8');
    const playgroundSource = await readFile(resolve(catalog.projectRoot, 'playground', 'index.html'), 'utf8');
    const displayRows = [...playgroundSource.matchAll(/\{id:"([^"]+)", category:"([^"]+)"[^\n]*?code:"([^"]+)"[^\n]*?src:"([^"]+)"[^\n]*?poster:"([^"]+)"([^\n]*)/g)]
      .map(([, styleId, category, code, sample, poster, rest]) => ({
        templateId: category === 'progress' || code.startsWith('chapter-transition /') ? styleId : code.split(' / ')[0],
        category,
        sample,
        poster,
        download: rest.match(/download:"([^"]+)"/)?.[1],
      })).filter(row => row.category !== 'progress');
    const catalogIds = new Set(catalog.styles.map((style) => style.templateId));
    const displayIds = displayRows.map((row) => row.templateId);
    const unregisteredDisplayItems = displayIds.filter((id) => !catalogIds.has(id));
    const undisplayedTemplates = [...catalogIds].filter((id) => !displayIds.includes(id));
    const duplicateDisplayTemplates = displayIds.filter((id, index) => displayIds.indexOf(id) !== index);
    const missing = [];
    const invalidPresets = [];
    for (const style of catalog.styles) {
      if (!style.composition || !rootSource.includes(`id="${style.composition}"`)) missing.push(`${style.styleId}:composition`);
      for (const [field, relativePath] of [['preset', style.preset], ['rules', style.rules], ['layout', style.layout]]) {
        if (!relativePath || !existsSync(resolve(catalog.projectRoot, relativePath))) missing.push(`${style.styleId}:${field}`);
      }
      if (style.preset && existsSync(resolve(catalog.projectRoot, style.preset))) {
        try {
          const preset = JSON.parse(await readFile(resolve(catalog.projectRoot, style.preset), 'utf8'));
          if (!preset || typeof preset !== 'object' || Array.isArray(preset)) invalidPresets.push(style.styleId);
        } catch {
          invalidPresets.push(style.styleId);
        }
      }
    }
    for (const row of displayRows) {
      for (const relativePath of [row.sample, row.poster, row.download].filter(Boolean)) {
        if (!existsSync(resolve(catalog.projectRoot, 'playground', relativePath))) missing.push(`playground:${relativePath}`);
      }
      if (row.category === 'progress' && !row.download) missing.push(`playground:${row.templateId}:transparent-download`);
    }
    const duplicateStyleIds = catalog.styles
      .map((style) => style.styleId)
      .filter((styleId, index, all) => all.indexOf(styleId) !== index);
    const result = {
      ok: missing.length === 0 && invalidPresets.length === 0 && duplicateStyleIds.length === 0 && displayRows.length === catalog.styles.length && unregisteredDisplayItems.length === 0 && undisplayedTemplates.length === 0 && duplicateDisplayTemplates.length === 0,
      projectRoot: catalog.projectRoot,
      validatedLibraryTemplates: catalog.library.templates.filter((item) => item.status === 'validated').length,
      callableStyles: catalog.styles.length,
      displayItems: displayRows.length,
      unregisteredDisplayItems,
      undisplayedTemplates,
      duplicateDisplayTemplates,
      missing,
      invalidPresets,
      duplicateStyleIds,
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (args.includes('--json')) {
    process.stdout.write(`${JSON.stringify(catalog.styles.map((style) => absoluteStyle(style, catalog.projectRoot)), null, 2)}\n`);
    return;
  }

  const lines = catalog.styles.map((style) => `${style.styleId}\t${style.name}\t${style.family}\t${style.composition}`);
  process.stdout.write(`styleId\tname\tfamily\tcomposition\n${lines.join('\n')}\n`);
};

if (resolve(process.argv[1] ?? '') === scriptPath) {
  runCli().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
