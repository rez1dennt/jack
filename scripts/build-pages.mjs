import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.svg', '.txt', '.webmanifest', '.xml']);

function normalizeBasePath(basePath = '') {
  const clean = String(basePath).trim().replace(/^\/+|\/+$/g, '');
  return clean ? `/${clean}` : '';
}

export function rewriteForPages(source, { basePath = '', siteUrl = '' } = {}) {
  const normalizedBase = normalizeBasePath(basePath);
  let output = String(source);

  if (siteUrl) {
    output = output.replaceAll('https://[[DOMAIN]]', String(siteUrl).replace(/\/+$/g, ''));
  }

  if (normalizedBase) {
    output = output.replace(/(["'(])\/(?!\/)/g, `$1${normalizedBase}/`);
  }

  return output.replace(/<html\s+lang="ru"(?![^>]*data-static-preview)/, '<html lang="ru" data-static-preview="true"');
}

function shouldSkip(relativePath) {
  const segments = relativePath.split(sep);
  const fileName = segments.at(-1)?.toLowerCase() ?? '';
  return segments[0]?.toLowerCase() === 'api' || fileName === '.htaccess' || extname(fileName) === '.php';
}

async function copyEntry(sourceDir, outputDir, relativePath, options) {
  if (shouldSkip(relativePath)) return;

  const sourcePath = join(sourceDir, relativePath);
  const outputPath = join(outputDir, relativePath);
  const entries = await readdir(sourcePath, { withFileTypes: true }).catch(() => null);

  if (entries) {
    await mkdir(outputPath, { recursive: true });
    for (const entry of entries) {
      await copyEntry(sourceDir, outputDir, join(relativePath, entry.name), options);
    }
    return;
  }

  await mkdir(resolve(outputPath, '..'), { recursive: true });
  if (!TEXT_EXTENSIONS.has(extname(sourcePath).toLowerCase())) {
    await copyFile(sourcePath, outputPath);
    return;
  }

  const source = await readFile(sourcePath, 'utf8');
  await writeFile(outputPath, rewriteForPages(source, options));
}

export async function buildPages({ sourceDir, outputDir, basePath = '', siteUrl = '' }) {
  if (!sourceDir || !outputDir) throw new TypeError('sourceDir and outputDir are required');

  const absoluteSource = resolve(sourceDir);
  const absoluteOutput = resolve(outputDir);
  await rm(absoluteOutput, { recursive: true, force: true });
  await mkdir(absoluteOutput, { recursive: true });

  const entries = await readdir(absoluteSource, { withFileTypes: true });
  for (const entry of entries) {
    await copyEntry(absoluteSource, absoluteOutput, entry.name, { basePath, siteUrl });
  }
}

function readArgument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

const isCommandLine = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCommandLine) {
  const repository = readArgument('--repository', process.env.GITHUB_REPOSITORY?.split('/').at(-1) ?? 'jack');
  const owner = readArgument('--owner', process.env.GITHUB_REPOSITORY_OWNER ?? 'rez1dennt');
  const basePath = readArgument('--base-path', `/${repository}`);
  const siteUrl = readArgument('--site-url', `https://${owner}.github.io${normalizeBasePath(basePath)}`);

  await buildPages({
    sourceDir: readArgument('--source', 'public'),
    outputDir: readArgument('--output', '.pages-dist'),
    basePath,
    siteUrl
  });
}
