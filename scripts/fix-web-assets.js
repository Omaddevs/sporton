/**
 * `expo export` shriftlarni dist/assets/node_modules/... ichiga qo'yadi, lekin Vercel
 * `node_modules` nomli papkalarni saytga yuklamaydi — ikonkalar 404 bo'lib qoladi.
 * Papkani `vendor` deb qayta nomlaymiz va bundle ichidagi yo'llarni yangilaymiz.
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules');
const to = path.join(dist, 'assets', 'vendor');

if (!fs.existsSync(from)) {
  console.log('fix-web-assets: assets/node_modules topilmadi, o\'zgartirish shart emas');
  process.exit(0);
}

// rename o'rniga nusxalash: Windows'da antivirus papkani band qilib turishi mumkin
fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
fs.rmSync(from, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

let patched = 0;
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) walk(file);
    else if (/\.(js|html|css|json)$/.test(name)) {
      const src = fs.readFileSync(file, 'utf8');
      const out = src.split('assets/node_modules/').join('assets/vendor/');
      if (out !== src) {
        fs.writeFileSync(file, out);
        patched++;
      }
    }
  }
};
walk(dist);
console.log(`fix-web-assets: assets/node_modules → assets/vendor (${patched} ta fayl yangilandi)`);
