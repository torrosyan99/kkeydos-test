import fs from 'node:fs';
import path from 'node:path';

const htmlFiles = ['app/index.html', 'app/ai-page/ai.html'];
const cssFiles = [
    'app/assets/styles/main.css',
    'app/assets/styles/fonts.css',
    'app/ai-page/assets/styles/ai.css',
];
const scriptFiles = [
    'app/assets/scripts/main.js',
    'app/assets/scripts/components/card-selector.js',
    'app/assets/scripts/homepage.js',
    'app/assets/scripts/technology.js',
    'app/assets/scripts/technology-ai-sections.js',
    'app/ai-page/assets/scripts/ai.js',
];
const allowedAria = new Set([
    'aria-controls',
    'aria-current',
    'aria-expanded',
    'aria-hidden',
    'aria-label',
]);
const errors = [];
const referencedFiles = new Set();

const resolveLocalPath = (owner, reference) => {
    const clean = reference
        .split('#')[0]
        .split('?')[0]
        .replace(/^['"]|['"]$/g, '');

    if (!clean || /^(?:[a-z]+:|\/\/|#|data:)/i.test(clean)) return null;

    return path.resolve(path.dirname(owner), decodeURIComponent(clean));
};

for (const file of htmlFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(
        (match) => match[1],
    );
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    for (const id of new Set(duplicateIds)) {
        errors.push(`${file}: duplicate id="${id}"`);
    }

    for (const tag of source.matchAll(/<([a-z][\w-]*)\b[^>]*>/gis)) {
        const tagName = tag[1].toLowerCase();

        for (const attribute of tag[0].matchAll(/\b(aria-[a-z-]+)=/gi)) {
            const name = attribute[1].toLowerCase();

            if (!allowedAria.has(name)) {
                errors.push(`${file}: unsupported ${name}`);
            }

            if (name === 'aria-hidden' && tagName !== 'svg') {
                errors.push(
                    `${file}: aria-hidden is reserved for decorative SVG icons`,
                );
            }
        }
    }

    for (const match of source.matchAll(
        /\b(?:aria-controls|aria-labelledby|for)=["']([^"']+)["']/g,
    )) {
        for (const id of match[1].split(/\s+/)) {
            if (!ids.includes(id)) {
                errors.push(`${file}: missing related id="${id}"`);
            }
        }
    }

    for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
        const target = resolveLocalPath(file, match[1]);
        if (!target) continue;

        referencedFiles.add(target);
        if (!fs.existsSync(target)) {
            errors.push(`${file}: missing ${path.relative('.', target)}`);
        }
    }
}

for (const file of scriptFiles) {
    const source = fs.readFileSync(file, 'utf8');

    for (const match of source.matchAll(/aria-[a-z-]+/gi)) {
        const name = match[0].toLowerCase();

        if (!allowedAria.has(name)) {
            errors.push(`${file}: unsupported ${name}`);
        }
    }

    if (/aria-hidden/i.test(source)) {
        errors.push(`${file}: aria-hidden must not be managed by JavaScript`);
    }
}

for (const file of cssFiles) {
    const source = fs.readFileSync(file, 'utf8');

    for (const match of source.matchAll(/url\(([^)]+)\)/g)) {
        const target = resolveLocalPath(file, match[1]);
        if (!target) continue;

        referencedFiles.add(target);
        if (!fs.existsSync(target)) {
            errors.push(`${file}: missing ${path.relative('.', target)}`);
        }
    }
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
} else {
    console.log(
        `Validated ${htmlFiles.length} pages, ${cssFiles.length} stylesheets, and ${referencedFiles.size} local references.`,
    );
}
