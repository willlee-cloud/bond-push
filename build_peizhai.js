const fs = require('fs');
const path = require('path');

const BOARD = process.env.BOARD_PATH ? path.resolve(__dirname, process.env.BOARD_PATH) : 'D:/WeGameApps/common_apps/可转债潜伏配债汇总看板.html';
const TPL = process.env.TPL_PATH ? path.resolve(__dirname, process.env.TPL_PATH) : 'C:/Users/戴尔/.workbuddy/skills/可转债潜伏配债/template.html';
const OUT = process.env.PEIZHAI_OUT ? path.resolve(__dirname, process.env.PEIZHAI_OUT) : 'D:/WeGameApps/common_apps/peizhai';

const GEN_DATE = '2026-08-15';
const BOARD_TITLE_MAP = {'上海主板':'沪市主板','深圳主板':'深市主板','创业板':'深市创业板','科创板':'沪市科创板'};

// —— 1) 读取汇总看板 HTML 内嵌的 DATA（其唯一 const DATA 声明即运行时数据）——
const boardSrc = fs.readFileSync(BOARD, 'utf8');
const ds = boardSrc.indexOf('const DATA = [');
let de = boardSrc.indexOf('];\nconst BYCODE', ds);
if (de < 0) de = boardSrc.indexOf('];\r\nconst BYCODE', ds);  // 兼容 CRLF（Windows 生成的看板）
const DATA = eval('(' + boardSrc.slice(ds + 'const DATA = '.length, de + 1) + ')');
console.log('DATA entries:', DATA.length);

// —— 2) 读取单页模板（原始 HTML，非 JS 转义）——
let T = fs.readFileSync(TPL, 'utf8');

