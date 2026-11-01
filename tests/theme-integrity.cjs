const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'skin.json'), 'utf8'));
const failures = [];
function checkRef(owner, ref) {
    if (/^(?:https?:|data:|#|\/|var\()/i.test(ref)) return;
    const target = path.resolve(path.dirname(owner), ref.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) failures.push(`${path.relative(root, owner)} -> ${ref}`);
}
function scan(dir) {
    for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
        const file = path.join(dir, item.name);
        if (item.isDirectory()) { scan(file); continue; }
        if (!/\.(?:css|js)$/.test(file)) continue;
        const source = fs.readFileSync(file, 'utf8');
        if (file.endsWith('.css')) {
            const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
            for (const m of css.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) checkRef(file, m[1]);
        } else {
            for (const m of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) checkRef(file, m[1]);
        }
    }
}
function checkManifest(value) {
    if (Array.isArray(value)) return value.forEach(checkManifest);
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
        if (['TargetCss','TargetJs','src','RootColors','Steam-WebKit'].includes(key) && typeof item === 'string') checkRef(path.join(root,'skin.json'), item);
        checkManifest(item);
    }
}
scan(path.join(root,'src')); scan(path.join(root,'options')); checkManifest(manifest);
assert.deepEqual(failures, [], 'every configured local asset must exist');
const remoteHelpers = url => manifest.Patches.filter(p => p.TargetJs && new RegExp(p.MatchRegexString).test(url)).map(p => p.TargetJs);
assert.deepEqual(remoteHelpers('https://store.steampowered.com/'), []);
assert.deepEqual(remoteHelpers('https://store.steampowered.com/app/123/'), []);
assert.deepEqual(remoteHelpers('https://steamcommunity.com/'), []);
assert.deepEqual(remoteHelpers('https://steamcommunity.com/profiles/example/'), []);
assert.deepEqual(remoteHelpers('https://store.steampowered.com/search/?term=test'), ['src/js/webkit.js']);
assert.deepEqual(remoteHelpers('https://steamcommunity.com/profiles/example/friendsthatplay/123'), ['src/js/webkit.js']);
const overlay = manifest.Conditions['Game Overlay'].values.yes.TargetJs;
assert.ok(!overlay.affects.some(pattern => new RegExp(pattern).test('https://store.steampowered.com/')));
assert.ok(overlay.affects.some(pattern => new RegExp(pattern).test('GameNotes_uid1234')));
assert.equal(manifest.Conditions['Info sidebar on right'].values.yes.TargetCss.src,'options/store/gamepage/infoSidebarLeft.css');
console.log('PASS: local asset graph, patch targets, native/web script scoping, overlay scope, and Store-sidebar option wiring.');
