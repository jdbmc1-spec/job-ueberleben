// Profilbild-Varianten „Überlebst du deinen Job?“ (1080x1080), gleicher Stil wie die Folgen.
// Aufruf (aus dem Repo-Ordner): node kanal/profilbild.mjs
//   → danach in kanal/projekt: npx --yes hyperframes@0.8.223 snapshot --at 0.5,1.5,2.5 --no-end -o <ordner>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const LIB = path.join(HIER, '..', 'skill', 'lib');
const { figurSVG } = await import(pathToFileURL(path.join(LIB, 'figur.mjs')).href);
const { sunburst, spirale } = await import(pathToFileURL(path.join(LIB, 'hintergrund.mjs')).href);
const serie = JSON.parse(fs.readFileSync(path.join(HIER, '..', 'serie', 'serie.json'), 'utf8'));
const azubi = serie.figur;

// Figur so groß, dass der Kopf das Bild füllt (Kopf ~ y 110–410 im viewBox der Figur)
const kopf = (opts, ausdruck, pose, breite, oben, x = 540) =>
  `<div class="fig" style="width:${breite}px;left:${x - breite / 2}px;top:${oben - (110 * breite) / 600}px">${figurSVG(opts, ausdruck, pose, `f${Math.round(breite)}${x}${oben}`)}</div>`;
const ring = (farbe) => `<div class="ring" style="border-color:${farbe}"></div>`;
const tropfen = (pos) => pos.map(([x, y, s, r]) => `<div class="tropfen" style="left:${x}px;top:${y}px;width:${s}px;height:${s * 1.35}px;transform:rotate(${r}deg)"></div>`).join('');
const countdown = (x, y, d, ziffer) => `<div class="uhr" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="102" fill="#2a2140" stroke="#fff" stroke-width="10"/><circle cx="110" cy="110" r="84" fill="none" stroke="#ef4444" stroke-width="22" stroke-linecap="round" stroke-dasharray="528" stroke-dashoffset="352" transform="rotate(-90 110 110)"/></svg><b style="font-size:${d * 0.55}px">${ziffer}</b></div>`;

// 1) Panik-Gesicht (Hände am Kopf) + Countdown „3“ + Banner „JOB?“
const v1 = `${spirale('orange')}${kopf(azubi, 'panik', 'kopf', 1250, 150)}${tropfen([[150, 300, 60, -20], [880, 330, 54, 20]])}
${countdown(690, 150, 210, '3')}<div class="banner-band"><span class="b-gross">JOB?</span></div>${ring('#ffd43b')}`;

// 2) Gesicht + Schriftzug „ÜBERLEBST DU DEINEN JOB?“ oben
const v2 = `${sunburst('lila')}${kopf(azubi, 'schock', 'stehen', 1250, 110)}
<div class="banner-band zwei"><span class="w">ÜBERLEBST DU</span><span class="g">DEINEN JOB?</span></div>${ring('#ffffff')}`;

// 3) A / B mit grünem Haken und rotem X über dem Gesicht
const v3 = `${sunburst('blau')}${kopf(azubi, 'panik', 'kopf', 1200, 200)}
<div class="badge a" style="left:190px">A<i class="x">✗</i></div><div class="badge b" style="right:190px">B<i class="ok">✓</i></div>${ring('#22c55e')}`;

const css = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1080px;overflow:hidden;background:#1d1238}
#root{position:relative;width:1080px;height:1080px;overflow:hidden}
.clip{position:absolute;inset:0;width:1080px;height:1080px;overflow:hidden}
.bg-sun{position:absolute;inset:0}
.fig{position:absolute}.fig svg{width:100%;height:auto;display:block;overflow:visible}
.ring{position:absolute;left:16px;top:16px;width:1048px;height:1048px;border-radius:50%;border:30px solid}
.tropfen{position:absolute;background:#7cc8ff;border:7px solid #2a1f3d;border-radius:50% 50% 50% 50%/60% 60% 40% 40%}
.uhr{position:absolute;filter:drop-shadow(0 10px 0 rgba(0,0,0,.3))}.uhr svg{position:absolute;inset:0;width:100%;height:100%}
.uhr b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Archivo Black",sans-serif;color:#fff;-webkit-text-stroke:14px #2a1f3d;paint-order:stroke fill}
.banner-band{position:absolute;left:250px;right:250px;top:760px;height:190px;background:#ef4444;border:12px solid #fff;outline:10px solid #2a1f3d;border-radius:40px;transform:rotate(-4deg);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 0 rgba(0,0,0,.35)}
.banner-band.zwei{left:200px;right:200px;top:700px;height:220px;background:#7c4dff;flex-direction:column;font-family:"Archivo Black",sans-serif;line-height:1.02;-webkit-text-stroke:12px #2a1f3d;paint-order:stroke fill}.banner-band.zwei .w{font-size:62px;color:#fff}.banner-band.zwei .g{font-size:84px;color:#ffd43b}
.b-gross{font-family:"Archivo Black",sans-serif;font-size:140px;color:#ffd43b;line-height:1;-webkit-text-stroke:18px #2a1f3d;paint-order:stroke fill}
.titel-oben{position:absolute;left:0;right:0;top:110px;display:flex;flex-direction:column;align-items:center;font-family:"Archivo Black",sans-serif;line-height:1.02;-webkit-text-stroke:16px #2a1f3d;paint-order:stroke fill;transform:rotate(-4deg);filter:drop-shadow(0 8px 0 rgba(0,0,0,.3))}
.titel-oben .w{font-size:78px;color:#fff}.titel-oben .g{font-size:104px;color:#ffd43b}
.badge{position:absolute;bottom:170px;width:220px;height:220px;border-radius:50%;border:14px solid #fff;outline:10px solid #2a1f3d;color:#fff;font-family:"Archivo Black",sans-serif;font-size:130px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 0 rgba(0,0,0,.3)}
.badge.a{background:#3b82f6;opacity:.85}.badge.b{background:#22c55e}
.badge i{position:absolute;right:-30px;top:-40px;font-style:normal;font-size:120px;-webkit-text-stroke:12px #2a1f3d;paint-order:stroke fill}
.badge i.x{color:#ef4444}.badge i.ok{color:#fff}`;

const html = `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1080"><title>Profilbild Job überleben</title><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="3" data-width="1080" data-height="1080" data-no-timeline>
<div id="v1" class="clip" data-start="0" data-duration="1">${v1}</div>
<div id="v2" class="clip" data-start="1" data-duration="1">${v2}</div>
<div id="v3" class="clip" data-start="2" data-duration="1">${v3}</div>
</div></body></html>`;
const projekt = path.join(HIER, 'projekt');
fs.mkdirSync(projekt, { recursive: true });
fs.writeFileSync(path.join(projekt, 'index.html'), html);
fs.writeFileSync(path.join(projekt, 'hyperframes.json'), JSON.stringify({ paths: { assets: 'assets' } }));
console.log('✔', projekt);
