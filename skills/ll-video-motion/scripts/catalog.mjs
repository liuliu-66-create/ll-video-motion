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
  'multi-point-list': 'presets/multi-point-03.json',
  'process-flow-zigzag': 'presets/process-flow-zigzag-03.json',
  'process-flow-journey': 'presets/process-flow-journey-03.json',
  'before-after-compare': 'presets/before-after-compare.json',
  'key-conclusion': 'presets/key-conclusion.json',
};

const makeStyle = (template, options = {}) => ({
  styleId: options.styleId ?? template.id,
  templateId: template.id,
  variantId: options.variantId ?? null,
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
    if (template.id === 'multi-point-list') {
      styles.push(makeStyle(template, {
        styleId: 'multi-point-torn-list',
        variantId: 'torn-list',
        name: '多点列举／撕纸列表',
        preset: 'presets/multi-point-03.json',
      }));
      const nested = [
        ['staggeredMemoVariant', 'multi-point-staggered-memo', '多点列举／错落便签'],
        ['stampLabelVariant', 'multi-point-stamp-label', '多点列举／印章标签'],
        ['indexTabsVariant', 'multi-point-index-tabs', '多点列举／索引标签'],
        ['burstStickersVariant', 'multi-point-burst-stickers', '多点列举／爆发贴纸'],
      ];
      for (const [property, styleId, name] of nested) {
        const variant = template[property];
        if (variant?.status !== 'validated') continue;
        styles.push(makeStyle(template, {
          styleId,
          variantId: variant.id,
          name,
          composition: variant.composition,
          preset: variant.preset,
          layout: variant.layout,
          preview: variant.preview,
        }));
      }
      continue;
    }

    if (template.id === 'concept-explainer') {
      styles.push(makeStyle(template, {
        styleId: 'concept-explainer-radial',
        variantId: 'radial',
        name: '概念解释／中心放射',
        composition: 'ConceptExplainerRadialGithub',
        preset: 'editor-prototype/radial-default-config.json',
        preview: template.variantPreviews?.radial,
      }));
      styles.push(makeStyle(template, {
        styleId: 'concept-explainer-topdown',
        variantId: 'topdown',
        name: '概念解释／上下拆解',
        composition: 'ConceptExplainerTopDownGithub',
        preset: 'editor-prototype/default-config.json',
        preview: template.variantPreviews?.topdown,
      }));
      continue;
    }

    if (template.id === 'key-conclusion') {
      styles.push(makeStyle(template, {
        styleId: 'key-conclusion',
        variantId: 'central-quote',
        name: '重点结论／中央结论',
        preset: 'presets/key-conclusion.json',
      }));
      for (const variant of template.variantPreviews ?? []) {
        if (variant.status !== 'validated') continue;
        styles.push(makeStyle(template, {
          styleId: `key-conclusion-${variant.id}`,
          variantId: variant.id,
          name: '重点结论／编辑拼贴',
          composition: variant.composition,
          preset: variant.preset,
          layout: variant.layout,
          preview: variant.preview,
        }));
      }
      continue;
    }

    if (template.id === 'dynamic-data-chart') {
      for (const variant of template.variantPreviews ?? []) {
        if (variant.status !== 'validated') continue;
        styles.push(makeStyle(template, {
          styleId: `dynamic-data-chart-${variant.id}`,
          variantId: variant.id,
          name: `动态数据图表／${variant.id}`,
          composition: template.composition,
          preset: variant.preset,
          preview: variant.preview,
        }));
      }
      continue;
    }

    styles.push(makeStyle(template));
  }

  return {projectRoot, library, styles};
};

export const findStyle = async (styleId, projectRoot) => {
  const catalog = await buildCatalog(projectRoot);
  const style = catalog.styles.find((item) => item.styleId === styleId);
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
    const style = catalog.styles.find((item) => item.styleId === requestedId);
    if (!style) throw new Error(`没有找到已验证模板：${requestedId}`);
    process.stdout.write(`${JSON.stringify(absoluteStyle(style, catalog.projectRoot), null, 2)}\n`);
    return;
  }

  if (args.includes('--check')) {
    const rootSource = await readFile(resolve(catalog.projectRoot, 'src', 'Root.tsx'), 'utf8');
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
    const duplicateStyleIds = catalog.styles
      .map((style) => style.styleId)
      .filter((styleId, index, all) => all.indexOf(styleId) !== index);
    const result = {
      ok: missing.length === 0 && invalidPresets.length === 0 && duplicateStyleIds.length === 0,
      projectRoot: catalog.projectRoot,
      validatedLibraryTemplates: catalog.library.templates.filter((item) => item.status === 'validated').length,
      callableStyles: catalog.styles.length,
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
