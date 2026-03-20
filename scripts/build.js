#!/usr/bin/env node

/**
 * Build script for CineBCN
 * 
 * Pipeline:
 *   1. Clean /dist
 *   2. For each .js in src/js/:
 *      a) Minify with Terser → dist/js/<name>.min.js
 *      b) Obfuscate with javascript-obfuscator → dist/js/<name>.js
 *      c) Delete intermediate .min.js
 *   3. For each .html in src/:
 *      a) Copy to dist/ (preserving folder structure)
 *      b) Update <script src="js/..."> references (already point to js/<name>.js)
 *      c) Minify HTML (remove comments, collapse whitespace)
 *   4. Copy static assets (css/, data/, images/, partials/) to dist/
 *   5. Copy root-level non-source files (CNAME, LICENSE, etc.)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// ─── Helpers ──────────────────────────────────────────────
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    ensureDir(dir);
}

function copyRecursive(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function findFiles(dir, ext) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...findFiles(fullPath, ext));
        } else if (entry.name.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

// ─── Step 1: Clean dist ──────────────────────────────────
console.log('🧹 Cleaning dist/...');
cleanDir(DIST);

// ─── Step 2: Process JS files ────────────────────────────
console.log('\n📦 Processing JavaScript files...');
const jsDir = path.join(SRC, 'js');
const distJs = path.join(DIST, 'js');
ensureDir(distJs);

const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

for (const jsFile of jsFiles) {
    const srcFile = path.join(jsDir, jsFile);
    const baseName = jsFile.replace('.js', '');
    const minFile = path.join(distJs, `${baseName}.min.js`);
    const outFile = path.join(distJs, `${baseName}.js`);

    // Step A: Minify with Terser
    console.log(`  ⚡ Terser: ${jsFile} → ${baseName}.min.js`);
    execSync(
        `npx terser "${srcFile}" -o "${minFile}" --compress --mangle`,
        { cwd: ROOT, stdio: 'pipe' }
    );

    // Step B: Obfuscate with javascript-obfuscator
    console.log(`  🔒 Obfuscate: ${baseName}.min.js → ${baseName}.js`);
    execSync(
        `npx javascript-obfuscator "${minFile}" ` +
        `--output "${outFile}" ` +
        `--string-array-encoding rc4 ` +
        `--split-strings true ` +
        `--split-strings-chunk-length 5 ` +
        `--dead-code-injection true ` +
        `--dead-code-injection-threshold 0.4 ` +
        `--self-defending true ` +
        `--control-flow-flattening true ` +
        `--control-flow-flattening-threshold 0.5 ` +
        `--identifier-names-generator hexadecimal ` +
        `--rename-globals false ` +
        `--source-map false`,
        { cwd: ROOT, stdio: 'pipe' }
    );

    // Step C: Remove intermediate .min.js
    fs.unlinkSync(minFile);
    console.log(`  ✅ ${jsFile} done`);
}

// ─── Step 3: Process HTML files ──────────────────────────
console.log('\n📄 Processing HTML files...');
const htmlFiles = findFiles(SRC, '.html');

// Load html-minifier-terser
let minifyHtml;
try {
    minifyHtml = require('html-minifier-terser').minify;
} catch {
    minifyHtml = null;
    console.log('  ⚠️  html-minifier-terser not found, using basic minification');
}

for (const htmlFile of htmlFiles) {
    const relPath = path.relative(SRC, htmlFile);
    const destFile = path.join(DIST, relPath);
    ensureDir(path.dirname(destFile));

    let content = fs.readFileSync(htmlFile, 'utf-8');

    // The script references already use js/<name>.js which is the same
    // naming in dist/js/, so no path rewriting needed — the structure mirrors src.
    // However, CSS references (css/*.css) also stay the same.

    // Minify HTML
    if (minifyHtml) {
        try {
            content = await_minify(content);
        } catch (err) {
            console.log(`  ⚠️  HTML minification failed for ${relPath}, copying as-is`);
        }
    } else {
        // Basic minification: remove HTML comments (not conditional ones), collapse whitespace
        content = content
            .replace(/<!--(?!\[)[\s\S]*?-->/g, '') // remove comments
            .replace(/^\s+$/gm, '')                 // remove blank lines
            .replace(/\n\s*\n/g, '\n');             // collapse multiple newlines
    }

    fs.writeFileSync(destFile, content, 'utf-8');
    console.log(`  ✅ ${relPath}`);
}

// html-minifier-terser returns a promise, handle sync wrapper
function await_minify(html) {
    // html-minifier-terser v7+ is async, so we use execSync to call it
    const tmpIn = path.join(DIST, '_tmp_in.html');
    const tmpOut = path.join(DIST, '_tmp_out.html');
    fs.writeFileSync(tmpIn, html, 'utf-8');
    try {
        execSync(
            `npx html-minifier-terser "${tmpIn}" -o "${tmpOut}" ` +
            `--collapse-whitespace ` +
            `--remove-comments ` +
            `--minify-css true ` +
            `--minify-js true`,
            { cwd: ROOT, stdio: 'pipe' }
        );
        const result = fs.readFileSync(tmpOut, 'utf-8');
        return result;
    } finally {
        if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    }
}

// ─── Step 4: Copy static assets ──────────────────────────
console.log('\n📁 Copying static assets...');

const assetDirs = ['css', 'data', 'images'];
for (const dir of assetDirs) {
    const srcDir = path.join(SRC, dir);
    const destDir = path.join(DIST, dir);
    if (fs.existsSync(srcDir)) {
        copyRecursive(srcDir, destDir);
        const count = findFiles(destDir, '').length;
        console.log(`  ✅ ${dir}/ (${count} files)`);
    }
}

// ─── Step 5: Copy root-level files ──────────────────────
console.log('\n📋 Copying root-level files...');
const rootFiles = ['CNAME'];
for (const file of rootFiles) {
    const srcFile = path.join(ROOT, file);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(DIST, file));
        console.log(`  ✅ ${file}`);
    }
}

// ─── Done ────────────────────────────────────────────────
console.log('\n🎉 Build completed successfully!');
console.log(`   Output directory: ${DIST}`);

// Print summary
const distJsFiles = fs.readdirSync(distJs).filter(f => f.endsWith('.js'));
console.log(`\n   JS files:   ${distJsFiles.length}`);
const distHtmlFiles = findFiles(DIST, '.html');
console.log(`   HTML files: ${distHtmlFiles.length}`);
const distCssFiles = findFiles(path.join(DIST, 'css'), '.css');
console.log(`   CSS files:  ${distCssFiles.length}`);