function safeName(n){
  return String(n).replace(/[\/\\?:*<>|"\s]/g, '').trim();
}

function fmt(n, dp){
  if (!isFinite(n)) return '—';
  return Number(n).toLocaleString('zh-CN', { minimumFractionDigits:dp, maximumFractionDigits:dp });
}
function ratingFor(c){
  if (c >= 9) return { stars:'★★★★★', label:'极致优质', cls:'r5' };
  if (c >= 7) return { stars:'★★★★',   label:'优质稳健', cls:'r4' };
  if (c >= 4) return { stars:'★★★',    label:'中性博弈', cls:'r3' };
  if (c >= 2) return { stars:'★★',     label:'风险偏弱', cls:'r2' };
  return        { stars:'★',       label:'极致垃圾', cls:'r1' };
}

function buildSingle(d){
  let h = T;
  h = h.replace(/{{BOARD_TITLE}}/g, BOARD_TITLE_MAP[d.board] || d.board);
  h = h.replace(/{{stockName}}/g, d.name || '');

  const map = {code:d.code, name:d.name, bondName:d.bond, price:d.price, perShare:d.perShare,
    regDate:d.reg, payDate:d.pay, issueSize:d.issue, rating:d.rating, convPrice:d.conv,
    listingPrice:d.aggrPrice || '157.3', lockShares:d.lockShares || '', lockRatio:'100',
    floatScale:(d.fs === null || d.fs === undefined || d.fs === '') ? '' : d.fs,
    addDate:d.addDate || ''};   // 加表日期：注入单页 input（默认空，由模板默认值兜底）
  for (const id in map){
    // 只改 value，保留 type="number" step="0.01" 等其它属性不被吃
    const re = new RegExp('(<input id="'+id+'"[^>]*?value=")[^"]*(")', 'g');
    h = h.replace(re, '$1' + map[id] + '$2');
  }
  h = h.replace(/id="tableDateValue">—</, 'id="tableDateValue">'+GEN_DATE+'<');

  const TIERS = [100,200,300,400,500,600,700,800,900,1000,2000,3000,4000];
  const P = parseFloat(d.price) || 0;
  const A = parseFloat(d.perShare) || 0;
  const noScheme = !(A > 0);
  const L = parseFloat(d.aggrPrice) || 157.3;
  const profitPerBond = L - 100;
  const theoCushion = (P > 0 && A > 0) ? (A * profitPerBond) / P : null;
  const head = noScheme ? null : ratingFor(theoCushion);
  h = h.replace(/id="profitPerBond">—</, 'id="profitPerBond">'+(noScheme?'—':fmt(profitPerBond,1)+' 元')+'<');
  h = h.replace(/id="theoCushion">—</, 'id="theoCushion">'+(noScheme?'—':fmt(theoCushion,2)+'%')+'<');
  h = h.replace(/id="headlineStars">—</, 'id="headlineStars">'+(noScheme?'—':head.stars)+'<');
  h = h.replace(/id="headlineLabel">—</, 'id="headlineLabel">'+(noScheme?'方案未定':head.label)+'<');
  h = h.replace(/id="headlineCushion">—</, 'id="headlineCushion">'+(noScheme?'—':fmt(theoCushion,2)+'%')+'<');

  let rowsHtml = '';
  TIERS.forEach(function(N){
    const cost = N * P;
    const theo = noScheme ? null : N * A;
    const actual = noScheme ? null : ((String(d.code)[0] === '6') ? Math.floor(theo / 1000) * 1000 : Math.floor(theo / 100) * 100);
    const profit = noScheme ? null : (actual / 100) * profitPerBond;
    const cushion = (noScheme || cost <= 0) ? null : profit / cost * 100;
    const r = cushion == null ? null : ratingFor(cushion);
    rowsHtml +=
      '<tr>' +
      '<td class="tier">' + N + '</td>' +
      '<td class="num">' + fmt(cost, 0) + '</td>' +
      '<td class="num">' + (noScheme ? '—' : fmt(theo, 2)) + '</td>' +
      '<td class="num">' + (noScheme ? '—' : fmt(actual, 0)) + '</td>' +
      '<td class="num">' + (noScheme ? '—' : fmt(profit, 2)) + '</td>' +
      '<td class="cushion">' + (noScheme ? '—' : fmt(cushion, 2) + '%') + '</td>' +
      '<td class="stars ' + (r ? r.cls : '') + '">' + (noScheme ? '—' : r.stars) + '</td>' +
      '<td class="' + (r ? r.cls : '') + '">' + (noScheme ? '—' : r.label) + '</td>' +
      '</tr>';
  });
  h = h.replace(
    /<tbody id="tierBody" class="num-tabular">[\s\S]*?<\/tbody>/,
    '<tbody id="tierBody" class="num-tabular">' + rowsHtml + '</tbody>'
  );
  return h;
}

// —— 3) 写出 bonds/*.html ——
const bondsDir = path.join(OUT, 'bonds');
fs.mkdirSync(bondsDir, { recursive: true });

const used = {};
let ok = 0;
for (const d of DATA){
  let base = safeName(d.name);
  if (!base) base = d.code;
  let fname = base + '.html';
  if (used[fname]) fname = base + '_' + d.code + '.html';  // 重名兜底
  used[fname] = true;
  fs.writeFileSync(path.join(bondsDir, fname), buildSingle(d), 'utf8');
  ok++;
}
console.log('bonds written:', ok);

// —— 4) 生成 index.html（汇总页）。
// 点击明细：用 Blob 内联打开新窗口（线上/离线单文件都能用，不依赖 bonds/ 子目录）。
// bonds/ 文件仍照常生成，作为可独立部署的镜像备份。
let board = fs.readFileSync(BOARD, 'utf8');
const blobBlock = "    const blob = new Blob([h], {type:'text/html'});\n    const url = URL.createObjectURL(blob);\n    window.open(url, '_blank');\n    setTimeout(function(){ URL.revokeObjectURL(url); }, 60000);";
const navLine = "    window.location.href = './bonds/' + String(d.name).replace(/[\\/\\\\?:*<>|\"\\s]/g,'') + '.html';";
if (board.includes(navLine)){
  board = board.replace(navLine, blobBlock);
  console.log('index nav: relative redirect -> Blob inline open (offline-friendly)');
} else if (!board.includes(blobBlock)){
  console.log('WARN: nav block not found — index nav NOT changed');
}
fs.writeFileSync(path.join(OUT, 'index.html'), board, 'utf8');
console.log('index.html written:', path.join(OUT, 'index.html'));
console.log('DONE');
