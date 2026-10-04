/**
 * Vendor the official Pretendard 1.3.9 Variable Dynamic Subset distribution.
 *
 * The source must be the official `pretendard@1.3.9` package. By default this
 * script reads `node_modules/pretendard`; PRETENDARD_SOURCE_DIR can be used
 * when the package is supplied from an approved local source directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const templateRoot = process.cwd();
const sourceRoot = path.resolve(
    process.env.PRETENDARD_SOURCE_DIR ?? path.join(templateRoot, 'node_modules', 'pretendard')
);
const outputRoot = path.join(templateRoot, 'dist', 'vendor', 'pretendard', '1.3.9');
const sourceCss = path.join(sourceRoot, 'dist', 'web', 'variable', 'pretendardvariable-dynamic-subset.css');
const sourceFonts = path.join(sourceRoot, 'dist', 'web', 'variable', 'woff2-dynamic-subset');
const sourceLicense = path.join(sourceRoot, 'dist', 'LICENSE.txt');
const outputCss = path.join(outputRoot, 'pretendard-variable.css');
const outputFonts = path.join(outputRoot, 'woff2-dynamic-subset');
const outputLicense = path.join(outputRoot, 'OFL.txt');

function fail(message) {
    console.error(`[vendor-pretendard] ${message}`);
    process.exit(1);
}

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        fail(`Could not read JSON: ${filePath} (${error.message})`);
    }
}

function assertOfficialPackage() {
    const manifest = readJson(path.join(sourceRoot, 'package.json'));

    if (manifest.name !== 'pretendard' || manifest.version !== '1.3.9') {
        fail(`Expected official pretendard@1.3.9, received ${manifest.name ?? '(unknown)'}@${manifest.version ?? '(unknown)'}`);
    }
}

function assertSourceFiles() {
    for (const filePath of [sourceCss, sourceLicense]) {
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            fail(`Required official source file is missing: ${filePath}`);
        }
    }

    if (!fs.statSync(sourceFonts, { throwIfNoEntry: false })?.isDirectory()) {
        fail(`Required official dynamic subset directory is missing: ${sourceFonts}`);
    }
}

function resolveLocalFontUrls(css) {
    const urls = [...css.matchAll(/url\((['"]?)([^'"\)]+)\1\)/g)].map((match) => match[2]);

    if (urls.length === 0) {
        fail('No font URLs were found in the official dynamic subset CSS.');
    }

    for (const url of urls) {
        if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
            fail(`External font URL is not allowed: ${url}`);
        }

        const resolved = path.resolve(path.dirname(outputCss), url);
        const relative = path.relative(outputRoot, resolved);

        if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
            fail(`Font URL escapes the local Pretendard vendor directory: ${url}`);
        }

        if (!fs.existsSync(resolved)) {
            fail(`Font URL target does not exist: ${url}`);
        }
    }

    return urls;
}

function countFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
        const child = path.join(directory, entry.name);
        return total + (entry.isDirectory() ? countFiles(child) : 1);
    }, 0);
}

function directoryBytes(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
        const child = path.join(directory, entry.name);
        return total + (entry.isDirectory() ? directoryBytes(child) : fs.statSync(child).size);
    }, 0);
}

assertOfficialPackage();
assertSourceFiles();

const css = fs.readFileSync(sourceCss, 'utf8');
const fontFaceCount = (css.match(/@font-face\s*\{/g) ?? []).length;
const unicodeRangeCount = (css.match(/unicode-range\s*:/g) ?? []).length;

if (fontFaceCount !== unicodeRangeCount || fontFaceCount === 0) {
    fail(`Unexpected official CSS structure: @font-face=${fontFaceCount}, unicode-range=${unicodeRangeCount}`);
}

fs.mkdirSync(outputRoot, { recursive: true });
fs.rmSync(outputFonts, { recursive: true, force: true });
fs.cpSync(sourceFonts, outputFonts, { recursive: true, errorOnExist: false });
fs.copyFileSync(sourceCss, outputCss);
fs.copyFileSync(sourceLicense, outputLicense);

const urls = resolveLocalFontUrls(css);
const referencedFiles = new Set(urls.map((url) => path.resolve(path.dirname(outputCss), url)));
const subsetFiles = fs
    .readdirSync(outputFonts)
    .filter((file) => file.endsWith('.woff2'))
    .map((file) => path.join(outputFonts, file));

if (subsetFiles.length !== fontFaceCount || subsetFiles.some((file) => !referencedFiles.has(file))) {
    fail(`Subset CSS/font mismatch: @font-face=${fontFaceCount}, WOFF2=${subsetFiles.length}`);
}

// Remove the old monolithic file only after every generated CSS URL resolves.
fs.rmSync(path.join(outputRoot, 'woff2', 'PretendardVariable.woff2'), { force: true });
fs.rmSync(path.join(outputRoot, 'woff2'), { recursive: true, force: true });

console.log(`[vendor-pretendard] source: official pretendard@1.3.9 (${sourceRoot})`);
console.log(`[vendor-pretendard] CSS: ${fontFaceCount} @font-face / ${unicodeRangeCount} unicode-range`);
console.log(`[vendor-pretendard] WOFF2: ${subsetFiles.length} files / ${directoryBytes(outputFonts)} bytes`);
console.log(`[vendor-pretendard] output: ${countFiles(outputRoot)} files / ${directoryBytes(outputRoot)} bytes`);
