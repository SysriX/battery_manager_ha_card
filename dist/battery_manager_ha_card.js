// Batterie-Manager v2: Karte zur Integration "batterie_manager" (custom_components/batterie_manager).
// Alle Daten (Geräte, Klassen, Regeln, Einstellungen, Tauschaufträge, Verlauf) kommen über die
// WebSocket-API der Integration; gespeichert wird in MariaDB. Battery-Notes-Einträge werden wie bisher
// direkt über die Config-Flows von Battery Notes angelegt.
const BM_VERSION = '2.5.3';

const BM_CSS = `
:host{display:block}
*{box-sizing:border-box}
.wrap{font-family:Rajdhani,'Segoe UI',sans-serif;color:#c9ccd2;padding:20px;min-height:100%;
  background:radial-gradient(1200px 600px at 20% -10%,rgba(61,220,132,.08),transparent 60%),radial-gradient(900px 500px at 100% 0,rgba(77,195,255,.08),transparent 60%),#121317}
.plate{border-radius:18px;background:linear-gradient(180deg,rgba(40,42,48,.92),rgba(24,25,29,.94));box-shadow:0 0 0 1px #000,0 10px 30px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08)}
.head{display:flex;align-items:center;gap:14px;padding:16px 20px;margin-bottom:14px;flex-wrap:wrap}
.head h1{margin:0;font-size:20px;letter-spacing:3px;text-transform:uppercase;color:#f0f1f3;font-weight:700}
.head p{margin:2px 0 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9a9fa8}
.led{width:9px;height:9px;border-radius:50%;background:#3ddc84;box-shadow:0 0 10px #3ddc84;flex:none}
.led.bad{background:#ff4a4a;box-shadow:0 0 10px #ff4a4a;animation:bmblink 1.4s ease-in-out infinite}
.sum{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.chip{font-size:12px;letter-spacing:1.5px;font-weight:700;text-transform:uppercase;padding:4px 10px;border-radius:8px;background:rgba(0,0,0,.35);box-shadow:inset 0 1px 3px #000,0 1px 0 rgba(255,255,255,.05);white-space:nowrap}
.chip.blink{animation:bmblink 1.4s ease-in-out infinite}
.chip.lnk{cursor:pointer}
@keyframes bmblink{0%,100%{opacity:1}50%{opacity:.2}}
.need{display:flex;align-items:center;gap:10px;padding:10px 18px;margin-bottom:14px;flex-wrap:wrap}
.need ha-icon{--mdc-icon-size:20px;color:#ffb347}
.need b{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a8e96}
.need span{font-family:'Share Tech Mono',monospace;font-size:14px;color:#ffb347;padding:3px 9px;border-radius:7px;background:rgba(0,0,0,.35);box-shadow:inset 0 1px 3px #000}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 16px;border-radius:9px;cursor:pointer;border:0;font:700 13px Rajdhani,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#c9ccd2;white-space:nowrap;
  background:linear-gradient(180deg,#34363b,#222327);box-shadow:0 4px 0 #0b0b0c,0 6px 10px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.1)}
.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #0b0b0c,inset 0 1px 0 rgba(255,255,255,.1)}
.btn ha-icon{--mdc-icon-size:18px}
.btn.pri{color:#4dc3ff}.btn.ok{color:#3ddc84}.btn.bad{color:#ff6b6b}.btn.warn{color:#ffb347}
.btn.sm{height:30px;padding:0 10px;font-size:12px}
.btn.ic2{width:32px;padding:0}
.btn[disabled]{opacity:.45;pointer-events:none}
.seg{display:flex;gap:8px;flex-wrap:wrap}
.seg .btn.on{transform:translateY(3px);color:#f0f1f3;box-shadow:0 1px 0 #0b0b0c,0 3px 6px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1)}
.seg .btn.on::before{content:"";width:14px;height:4px;border-radius:2px;background:var(--sc,#4dc3ff);box-shadow:0 0 10px var(--sc,#4dc3ff)}
.seg .btn small{font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9fa8;letter-spacing:0}
.tabs{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.tools{display:flex;gap:12px;align-items:center;padding:12px 16px;margin-bottom:14px;flex-wrap:wrap}
.tools .sp{flex:1}
.tools input[type=search]{width:220px}
.tools label.cb{display:flex;align-items:center;gap:6px;margin:0;cursor:pointer}
.sech{display:flex;align-items:center;gap:12px;margin:16px 4px 8px;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:#8a8e96;font-weight:700}
.sech small{font-family:'Share Tech Mono',monospace;font-size:12px;color:#8a8f98;letter-spacing:0}
.sech::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.12),transparent)}
.list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(330px,100%),1fr));gap:12px}
.row{position:relative;display:grid;grid-template-columns:40px minmax(0,1fr) 108px;grid-template-areas:"ic nm st" "loc loc typ" "lvl lvl lvl" "rep rep acts";align-items:center;gap:10px 12px;padding:14px 16px 12px 18px;border-radius:14px}
.row::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:0 3px 3px 0;background:var(--c);box-shadow:0 0 8px var(--c);opacity:.85}
.row .ic{grid-area:ic}.row .nm{grid-area:nm}.row .st{grid-area:st}.row .loc{grid-area:loc}.row .typ{grid-area:typ}.row .lvl{grid-area:lvl}.row .rep{grid-area:rep}.row .acts{grid-area:acts}
.ic{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:rgba(0,0,0,.35);box-shadow:inset 0 1px 3px #000;color:var(--c,#979ca5)}
.ic ha-icon{--mdc-icon-size:22px;filter:drop-shadow(0 0 5px var(--c,transparent))}
.row.low .ic{animation:bmblink 1.4s ease-in-out infinite}
.nm{min-width:0}
.nm b{display:block;font-size:15px;color:#f0f1f3;letter-spacing:.6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nm small{display:block;font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9fa8;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nm small.mob{display:none;font-family:Rajdhani,sans-serif;font-size:12px;color:#a9adb5;letter-spacing:.5px}
.loc{display:flex;align-items:center;gap:8px;min-width:0}
.loc span{font-size:13px;color:#c9ccd2;letter-spacing:.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.loc span ha-icon{--mdc-icon-size:14px;color:#979ca5;margin-right:4px;vertical-align:-2px}
.gch{display:inline-block;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;padding:2px 7px;border-radius:6px;color:var(--gc);box-shadow:inset 0 0 0 1px var(--gc);width:max-content;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.lvl{display:grid;grid-template-columns:minmax(0,1fr) 64px;align-items:center;gap:5px 12px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.22);box-shadow:inset 0 1px 3px rgba(0,0,0,.6)}
.lvl .bar.txt{font-family:"Share Tech Mono",monospace;font-size:14px;letter-spacing:1px;color:var(--c);text-shadow:0 0 8px var(--c);height:10px;line-height:10px}
.lvl .h{grid-column:1/-1;font-size:11px;color:#979ca5;letter-spacing:.6px}
.rep{font-size:11px;color:#9a9fa8;letter-spacing:.6px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.acts .sl{width:32px;height:30px;flex:none}
.lvl .bar{display:flex;gap:3px}
.lvl .bar i{flex:1;height:10px;border-radius:2px;background:#1b1c20;box-shadow:inset 0 1px 2px #000}
.lvl .bar i.on{background:var(--c);box-shadow:0 0 6px var(--c)}
.lvl .v{min-height:18px;text-align:right;font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--c);text-shadow:0 0 8px var(--c);letter-spacing:1px}
.lvl .v small{font-size:11px;color:#979ca5;text-shadow:none;margin-left:6px}
.typ{min-width:0;text-align:right;overflow:hidden}
.typ b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Share Tech Mono',monospace;font-size:14px;color:#f0f1f3;letter-spacing:.5px}
.typ b.no{color:#8a8f98;font-family:Rajdhani,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase}
.typ small{display:block;font-size:11px;color:#9a9fa8;letter-spacing:.6px;margin-top:2px}
.st{align-self:start;font-family:'Share Tech Mono',monospace;font-size:13px;letter-spacing:1px;color:var(--c);text-align:right;padding-top:3px;text-shadow:0 0 8px var(--c)}
.acts{display:flex;gap:6px;justify-content:flex-end}
.neu{display:inline-block;margin:0 6px 0 0;padding:1px 6px;border-radius:5px;font:700 10px Rajdhani,sans-serif;letter-spacing:1.4px;color:#3ddc84;box-shadow:inset 0 0 0 1px #3ddc84,0 0 8px rgba(61,220,132,.35);text-shadow:none;vertical-align:1px}
.btn.pulse{animation:bmpulse 1.6s ease-in-out infinite}
@keyframes bmpulse{0%,100%{box-shadow:0 4px 0 #0b0b0c,0 0 0 0 rgba(255,179,71,.0)}50%{box-shadow:0 4px 0 #0b0b0c,0 0 0 4px rgba(255,179,71,.45)}}
.empty{padding:40px 20px;text-align:center;color:#9a9fa8;letter-spacing:1px}
.ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}
.gcard{padding:16px 18px;border-top:3px solid var(--gc)}
.gcard h3{margin:0;display:flex;align-items:center;gap:10px;font-size:16px;letter-spacing:2.5px;text-transform:uppercase;color:#f0f1f3}
.gcard h3 ha-icon{--mdc-icon-size:20px;color:var(--gc);filter:drop-shadow(0 0 5px var(--gc))}
.gcard h3 small{margin-left:auto;font-family:'Share Tech Mono',monospace;font-size:13px;color:#9a9fa8;letter-spacing:0}
.gcard p{margin:6px 0 12px;font-size:12px;color:#9a9fa8;letter-spacing:.4px}
.opt{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-top:1px solid rgba(255,255,255,.05)}
.opt>span{font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#a9adb5;font-weight:700;display:flex;align-items:center;gap:8px}
.opt>span ha-icon{--mdc-icon-size:18px;color:#979ca5}
.opt>span small{font-family:'Share Tech Mono',monospace;text-transform:none;letter-spacing:0;color:#979ca5;font-weight:500}
.sw{width:46px;height:24px;border-radius:12px;position:relative;cursor:pointer;flex:none;background:#1b1c20;box-shadow:inset 0 2px 5px #000,0 1px 0 rgba(255,255,255,.06)}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:linear-gradient(180deg,#5a5d64,#33353a);box-shadow:0 2px 4px rgba(0,0,0,.6);transition:left .15s}
.sw.on{background:rgba(61,220,132,.22)}
.sw.on::after{left:25px;background:linear-gradient(180deg,#5ff09d,#2fb46a);box-shadow:0 0 10px #3ddc84}
.sw.na{opacity:.35;pointer-events:none}
.num{display:flex;align-items:center;gap:6px}
.num input{width:72px;height:30px;text-align:center}
.num em{font-style:normal;font-family:'Share Tech Mono',monospace;color:#9a9fa8;font-size:13px}
.gfoot{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.members{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.members span{font-size:11px;letter-spacing:.5px;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.3);color:#9a9ea6}
.members span.low{color:#ff6b6b}
.warn{color:#ffb347;font-size:12px;letter-spacing:.6px;margin:8px 0 0}
.set{padding:18px 20px;margin-bottom:14px}
.set h3{margin:0 0 4px;font-size:15px;letter-spacing:2.5px;text-transform:uppercase;color:#f0f1f3}
.set .hint{margin-bottom:12px}
.svc{display:flex;flex-wrap:wrap;gap:8px}
.svc label.cb{display:flex;align-items:center;gap:7px;margin:0;padding:6px 10px;border-radius:8px;background:rgba(0,0,0,.25);cursor:pointer;text-transform:none;letter-spacing:.3px;font-size:13px;color:#c9ccd2}
.sug{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr) auto;gap:10px;align-items:center;padding:8px 0;border-top:1px solid rgba(255,255,255,.05)}
.sug b{font-size:14px;color:#f0f1f3;letter-spacing:.4px}
.sug small{display:block;font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9fa8}
.ov{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);padding:16px}
.dlg{width:min(640px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:20px 22px}
.dlg h3{margin:0 0 4px;font-size:17px;letter-spacing:2.5px;text-transform:uppercase;color:#f0f1f3}
.dlg .sub{margin:0 0 14px;font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9fa8}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}
.full{grid-column:1/-1}
label{display:block;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#8a8e96;font-weight:700;margin-bottom:5px}
input,select{width:100%;height:38px;border-radius:9px;border:0;padding:0 11px;font:600 14px Rajdhani,sans-serif;letter-spacing:.5px;color:#f0f1f3;
  background:linear-gradient(180deg,#141518,#1e1f23);box-shadow:inset 0 2px 6px #000,0 1px 0 rgba(255,255,255,.07);outline:none}
input[type=checkbox]{width:16px;height:16px;accent-color:#3ddc84;box-shadow:none}
input:focus,select:focus{box-shadow:inset 0 2px 6px #000,0 0 0 1px rgba(77,195,255,.6)}
.hint{font-size:12px;color:#9a9fa8;margin-top:5px;letter-spacing:.3px;line-height:1.4}
.ents{display:flex;flex-direction:column;gap:4px;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.2)}
.ents div{display:flex;justify-content:space-between;gap:10px;font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9ea6}
.ents div span:last-child{color:#f0f1f3}
.pick{max-height:50vh;overflow:auto;display:flex;flex-direction:column;gap:2px;margin-top:10px}
.pick label.cb{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:8px;align-items:center;margin:0;padding:6px 8px;border-radius:7px;cursor:pointer;text-transform:none;letter-spacing:.3px;font-size:14px;color:#c9ccd2;font-weight:600}
.pick label.cb:hover{background:rgba(255,255,255,.04)}
.pick label.cb small{font-size:11px;color:#979ca5;letter-spacing:.5px}
.err{color:#ff6b6b;font-size:13px;margin-top:12px;letter-spacing:.4px;white-space:pre-wrap}
.foot{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;align-items:center;flex-wrap:wrap}
.foot .l{margin-right:auto}
.busy{opacity:.6;pointer-events:none}
@media (max-width:760px){.wrap{padding:10px}.head{padding:14px}.tabs .btn{height:34px;padding:0 12px;font-size:12px}.tools{padding:10px 12px;gap:8px}
  .grid{grid-template-columns:1fr}.tools input[type=search]{width:100%}.sug{grid-template-columns:1fr auto}.sug>div:nth-child(2){display:none}}
/* ---- v2 ---- */
.row{grid-template-areas:"ic nm st" "loc loc typ" "cls cls bell" "lvl lvl lvl" "rep rep acts"}
.row .cls{grid-area:cls}.row .bell{grid-area:bell}
.cls{display:flex;gap:4px;min-width:0;overflow:hidden;flex-wrap:nowrap;height:19px}
.cls .gch{flex:none}
.cls .auto{font-size:10px;color:#8a8f98;letter-spacing:1.2px;text-transform:uppercase;align-self:center}
.bell{justify-self:end;display:flex;gap:6px;align-items:center;font-size:11px;letter-spacing:1px;color:#979ca5;text-transform:uppercase}
.bell ha-icon{--mdc-icon-size:17px}
.bell .mute{color:#ffb347}
.lvl{grid-template-columns:16px minmax(0,1fr) 78px;gap:6px 10px}
.lvl ha-icon{--mdc-icon-size:15px;color:#979ca5}
.lvl .h{grid-column:1/-1;display:flex;justify-content:space-between;gap:8px}
.lvl .fc{font-size:12px;letter-spacing:.6px;color:var(--fc,#9a9fa8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lvl .fc.none{color:#8a8f98}
.lvl .fcd{text-align:right;font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--fc,#9a9fa8)}
.fcbox{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:13px;color:#c9ccd2;padding:10px 12px;border-radius:10px;background:rgba(0,0,0,.22)}
.fcbox span:nth-child(odd){color:#9a9fa8}
.vb{position:relative;height:8px;border-radius:3px;background:#1b1c20;box-shadow:inset 0 1px 2px #000;overflow:hidden}
.vb i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--vc);box-shadow:0 0 6px var(--vc)}
.vb b{position:absolute;top:-2px;bottom:-2px;width:2px;background:#ff6b6b;opacity:.8}
.vv{text-align:right;font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--vc,#979ca5);letter-spacing:.5px;white-space:nowrap}
.lvl .rt{grid-column:1/-1;margin-top:-2px;font-size:11.5px;line-height:1.35;letter-spacing:.4px;color:#9a9ea6;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;min-height:2.7em}
.lvl .rt b{color:var(--vc,#c9ccd2);font-weight:600}
.vb.run i{transition:width .8s ease}
.vb.chg i{background:repeating-linear-gradient(90deg,var(--vc) 0 8px,rgba(255,255,255,.35) 8px 10px);animation:bmchg 1.2s linear infinite}
@keyframes bmchg{to{background-position:20px 0}}
.typ b i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;background:var(--tc);box-shadow:0 0 5px var(--tc);vertical-align:1px}
.tspec{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}
.tspec span{padding:2px 8px;border-radius:6px;background:rgba(0,0,0,.3);font-size:12px;color:#c9ccd2;letter-spacing:.4px}
.vv small{font-size:10px;color:#979ca5}
.vb.none{background:repeating-linear-gradient(90deg,#1b1c20 0 6px,transparent 6px 10px);box-shadow:none}
.pres{display:inline-flex;align-items:center;gap:6px}
.pres ha-icon{--mdc-icon-size:15px}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:14px}
.opt select{width:auto;min-width:150px;height:30px;font-size:13px}
.opt .chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
.cond{margin-top:10px;padding:8px 10px;border-radius:9px;background:rgba(0,0,0,.25);font-size:12px;letter-spacing:.4px;color:#a9adb5}
.cond b{color:var(--cc)}
.ev{display:grid;grid-template-columns:118px 26px minmax(0,1fr);gap:10px;align-items:start;padding:9px 14px;border-top:1px solid rgba(255,255,255,.05)}
.ev:first-child{border-top:0}
.ev time{font-family:'Share Tech Mono',monospace;font-size:12px;color:#9a9fa8}
.ev ha-icon{--mdc-icon-size:18px;color:var(--ec)}
.ev b{display:block;font-size:14px;color:#f0f1f3;letter-spacing:.4px}
.ev pre{margin:2px 0 0;font:500 12px Rajdhani,sans-serif;color:#9a9ea6;white-space:pre-wrap;letter-spacing:.3px}
.dbx{display:flex;align-items:center;gap:8px;font-size:13px;letter-spacing:.5px}
.dbx i{width:9px;height:9px;border-radius:50%;background:var(--dc);box-shadow:0 0 8px var(--dc)}
.colr{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.colr b{width:24px;height:24px;border-radius:7px;cursor:pointer;background:var(--cc);box-shadow:inset 0 0 0 2px rgba(0,0,0,.4)}
.colr b.on{box-shadow:0 0 0 2px #f0f1f3}
@media (max-width:760px){.rgrid{grid-template-columns:1fr}.ev{grid-template-columns:86px 22px minmax(0,1fr)}}
`;

const BM_ST = { ok: ['#3ddc84', 'OK'], mid: ['#ffc93d', 'BALD'], low: ['#ff4a4a', 'LEER'], chk: ['#ffb347', 'TAUSCH?'], off: ['#979ca5', 'OFFLINE'] };
const BM_SEV = { low: 0, chk: 1, off: 2, mid: 3, ok: 4 };
const BM_TYPES = ['AA', 'AAA', 'CR2032', 'CR2450', 'CR2477', 'CR123A', 'CR2', 'CR1632', 'CR2016', '9V', 'C', 'D', 'LR44', 'Akku (fest verbaut)'];
const BM_PALETTE = ['#4dc3ff', '#3ddc84', '#ffc93d', '#ffb347', '#ff5a5a', '#ff6fb1', '#b07cff', '#3fd6b5', '#9a9ea6'];
const BM_ALARM = [['disarmed', 'Unscharf'], ['armed_home', 'Scharf (zu Hause)'], ['armed_night', 'Scharf (Nacht)'], ['armed_away', 'Scharf (abwesend)'], ['armed_vacation', 'Scharf (Urlaub)'], ['armed_custom_bypass', 'Scharf (benutzerdef.)'], ['triggered', 'Ausgelöst']];
const BM_EV = { low: ['mdi:battery-alert-variant-outline', '#ff4a4a', 'Batterie leer'], offline: ['mdi:lan-disconnect', '#9a9ea6', 'Keine Verbindung'],
  reminder: ['mdi:bell-ring-outline', '#ffb347', 'Erinnerung'], replaced: ['mdi:battery-check', '#3ddc84', 'Getauscht'], new_battery: ['mdi:battery-plus', '#3ddc84', 'Neue Batterie erkannt'],
  manual: ['mdi:check-circle-outline', '#4dc3ff', 'Von Hand bestätigt'], test: ['mdi:flask-outline', '#b07cff', 'Testmeldung'], info: ['mdi:information-outline', '#80848d', 'Info'] };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const errText = e => (e && (e.body && e.body.message || e.message)) || String(e);
const BM_FCM = { trend: 'Verbrauch', volt: 'Spannung', life: 'Laufzeit' };
// Batterietypen: Chemie (Nennspannung/Leer-Spannung je Zelle, Akku?) und Baugrößen – wie const.py der Integration
const BM_CHEM = {
  alkaline: ['Alkaline', 1.5, 1.0, false], nimh: ['NiMH', 1.2, 1.0, true], liion15: ['Lithium Ion', 1.5, 1.1, true], lithium: ['Lithium', 1.5, 1.0, false],
  zinc: ['Zink-Kohle', 1.5, 0.9, false], limno2: ['Lithium (CR)', 3.0, 2.2, false], lisocl2: ['Lithium (ER)', 3.6, 3.0, false],
  liion: ['Li-Ion / LiPo', 3.7, 3.2, true], lifepo4: ['LiFePO4', 3.2, 2.6, true], silver: ['Silberoxid', 1.55, 1.2, false],
};
const BM_SIZES = { AA: 'Mignon (AA)', AAA: 'Mikro (AAA)', AAAA: 'Mini (AAAA)', C: 'Baby (C)', D: 'Mono (D)', '9V': '9V-Block', CR2032: 'CR2032', CR2025: 'CR2025',
  CR2016: 'CR2016', CR2450: 'CR2450', CR2477: 'CR2477', CR1632: 'CR1632', CR123A: 'CR123A', CR2: 'CR2', ER14505: 'ER14505 (AA)', ER14250: 'ER14250 (1/2 AA)',
  LR44: 'LR44', 18650: '18650', PACK: 'Akku-Pack', OTHER: 'Sonstige' };
const bmTypeName = t => t.name || [t.voltage != null ? String(t.voltage).replace('.', ',') + 'V' : '', (BM_CHEM[t.chemistry] || [t.chemistry])[0], BM_SIZES[t.size] || t.size].filter(Boolean).join(' - ');
// Dauer in Tagen → „7 Std“, „40 T“, „4 Mon“, „1,5 J“
const fmtDur = d => d == null ? '–' : d < 1 ? `${Math.max(1, Math.round(d * 24))} Std` : d < 150 ? `${Math.round(d)} T` : d < 730 ? `${Math.round(d / 30.4)} Mon` : `${(d / 365).toFixed(1).replace('.', ',')} J`;
const BM_RUNB = { typ: 'wie frühere Batterien dieses Typs', modell: 'wie gleiche Geräte mit diesem Typ', skaliert: 'frühere Batterien, umgerechnet auf diesen Typ', geraet: 'wie frühere Batterien', verbrauch: 'aus dem bisherigen Verbrauch', ladung: 'wie frühere Ladungen' };
const fmtV = v => v == null ? '–' : (Math.round(v * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

// Farbverlauf für den Batteriestand: 100–50 % grün → 25 % gelb → 12 % orange → unter 10 % rot
const BM_STOPS = [[0, [255, 59, 59]], [8, [255, 74, 74]], [12, [255, 140, 50]], [25, [255, 214, 64]], [50, [61, 220, 132]], [100, [61, 220, 132]]];
function levelColor(p) {
  if (p == null || isNaN(p)) return null;
  p = Math.max(0, Math.min(100, p));
  for (let i = 1; i < BM_STOPS.length; i++) {
    const [p1, c1] = BM_STOPS[i];
    if (p <= p1) {
      const [p0, c0] = BM_STOPS[i - 1], t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return `rgb(${c0.map((c, k) => Math.round(c + (c1[k] - c) * t)).join(',')})`;
    }
  }
  return 'rgb(61,220,132)';
}

class BatterieManager extends HTMLElement {
  constructor() {
    super(); this.attachShadow({ mode: 'open' });
    this._d = null; this._flows = []; this._dlg = null; this._busy = false; this._err = ''; this._events = null;
    let p = {}; try { p = JSON.parse(localStorage.getItem('bm-view') || '{}'); } catch (e) { /* egal */ }
    this._v = { tab: 'geraete', filter: 'alle', by: 'raum', q: '', akkus: true, evq: '', ...p };
    if (this._v.by === 'gruppe') this._v.by = 'klasse';
    this.shadowRoot.addEventListener('click', ev => { const el = ev.target.closest('[data-a]'); if (el && this.shadowRoot.contains(el)) this._act(el.dataset.a, el, ev); });
    this.shadowRoot.addEventListener('change', ev => { const el = ev.target.closest('[data-c]'); if (el) this._chg(el.dataset.c, el); });
    this.shadowRoot.addEventListener('input', ev => {
      const el = ev.target; if (!el.dataset) return;
      if (el.dataset.i === 'q') { this._v.q = el.value; this._save(); this._renderList(); }
      if (el.dataset.i === 'pickq') this._filterPick(el.value);
      if (el.dataset.i === 'evq') { this._v.evq = el.value; const l = this.shadowRoot.getElementById('evl'); if (l) l.innerHTML = this._eventsHtml(); }
    });
  }
  // ansicht: {tab, filter, gruppe (raum|klasse|typ|status|prognose|stand)} = feste Startansicht, wird dann nicht im Browser gemerkt
  setConfig(c) {
    this._config = c || {};
    const a = this._config.ansicht;
    if (a && typeof a === 'object') { this._fixed = true; Object.assign(this._v, { tab: a.tab || 'geraete', filter: a.filter || 'alle', by: a.gruppe || a.by || this._v.by, q: '' }); }
  }
  getCardSize() { return 12; }
  connectedCallback() { if (this._hass && !this._unsub) this._subscribe(); }
  disconnectedCallback() { if (this._unsub) { this._unsub.then(u => u && u()).catch(() => {}); this._unsub = null; } clearInterval(this._flowTimer); this._flowTimer = null; }
  set hass(h) {
    const first = !this._hass; this._hass = h;
    if (first) { this._loadFont(); this._subscribe(); this._loadFlows(); }
    if (!this._flowTimer) this._flowTimer = setInterval(() => this._loadFlows(), 60000);
  }
  _loadFont() {
    if (document.getElementById('rtc-font')) return;
    const l = document.createElement('link'); l.id = 'rtc-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap';
    document.head.appendChild(l);
  }
  _save() { if (this._fixed) return; try { localStorage.setItem('bm-view', JSON.stringify({ tab: this._v.tab, filter: this._v.filter, by: this._v.by, akkus: this._v.akkus })); } catch (e) { /* egal */ } }
  _admin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
  _ws(type, data = {}) { return this._hass.callWS({ type: 'batterie_manager/' + type, ...data }); }

  // ---------- Daten ----------
  _subscribe() {
    if (!this._hass || this._unsub) return;
    this._unsub = this._hass.connection.subscribeMessage(snap => {
      this._d = snap; this._err = '';
      if (!this._dlg) this._render(); else this._refreshDialogLess();
    }, { type: 'batterie_manager/subscribe' }).catch(e => {
      this._unsub = null;
      this._err = /unknown command/i.test(errText(e)) ? 'Die Integration „Batterie-Manager“ ist nicht geladen (configuration.yaml → batterie_manager:, HA neu starten).' : errText(e);
      this._render();
    });
  }
  _refreshDialogLess() { /* Dialog offen: Hintergrund nicht neu zeichnen, damit Eingaben erhalten bleiben */ }
  async _loadFlows() {
    if (!this._admin()) return;
    try {
      const all = await this._hass.callWS({ type: 'config_entries/flow/progress' });
      const fl = all.filter(f => f.handler === 'battery_notes' && f.context && f.context.source === 'integration_discovery');
      if (fl.map(f => f.flow_id).join() !== (this._flows || []).map(f => f.flow_id).join()) { this._flows = fl; if (!this._dlg) this._render(); }
    } catch (e) { /* kein Admin */ }
  }
  _type(id) { return ((this._d && this._d.types) || []).find(x => x.id === id) || null; }
  _typeShort(t) { return t ? `${(BM_CHEM[t.chemistry] || [t.chemistry || ''])[0]} ${t.size || ''}`.trim() : ''; }
  _cls(id) { const c = ((this._d && this._d.classes) || []).find(x => x.id === id); return c || { id, name: id, color: '#9a9ea6', icon: 'mdi:battery' }; }
  _dev(k) { return ((this._d && this._d.devices) || []).find(d => d.k === k); }
  _col(d) { return d.st === 'off' ? BM_ST.off[0] : (levelColor(d.p) || (d.st === 'low' ? BM_ST.low[0] : BM_ST.ok[0])); }
  _icon(d) {
    if (d.st === 'off') return 'mdi:battery-off-outline';
    if (d.st === 'low') return 'mdi:battery-alert-variant-outline';
    if (d.p == null) return 'mdi:battery-check';
    return d.p >= 95 ? 'mdi:battery' : `mdi:battery-${Math.max(10, Math.round(d.p / 10) * 10)}`;
  }
  _needed(list) {
    const m = {};
    list.forEach(d => {
      if (d.tn) { m[d.tn] = (m[d.tn] || 0) + (d.bc || 1); return; }
      if (!d.t) return; const x = /^(\d+)\s*[×x]\s*(.+)$/.exec(d.t); const n = x ? +x[1] : 1, t = x ? x[2].trim() : d.t; m[t] = (m[t] || 0) + n;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${n}× ${t}`);
  }
  _fmtDate(s, time) {
    if (!s || s === 'None' || s === 'unknown') return '';
    const d = new Date(String(s).replace(' ', 'T')); if (isNaN(d)) return '';
    return time ? d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  // Laufzeit-Balken: wie lange die aktuelle Batterie/Ladung rechnerisch noch hält – unabhängig vom gemeldeten Stand
  _runRow(d) {
    const r = (d.fc || {}).run, fc = this._fc(d);
    const lvlFc = fc && fc.f.method !== 'life' ? ` · ${BM_FCM[fc.f.method]}: ${fc.txt}` : '';
    if (!r) {
      const txt = d.st === 'low' ? 'jetzt tauschen' : d.fc && d.fc.noisy ? 'Wert schwankt zu stark – keine Laufzeit' : 'Laufzeit unbekannt – noch kein Tausch erkannt';
      return `<ha-icon icon="mdi:timer-sand-empty"></ha-icon><div class="vb none"></div><div class="vv"><small>–</small></div><small class="rt">${txt}${lvlFc}</small>`;
    }
    const el = Math.max(0, (Date.now() - new Date(r.since)) / 864e5), ty = this._type(r.type), tyTxt = ty ? ` (${this._typeShort(ty)})` : '';
    if (r.charging) return `<ha-icon icon="mdi:battery-charging" style="color:#4dc3ff"></ha-icon><div class="vb run chg" style="--vc:#4dc3ff"><i style="width:100%"></i></div><div class="vv" style="--vc:#4dc3ff">lädt</div><small class="rt" style="--vc:#4dc3ff">lädt gerade${r.total ? ` · eine Ladung hält ca. <b>${fmtDur(r.total)}</b>` : ''}</small>`;
    if (r.total == null) return `<ha-icon icon="mdi:timer-sand"></ha-icon><div class="vb none"></div><div class="vv"><small>?</small></div><small class="rt">${r.akku ? 'entlädt' : 'läuft'} seit <b>${fmtDur(el)}</b> · Laufzeit noch unbekannt${lvlFc}</small>`;
    const rem = Math.max(0, r.total - el), frac = r.total > 0 ? Math.max(0, Math.min(1, rem / r.total)) : 0, col = levelColor(frac * 100);
    const end = new Date(Date.now() + rem * 864e5), endTxt = r.total < 2 ? end.toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const basis = (BM_RUNB[r.basis] || '') + (r.n ? ` (${r.n}×)` : '') + (r.basis === 'typ' || r.basis === 'modell' || r.basis === 'skaliert' ? tyTxt : '');
    return `<ha-icon icon="${rem <= 0 ? 'mdi:timer-sand-complete' : 'mdi:timer-sand'}" style="color:${col}"></ha-icon><div class="vb run" style="--vc:${col}" title="Laufzeit rechnerisch: ${fmtDur(el)} von ~${fmtDur(r.total)}"><i style="width:${Math.round(frac * 100)}%"></i></div>
      <div class="vv" style="--vc:${col}">${rem <= 0 ? 'fällig' : 'noch ' + fmtDur(rem)}</div>
      <small class="rt" style="--vc:${col}" title="${esc(basis)}">rechnerisch leer <b>${rem <= 0 ? 'jetzt' : 'ca. ' + endTxt}</b> · ${r.akku ? 'entlädt seit' : 'läuft'} ${fmtDur(el)} von ~${fmtDur(r.total)} · ${esc(basis)}${lvlFc}</small>`;
  }
  // Vorhersage: Tage bis leer (aus Datum, damit es ohne Neuberechnung weiterzählt)
  _fc(d) {
    const f = d.fc;
    if (!f || !f.method) return null;
    if (f.far) return { days: Infinity, txt: 'über 3 Jahre', short: '> 3 J', col: '#80848d', f };
    const t = new Date(f.date + 'T12:00:00'), days = Math.max(0, Math.round((t - new Date().setHours(12, 0, 0, 0)) / 864e5));
    const short = days === 0 ? 'jetzt' : days < 60 ? `${days} T` : days < 730 ? `${Math.round(days / 30.4)} Mon` : `${(days / 365).toFixed(1).replace('.', ',')} J`;
    const col = days <= 14 ? '#ff8a50' : days <= 45 ? '#ffc93d' : '#80848d';
    return { days, txt: t.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }), short, col, f };
  }
  _fcBox(d) {
    const f = d.fc || {}, fc = this._fc(d), num = x => String(x).replace('.', ',');
    const rows = [];
    rows.push(['Voraussichtlich leer', fc ? `${fc.txt} (${fc.short}) · ${BM_FCM[f.method]} · Sicherheit ${f.conf || '–'}` : 'noch keine Vorhersage']);
    if (f.since) rows.push(['Aktuelle Batterie seit', this._fmtDate(f.since)]);
    if (f.noisy) rows.push(['Hinweis', 'Der Batteriewert springt ständig – daraus lässt sich nichts ablesen.']);
    if (f.trend) rows.push(['Verbrauch', f.trend.rate < 0 ? `${num(Math.abs(f.trend.rate).toFixed(2))} % pro Tag (${f.trend.span} Tage gemessen)` : `kein Verbrauch messbar (${f.trend.span} Tage)`]);
    if (f.volt) rows.push(['Spannung', f.volt.rate < 0 ? `${num((Math.abs(f.volt.rate) * 1000).toFixed(1))} mV pro Tag (${f.volt.span} Tage)` : `kein Abfall messbar (${f.volt.span} Tage)`]);
    if (f.life) rows.push(['Frühere Batterien', `hielten Ø ${f.life.avg} Tage (${f.life.n}×${f.life.basis ? ', ' + (BM_RUNB[f.life.basis] || f.life.basis) : ''})${f.life.days != null ? ` → noch ca. ${f.life.days} Tage` : ''}`]);
    if (f.types) Object.entries(f.types).forEach(([tid, x]) => rows.push([`Laufzeit ${tid ? this._typeShort(this._type(tid)) || 'gelöschter Typ' : 'ohne Typ'}`, `Ø ${fmtDur(x.median)} (${x.n} Batterie${x.n === 1 ? '' : 'n'})`]));
    if (f.run && f.run.total != null) rows.push(['Laufzeit-Balken', `${fmtDur(f.run.total)} gesamt · ${BM_RUNB[f.run.basis] || ''}`]);
    return `<div class="full"><label>Vorhersage</label><div class="fcbox">${rows.map(([a, b]) => `<span>${esc(a)}</span><span>${esc(b)}</span>`).join('')}</div></div>`;
  }
  _isNew(d) { const t = d.r ? new Date(String(d.r).replace(' ', 'T')) : null; return t && !isNaN(t) && Date.now() - t < 7 * 864e5; }
  _presTxt(src) {
    const p = this._d && this._d.presence && this._d.presence[src];
    if (!p || !p.entity) return 'nicht eingerichtet';
    return p.home == null ? `unbekannt (${p.state || '–'})` : p.home ? 'jemand zu Hause' : 'niemand zu Hause';
  }

  // ---------- Anzeige ----------
  _render() {
    const h = this._hass;
    if (!h) { this.shadowRoot.innerHTML = `<style>${BM_CSS}</style><div class="wrap"></div>`; return; }
    const v = this._v, d = this._d;
    // kompakt: nur die Geräteliste (kompakt: true oder Raum in Einstellungen → panel_compact)
    const raum = this._config.raum, compact = this._config.kompakt === true || (!!raum && !!d && ((d.settings || {}).panel_compact || []).includes(raum));
    if (compact && d) {
      if (v.tab !== 'geraete') v.tab = 'geraete';
      this.shadowRoot.innerHTML = `<style>${BM_CSS}</style><div class="wrap${this._busy ? ' busy' : ''}"><div id="list">${this._listHtml()}</div>${this._dlg ? this._dialog() : ''}</div>`;
      return;
    }
    const devs = (d && d.devices) || [];
    const stc = { low: 0, chk: 0, off: 0, mid: 0, ok: 0 };
    devs.forEach(x => { stc[x.st] = (stc[x.st] || 0) + 1; });
    const need = this._needed(devs.filter(x => x.st === 'low' && !x.excluded));
    const pr = d && d.presence && d.presence.presence;
    const db = d && d.db;
    this.shadowRoot.innerHTML = `<style>${BM_CSS}</style><div class="wrap${this._busy ? ' busy' : ''}">
      <div class="plate head"><span class="led${stc.low ? ' bad' : ''}"></span><div><h1>${esc(this._config.title || 'Batterien')}</h1>
        <p>${devs.length} Geräte · ${((d && d.classes) || []).length} Klassen · ${((d && d.rules) || []).length} Regeln · v${BM_VERSION}${db ? ` · <span style="color:${db.connected ? '#3ddc84' : '#ffb347'}">${db.connected ? 'DB' : 'DB offline – lokale Kopie'}</span>` : ''}</p></div>
        <div class="sum">
          ${stc.low ? `<span class="chip blink lnk" data-a="filter:low" style="color:#ff4a4a">${stc.low} leer</span>` : '<span class="chip" style="color:#3ddc84">keine leer</span>'}
          ${stc.chk ? `<span class="chip lnk" data-a="filter:chk" title="Stand nach dem Wechsel unter der Voll-Schwelle – bitte bestätigen" style="color:#ffb347">${stc.chk} Tausch prüfen</span>` : ''}
          ${stc.mid ? `<span class="chip lnk" data-a="filter:mid" style="color:#ffc93d">${stc.mid} bald</span>` : ''}
          ${stc.off ? `<span class="chip lnk" data-a="filter:off" style="color:#9a9ea6">${stc.off} offline</span>` : ''}
          <span class="chip lnk" data-a="todo" title="To-do-Liste öffnen" style="color:#4dc3ff">☐ ${d ? d.open : 0} zu tauschen</span>
          ${pr && pr.entity ? `<span class="chip pres" title="${esc(pr.name || pr.entity)}: ${esc(pr.state)}" style="color:${pr.home ? '#3ddc84' : '#9a9ea6'}"><ha-icon icon="${pr.home ? 'mdi:home-account' : 'mdi:home-export-outline'}"></ha-icon>${pr.home ? 'Zuhause' : pr.home === false ? 'Unterwegs' : esc(pr.state || '?')}</span>` : ''}
          ${d && d.quiet ? '<span class="chip pres" style="color:#b07cff"><ha-icon icon="mdi:weather-night"></ha-icon>Ruhezeit</span>' : ''}
        </div></div>
      ${need.length ? `<div class="plate need"><ha-icon icon="mdi:cart-outline"></ha-icon><b>Benötigt</b>${need.map(n => `<span>${esc(n)}</span>`).join('')}</div>` : ''}
      <div class="tabs seg">
        ${[['geraete', 'mdi:format-list-bulleted', 'Geräte'], ['klassen', 'mdi:shape-outline', 'Klassen'], ['typen', 'mdi:battery-heart-variant', 'Batterietypen'], ['regeln', 'mdi:bell-cog-outline', 'Regeln'], ['einst', 'mdi:cog-outline', 'Einstellungen'], ['verlauf', 'mdi:history', 'Verlauf']].map(([k, i, t]) =>
          `<button class="btn${v.tab === k ? ' on' : ''}" data-a="tab:${k}"><ha-icon icon="${i}"></ha-icon>${t}${k === 'einst' && this._flows.length ? `<small>${this._flows.length}</small>` : ''}</button>`).join('')}
      </div>
      ${this._err ? `<div class="plate empty" style="color:#ff6b6b">${esc(this._err)}</div>` : ''}
      ${!d ? (this._err ? '' : '<div class="plate empty">Lade …</div>') : v.tab === 'geraete' ? this._tabDevices(stc) : v.tab === 'klassen' ? this._tabClasses() : v.tab === 'typen' ? this._tabTypes() : v.tab === 'regeln' ? this._tabRules() : v.tab === 'verlauf' ? this._tabEvents() : this._tabSettings()}
      ${this._dlg ? this._dialog() : ''}
    </div>`;
    if (v.tab === 'verlauf' && this._events === null) this._loadEvents();
  }

  // ---------- Geräte ----------
  _tabDevices(stc) {
    const v = this._v, n = this._d.devices.length;
    return `<div class="plate tools">
        <div class="seg">${[['alle', 'Alle', n, '#4dc3ff'], ['low', 'Leer', stc.low, '#ff4a4a'], ...(stc.chk ? [['chk', 'Tausch?', stc.chk, '#ffb347']] : []), ['mid', 'Bald', stc.mid, '#ffc93d'], ['off', 'Offline', stc.off, '#9a9ea6'], ['ok', 'OK', stc.ok, '#3ddc84'], ['stumm', '🔕', this._d.devices.filter(d => d.excluded).length, '#ffb347']].map(([k, t, c, col]) =>
          `<button class="btn sm${v.filter === k ? ' on' : ''}" style="--sc:${col}" data-a="filter:${k}" ${k === 'stumm' ? 'title="Geräte ohne Benachrichtigung"' : ''}>${t}<small>${c}</small></button>`).join('')}</div>
        <span class="sp"></span>
        <div class="seg">${[['stand', 'Stand'], ['raum', 'Raum'], ['klasse', 'Klasse'], ['typ', 'Batterietyp'], ['status', 'Status'], ['prognose', 'Prognose']].map(([k, t]) => `<button class="btn sm${v.by === k ? ' on' : ''}" data-a="by:${k}">${t}</button>`).join('')}</div>
        <label class="cb" title="Handys, Tablets, Uhren …"><input type="checkbox" data-c="akkus"${v.akkus ? ' checked' : ''}>Akku-Geräte</label>
        <input type="search" data-i="q" placeholder="Suchen …" value="${esc(v.q)}">
      </div><div id="list">${this._listHtml()}</div>`;
  }
  _renderList() { const el = this.shadowRoot.getElementById('list'); if (el) el.innerHTML = this._listHtml(); }
  _listHtml() {
    const v = this._v, q = v.q.trim().toLowerCase(), akku = (this._d.settings || {}).akku_class || 'akkus';
    let list = this._d.devices.slice();
    // Akkus aus = Handys, Tablets, Uhren … ausblenden (von der Integration erkannt); Geräte mit von Hand gewählter Akku-Klasse bleiben sichtbar
    if (!v.akkus) list = list.filter(d => !(d.akku || (!d.own.length && d.classes.includes(akku))));
    if (v.filter === 'stumm') list = list.filter(d => d.excluded);
    else if (v.filter !== 'alle') list = list.filter(d => d.st === v.filter);
    if (q) list = list.filter(d => [d.n, d.a, d.m, d.h, d.t, d.note, ...d.classes.map(c => this._cls(c).name), ...(d.e || [])].join(' ').toLowerCase().includes(q));
    if (!list.length) return '<div class="plate empty">Keine passenden Geräte.</div>';
    const groups = {};
    const add = (k, d) => (groups[k] = groups[k] || []).push(d);
    list.forEach(d => {
      if (v.by === 'raum') add(d.a || '~Ohne Raum', d);
      else if (v.by === 'klasse') (d.classes.length ? d.classes : ['~']).forEach(c => add(c === '~' ? '~Ohne Klasse' : this._cls(c).name, d));
      else if (v.by === 'typ') add(d.t ? d.t.replace(/^\d+\s*[×x]\s*/, '') : '~Typ unbekannt', d);
      else if (v.by === 'stand') add('~Alle Geräte – niedrigster Stand zuerst', d);
      else if (v.by === 'prognose') { const f = d.st === 'low' ? { days: 0 } : this._fc(d); add(!f ? '~Keine Vorhersage' : f.days <= 14 ? '1' : f.days <= 45 ? '2' : f.days <= 90 ? '3' : f.days <= 365 ? '4' : '5', d); }
      else add(String(BM_SEV[d.st]), d);
    });
    const label = k => v.by === 'status' ? ({ 0: 'Batterie leer', 1: 'Tausch nicht erkannt', 2: 'Keine Verbindung', 3: 'Bald leer', 4: 'In Ordnung' })[k]
      : v.by === 'prognose' && k[0] !== '~' ? ({ 1: 'In den nächsten 2 Wochen', 2: 'In 2–6 Wochen', 3: 'In 6 Wochen bis 3 Monaten', 4: 'In 3–12 Monaten', 5: 'Später als 1 Jahr' })[k] : k.replace(/^~/, '');
    const fcd = d => { const f = this._fc(d); return f ? f.days : Infinity; };
    // Stand: Prozent; Melder „schwach“ = 0; offline mit letztem Stand; Melder OK und offline ohne Stand ans Ende
    const lvl = d => d.p != null ? d.p : d.lb ? 0 : d.off ? (d.lp != null ? d.lp : 1001) : 1000;
    const sortRows = (a, b) => (v.by === 'stand' ? lvl(a) - lvl(b) : 0) || (v.by === 'prognose' ? fcd(a) - fcd(b) : 0) || BM_SEV[a.st] - BM_SEV[b.st] || (a.p ?? 101) - (b.p ?? 101) || a.n.localeCompare(b.n, 'de');
    return Object.keys(groups).sort((a, b) => (a[0] === '~') - (b[0] === '~') || a.localeCompare(b, 'de')).map(k => {
      const g = groups[k].sort(sortRows), nl = g.filter(x => x.st === 'low').length;
      return `<div class="sech">${esc(label(k))}<small>${g.length}${nl ? ` · <span style="color:#ff4a4a">${nl} leer</span>` : ''}</small></div><div class="list">${g.map(x => this._row(x)).join('')}</div>`;
    }).join('');
  }
  // Kachel mit festem Raster: alle Kacheln gleich breit/hoch, Elemente liegen spaltenweise untereinander
  _row(d) {
    const col = this._col(d), txt = BM_ST[d.st][1], admin = this._admin(), full = (this._d.settings || {}).full_threshold || 90;
    const segs = d.p != null ? Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.ceil(d.p / 10) ? 'on' : ''}"></i>`).join('') : '';
    const pRow = d.p != null
      ? `<ha-icon icon="mdi:battery-medium"></ha-icon><div class="bar">${segs}</div><div class="v">${d.p} %</div>`
      : `<ha-icon icon="mdi:battery-medium"></ha-icon><div class="bar txt">${d.st === 'off' ? 'OFFLINE' : d.lb ? 'SCHWACH' : 'OK'}</div><div class="v">${d.off && d.lp != null ? `<small title="letzter bekannter Stand">${Math.round(d.lp)} %</small>` : ''}</div>`;
    let vRow;
    if (d.v != null) {
      const lo = d.vmin != null ? d.vmin : (d.vmax ? d.vmax * 0.7 : null), hi = d.vmax;
      const f = hi && lo != null && hi > lo ? Math.max(0, Math.min(1, (d.v - lo) / (hi - lo))) : null;
      const vc = f != null ? levelColor(f * 100) : '#4dc3ff';
      vRow = `<ha-icon icon="mdi:flash-outline"></ha-icon><div class="vb" style="--vc:${vc}">${f != null ? `<i style="width:${Math.round(f * 100)}%"></i>` : `<i style="width:100%;opacity:.35"></i>`}</div>
        <div class="vv" style="--vc:${vc}">${fmtV(d.v)}${hi ? `<small> / ${fmtV(hi)} V</small>` : ' V'}</div>`;
    } else vRow = '<ha-icon icon="mdi:flash-off-outline"></ha-icon><div class="vb none"></div><div class="vv"><small>keine Spannung</small></div>';
    const hint = d.st === 'chk' ? `unter Voll-Schwelle ${full} %` : d.p != null ? `Leer-Schwelle ${d.s} %` : d.st === 'off' ? (d.lp != null ? `keine Verbindung · zuletzt ${Math.round(d.lp)} %` : d.llb ? 'keine Verbindung · zuletzt schwach' : 'keine Verbindung') : 'nur Melder „Batterie schwach“';
    const rep = this._fmtDate(d.r), fcRow = this._runRow(d);
    const ty = this._type(d.bt);
    const chips = d.classes.length ? d.classes.map(c => { const k = this._cls(c); return `<span class="gch" style="--gc:${k.color}">${esc(k.name)}</span>`; }).join('') : '<span class="auto">keine Klasse</span>';
    const auto = !d.own.length && d.classes.length ? '<span class="auto">auto</span>' : '';
    const chk = admin && (d.bn || d.case) ? `<button class="btn sm ic2 ok${d.st === 'chk' ? ' pulse' : ''}" data-a="replaced:${esc(d.k)}" title="${d.st === 'chk' ? 'Tausch bestätigen' : 'Batterie getauscht'}">✓</button>` : '<span class="sl"></span>';
    const edit = admin ? `<button class="btn sm ic2" data-a="edit:${esc(d.k)}" title="Bearbeiten">✎</button>` : '<span class="sl"></span>';
    return `<div class="plate row ${d.st}" style="--c:${col}">
      <div class="ic"><ha-icon icon="${this._icon(d)}"></ha-icon></div>
      <div class="nm"><b title="${esc(d.n)}">${esc(d.n)}</b><small title="${esc((d.e || []).join('\n'))}">${esc([d.h, d.m].filter(Boolean).join(' · ') || d.pe || d.le)}</small></div>
      <div class="st">${txt}</div>
      <div class="loc"><span><ha-icon icon="mdi:map-marker-outline"></ha-icon>${esc(d.a || 'Ohne Raum')}</span></div>
      <div class="typ">${ty ? `<b title="${esc((d.bc || 1) + '× ' + d.tn)}" style="--tc:${ty.color || '#4dc3ff'}"><i></i>${d.bc > 1 ? d.bc + '× ' : ''}${esc(this._typeShort(ty))}</b>` : d.t ? `<b title="${esc(d.t)}">${esc(d.t)}</b>` : '<b class="no">Typ ?</b>'}</div>
      <div class="cls">${chips}${auto}</div>
      <div class="bell">${d.excluded ? '<ha-icon class="mute" icon="mdi:bell-off-outline" title="Keine Benachrichtigung"></ha-icon>' : d.case ? `<ha-icon icon="mdi:bell-ring-outline" title="Tauschauftrag seit ${esc(this._fmtDate(d.case.opened_at, true))}" style="color:${col}"></ha-icon>` : ''}</div>
      <div class="lvl">${pRow}${vRow}${fcRow}<small class="h"><span>${hint}</span><span>${d.vmin != null && d.v != null ? `min ${fmtV(d.vmin)} V` : ''}</span></small></div>
      <div class="rep">${this._isNew(d) ? '<span class="neu">NEU</span>' : ''}${rep ? 'getauscht ' + rep : d.bn ? 'noch kein Tausch erfasst' : 'kein Battery-Notes-Eintrag'}</div>
      <div class="acts">${chk}${edit}<button class="btn sm ic2" data-a="info:${esc(d.pe || d.le)}" title="Verlauf / Details">ⓘ</button></div>
    </div>`;
  }

  // ---------- Klassen ----------
  _tabClasses() {
    const admin = this._admin(), devs = this._d.devices;
    return `<div class="hint" style="margin:0 4px 12px">Klassen sind Geräte-Arten (z. B. Fensterkontakt, Alarmanlage, Thermostat). Ein Gerät kann mehreren Klassen angehören. Regeln legen fest, welche Klassen wie benachrichtigt werden. Geräte ohne eigene Klasse landen automatisch in „${esc(this._cls(this._d.settings.default_class).name)}“ bzw. Akkus in „${esc(this._cls(this._d.settings.akku_class).name)}“.</div>
    <div class="ggrid">${this._d.classes.map(c => {
      const m = devs.filter(d => d.classes.includes(c.id)), lows = m.filter(d => d.st === 'low');
      const rules = this._d.rules.filter(r => !r.classes.length || r.classes.includes(c.id));
      return `<div class="plate gcard" style="--gc:${c.color}">
        <h3><ha-icon icon="${esc(c.icon || 'mdi:battery')}"></ha-icon>${esc(c.name)}<small>${m.length} Geräte${lows.length ? ` · <span style="color:#ff4a4a">${lows.length} leer</span>` : ''}</small></h3>
        <p>${esc(c.description || '')}</p>
        <div class="opt"><span><ha-icon icon="mdi:battery-arrow-down-outline"></ha-icon>Leer-Schwelle</span><span style="font-family:'Share Tech Mono',monospace;color:#c9ccd2">${c.threshold != null ? c.threshold + ' %' : `Standard (${this._d.settings.default_threshold} %)`}</span></div>
        <div class="opt"><span><ha-icon icon="mdi:bell-cog-outline"></ha-icon>Regeln</span><div class="chips">${rules.length ? rules.map(r => `<span class="gch" style="--gc:${r.active ? '#4dc3ff' : '#8c919a'}">${esc(r.name)}</span>`).join('') : '<span class="auto" style="font-size:11px;color:#ffb347">keine – keine Meldung</span>'}</div></div>
        <div class="members">${m.length ? m.sort((a, b) => a.n.localeCompare(b.n, 'de')).map(d => `<span class="${d.st === 'low' ? 'low' : ''}">${d.excluded ? '🔕 ' : ''}${esc(d.n)}</span>`).join('') : '<span>keine Geräte</span>'}</div>
        ${admin ? `<div class="gfoot"><button class="btn sm pri" data-a="assign:${c.id}">Geräte zuordnen</button><button class="btn sm" data-a="editclass:${c.id}">Bearbeiten</button><button class="btn sm bad" data-a="delclass:${c.id}">Löschen</button></div>` : ''}
      </div>`;
    }).join('')}
    ${admin ? '<div class="plate gcard" style="--gc:#4dc3ff;display:grid;place-items:center;min-height:160px"><button class="btn pri" data-a="newclass">＋ Neue Klasse</button></div>' : ''}</div>`;
  }

  // ---------- Batterietypen ----------
  _typeOpts(d, cur) {
    // gleiche Baugröße wie bei Battery Notes zuerst
    const bnSize = ((/(?:^|\s|×)\s*([A-Z0-9]+)\s*$/i.exec(d.t || '') || [])[1] || '').toUpperCase();
    const list = ((this._d && this._d.types) || []).slice().sort((a, b) => (b.size === bnSize) - (a.size === bnSize));
    return list.map(t => `<option value="${esc(t.id)}"${t.id === cur ? ' selected' : ''}>${esc(t.label || bmTypeName(t))}${t.capacity ? ` · ${t.capacity} mAh` : ''}</option>`).join('');
  }
  // Zeile unter der Typ-Auswahl: Spannung voll/leer und Kapazität aus dem Typ × Anzahl
  _typeInfo(id, n) {
    const t = this._type(id); n = Math.max(1, parseInt(n, 10) || 1);
    if (!t) return 'Ohne Typ: Spannung voll/leer selbst eintragen oder leer lassen (dann Battery Notes bzw. Gerät).';
    const v = x => x != null ? fmtV(Math.round(x * n * 100) / 100) + ' V' : '–';
    return `Aus dem Typ: voll <b>${v(t.voltage)}</b> · leer <b>${v(t.v_empty)}</b>${t.capacity ? ` · <b>${t.capacity} mAh</b>${n > 1 ? ` (${n} Zellen in Reihe)` : ''}` : ''}${t.rechargeable ? ' · Akku' : ''}. Bei der Auswahl werden die Spannungen oben eingetragen; ein Wechsel auf einen anderen Typ hier umstellen.`;
  }
  _tabTypes() {
    const admin = this._admin(), devs = this._d.devices, st = this._d.type_stats || {};
    return `<div class="hint" style="margin:0 4px 12px">Batterietypen legst du einmal an und ordnest sie im Gerät zu (✎ → Eingesetzter Batterietyp). Jeder Wechsel wird mit dem dann eingesetzten Typ gespeichert – so zeigt der Laufzeit-Balken, wie lange z. B. NiMH gegenüber Lithium Ion im selben Gerät hält. Spannung voll/leer des Geräts kommen aus dem Typ × Anzahl, wenn im Gerät nichts eingetragen ist.</div>
    <div class="ggrid">${((this._d.types) || []).map(ty => {
      const m = devs.filter(d => d.bt === ty.id), s = st[ty.id] || {}, ch = BM_CHEM[ty.chemistry] || [ty.chemistry];
      return `<div class="plate gcard" style="--gc:${ty.color || '#4dc3ff'}">
        <h3><ha-icon icon="${ty.rechargeable ? 'mdi:battery-sync-outline' : 'mdi:battery-outline'}"></ha-icon>${esc(ty.label || bmTypeName(ty))}<small>${m.length} Geräte</small></h3>
        <div class="tspec"><span>${esc(ch[0])}</span><span>${esc(BM_SIZES[ty.size] || ty.size || '')}</span>${ty.voltage != null ? `<span>${fmtV(ty.voltage)} V</span>` : ''}${ty.v_empty != null ? `<span>leer ${fmtV(ty.v_empty)} V</span>` : ''}${ty.capacity ? `<span>${ty.capacity} mAh</span>` : ''}<span>${ty.rechargeable ? 'Akku' : 'Einweg'}</span></div>
        ${ty.note ? `<p>${esc(ty.note)}</p>` : ''}
        <div class="opt"><span><ha-icon icon="mdi:timer-sand"></ha-icon>Laufzeit</span><span style="font-family:'Share Tech Mono',monospace;color:#c9ccd2">${s.median != null ? `Ø ${fmtDur(s.median)} (${s.cycles} Batterie${s.cycles === 1 ? '' : 'n'})` : 'noch keine leer gewordene'}</span></div>
        <div class="members">${m.length ? m.sort((a, b) => a.n.localeCompare(b.n, 'de')).map(d => `<span class="${d.st === 'low' ? 'low' : ''}">${d.bc > 1 ? d.bc + '× ' : ''}${esc(d.n)}</span>`).join('') : '<span>keine Geräte</span>'}</div>
        ${admin ? `<div class="gfoot"><button class="btn sm" data-a="edittype:${esc(ty.id)}">Bearbeiten</button><button class="btn sm bad" data-a="deltype:${esc(ty.id)}">Löschen</button></div>` : ''}
      </div>`;
    }).join('')}
    ${admin ? '<div class="plate gcard" style="--gc:#4dc3ff;display:grid;place-items:center;min-height:160px"><button class="btn pri" data-a="newtype">＋ Neuer Batterietyp</button></div>' : ''}</div>`;
  }

  // ---------- Regeln ----------
  _tabRules() {
    const admin = this._admin(), s = this._d.settings, apps = Object.keys(this._hass.services.notify || {}).filter(x => x.startsWith('mobile_app_'));
    return `<div class="hint" style="margin:0 4px 12px">Jede Regel gilt für bestimmte Klassen (leer = alle). Passen mehrere Regeln, greifen alle. Geräte mit 🔕 werden nie gemeldet. Ist die Bedingung nicht erfüllt oder Ruhezeit, wartet die Meldung und kommt, sobald es passt.</div>
    <div class="rgrid">${this._d.rules.map(r => {
      const m = this._d.devices.filter(d => !d.excluded && (!r.classes.length || r.classes.some(c => d.classes.includes(c))));
      const open = m.filter(d => d.case).length;
      const sw = (path, on, icon, t, extra = '') => `<div class="opt"><span><ha-icon icon="${icon}"></ha-icon>${t}${extra}</span><div class="sw${on ? ' on' : ''}${admin ? '' : ' na'}" data-a="rset:${r.id}:${path}"></div></div>`;
      const ch = r.channels || {};
      const condTxt = r.cond_mode === 'always' ? 'immer' : r.cond_mode === 'home' ? 'nur wenn jemand zu Hause ist' : 'nur wenn niemand zu Hause ist';
      const condNow = r.cond_mode === 'always' ? true : (() => { const p = this._d.presence[r.cond_source]; return p && p.home != null ? (r.cond_mode === 'home' ? p.home : !p.home) : true; })();
      return `<div class="plate gcard" style="--gc:${r.active ? '#4dc3ff' : '#8c919a'}">
        <h3><ha-icon icon="mdi:bell-cog-outline"></ha-icon>${esc(r.name)}<small>${m.length} Geräte${open ? ` · <span style="color:#ffb347">${open} offen</span>` : ''}</small></h3>
        ${sw('active', r.active, 'mdi:power', 'Regel aktiv')}
        <div class="opt"><span><ha-icon icon="mdi:shape-outline"></ha-icon>Gilt für</span><div class="chips">${r.classes.length ? r.classes.map(c => { const k = this._cls(c); return `<span class="gch" style="--gc:${k.color}">${esc(k.name)}</span>`; }).join('') : '<span class="gch" style="--gc:#9a9ea6">alle Klassen</span>'}${admin ? `<button class="btn sm" style="height:22px;padding:0 8px" data-a="rclasses:${r.id}">✎</button>` : ''}</div></div>
        ${sw('channels.push', ch.push, 'mdi:cellphone-message', 'Push (App)', ` <small>${(r.push_targets && r.push_targets.length ? r.push_targets : s.push_targets || []).map(x => x.replace('mobile_app_', '')).join(', ') || 'kein Gerät'}</small>`)}
        ${sw('channels.email', ch.email, 'mdi:email-outline', 'E-Mail', ` <small>${esc(s.email_service || 'kein Dienst')}</small>`)}
        ${sw('channels.browser', ch.browser, 'mdi:monitor-dashboard', 'Browser / HA-Glocke')}
        ${sw('channels.html5', ch.html5, 'mdi:web', 'HTML5 Web-Push', ` <small>${esc(s.html5_service || 'nicht eingerichtet')}</small>`)}
        ${sw('critical', r.critical, 'mdi:alert-decagram-outline', 'Zeitkritisch (iPhone)')}
        <div class="opt"><span><ha-icon icon="mdi:timer-refresh-outline"></ha-icon>Erinnern alle <small>0 = nie</small></span><div class="num"><input type="number" min="0" max="720" step="1" value="${r.interval_h}" data-c="rnum:${r.id}:interval_h"${admin ? '' : ' disabled'}><em>h</em></div></div>
        <div class="opt"><span><ha-icon icon="mdi:home-account"></ha-icon>Melden</span><select data-c="rsel:${r.id}:cond_mode"${admin ? '' : ' disabled'}>${[['always', 'immer'], ['home', 'nur wenn jemand zu Hause'], ['away', 'nur wenn niemand zu Hause']].map(([k, t]) => `<option value="${k}"${r.cond_mode === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        ${r.cond_mode !== 'always' ? `<div class="opt"><span><ha-icon icon="mdi:radar"></ha-icon>Erkannt über</span><select data-c="rsel:${r.id}:cond_source"${admin ? '' : ' disabled'}><option value="presence"${r.cond_source === 'presence' ? ' selected' : ''}>Präsenz-Anzeige</option><option value="alarm"${r.cond_source === 'alarm' ? ' selected' : ''}>Alarmanlage</option></select></div>` : ''}
        ${apps.length > 1 && admin ? `<div class="opt"><span><ha-icon icon="mdi:cellphone-cog"></ha-icon>Eigene Push-Geräte</span><div class="chips">${apps.map(a => `<label class="cb" style="display:flex;gap:4px;align-items:center;margin:0;text-transform:none;font-size:12px;letter-spacing:0"><input type="checkbox" data-c="rpush:${r.id}:${a}"${(r.push_targets || []).includes(a) ? ' checked' : ''}>${esc(a.replace('mobile_app_', ''))}</label>`).join('')}</div></div>` : ''}
        <div class="cond" style="--cc:${condNow ? '#3ddc84' : '#ffb347'}">Meldet ${condTxt}${r.cond_mode !== 'always' ? ` (${r.cond_source === 'alarm' ? 'Alarmanlage' : 'Präsenz'}: ${esc(this._presTxt(r.cond_source))})` : ''} → jetzt <b>${condNow ? (this._d.quiet ? 'Ruhezeit – wartet' : 'würde melden') : 'wartet'}</b></div>
        ${admin ? `<div class="gfoot"><button class="btn sm" data-a="test:${r.id}">Testmeldung</button><button class="btn sm" data-a="renamerule:${r.id}">Umbenennen</button><button class="btn sm bad" data-a="delrule:${r.id}">Löschen</button></div>` : ''}
      </div>`;
    }).join('')}
    ${admin ? '<div class="plate gcard" style="--gc:#4dc3ff;display:grid;place-items:center;min-height:160px"><button class="btn pri" data-a="newrule">＋ Neue Regel</button></div>' : ''}</div>`;
  }

  // ---------- Einstellungen ----------
  _tabSettings() {
    if (!this._admin()) return '<div class="plate empty">Einstellungen benötigen ein Administrator-Konto.</div>';
    const h = this._hass, s = this._d.settings, svcs = Object.keys(h.services.notify || {}).sort();
    const mob = svcs.filter(x => x.startsWith('mobile_app_')), other = svcs.filter(x => !x.startsWith('mobile_app_') && !['notify', 'send_message', 'persistent_notification'].includes(x));
    const h5svcs = svcs.filter(x => /html5/.test(x));
    const pres = this._d.presence, db = this._d.db;
    const ents = dom => Object.keys(h.states).filter(e => dom.some(x => e.startsWith(x + '.'))).sort();
    const presOpts = (pres.presence.options && pres.presence.options.length ? pres.presence.options : [pres.presence.state].filter(Boolean));
    const homeSel = (key, opts, cur) => `<div class="svc">${opts.map(([v, t]) => `<label class="cb"><input type="checkbox" data-c="slist:${key}:${esc(v)}"${(cur || []).includes(v) ? ' checked' : ''}>${esc(t)}</label>`).join('')}</div>`;
    const num = (k, min, max, step, unit) => `<div class="num"><input type="number" min="${min}" max="${max}" step="${step}" value="${s[k]}" data-c="snum:${k}"><em>${unit}</em></div>`;
    return `
      <div class="plate set"><h3>Datenbank</h3>
        <div class="dbx" style="--dc:${db.connected ? '#3ddc84' : '#ffb347'}"><i></i>${db.connected ? 'MariaDB verbunden – alle Einstellungen, Zuordnungen, Tauschaufträge und der Verlauf liegen in der Datenbank.' : `Nicht verbunden – es wird mit der lokalen Kopie gearbeitet, Änderungen werden nachgetragen (${db.pending} ausstehend).`}</div>
        ${db.error ? `<div class="hint" style="color:#ffb347">${esc(db.error)}</div>` : ''}</div>
      <div class="plate set"><h3>Anwesenheit</h3><div class="hint">Für Regeln mit „nur wenn jemand / niemand zu Hause“.</div>
        <div class="grid">
          <div><label>Präsenz-Anzeige</label><select data-c="stext:presence_entity">${['', ...ents(['input_select', 'input_boolean', 'binary_sensor', 'group', 'person', 'zone', 'sensor'])].filter((e, i, a) => !e || /presence|praesenz|präsenz|anwesen|home|person|zone/i.test(e) || e === s.presence_entity).map(e => `<option value="${e}"${e === s.presence_entity ? ' selected' : ''}>${e || '– keine –'}</option>`).join('')}</select>
            <div class="hint">Jetzt: <b style="color:#f0f1f3">${esc(pres.presence.state || '–')}</b> → ${esc(this._presTxt('presence'))}</div></div>
          <div><label>Zählt als „zu Hause“</label>${homeSel('presence_home_states', presOpts.map(o => [o, o]), s.presence_home_states)}</div>
          <div><label>Alarmanlage</label><select data-c="stext:alarm_entity">${['', ...ents(['alarm_control_panel'])].map(e => `<option value="${e}"${e === s.alarm_entity ? ' selected' : ''}>${e || '– keine –'}</option>`).join('')}</select>
            <div class="hint">Jetzt: <b style="color:#f0f1f3">${esc(pres.alarm.state || '–')}</b> → ${esc(this._presTxt('alarm'))}</div></div>
          <div><label>Alarm-Zustände „zu Hause“</label>${homeSel('alarm_home_states', BM_ALARM, s.alarm_home_states)}</div>
        </div></div>
      <div class="plate set"><h3>Push-Geräte (Companion-App)</h3><div class="hint">Standard-Empfänger für Regeln mit „Push“ (pro Regel überschreibbar).</div>
        <div class="svc">${mob.length ? mob.map(x => `<label class="cb"><input type="checkbox" data-c="slist:push_targets:${x}"${(s.push_targets || []).includes(x) ? ' checked' : ''}>${esc(x.replace('mobile_app_', ''))}</label>`).join('') : '<span class="hint">Keine Companion-App gefunden.</span>'}</div></div>
      <div class="plate set"><h3>E-Mail &amp; HTML5</h3>
        <div class="grid"><div><label>E-Mail-Dienst</label><select data-c="stext:email_service"><option value="">– keine E-Mail –</option>${other.filter(x => !/html5/.test(x)).map(x => `<option value="${x}"${x === s.email_service ? ' selected' : ''}>notify.${esc(x)}</option>`).join('')}</select></div>
        <div><label>HTML5 Web-Push</label><select data-c="stext:html5_service"><option value="">– nicht verwenden –</option>${(h5svcs.length ? h5svcs : s.html5_service ? [s.html5_service] : []).map(x => `<option value="${x}"${x === s.html5_service ? ' selected' : ''}>notify.${esc(x)}</option>`).join('')}</select>
          ${h5svcs.length ? '' : '<div class="hint" style="color:#ffb347">Noch kein HTML5-Dienst (Integration „HTML5 Push Notifications“, HTTPS nötig).</div>'}</div></div></div>
      <div class="plate set"><h3>Schwellen &amp; Erkennung</h3>
        <div class="opt" style="border:0"><span><ha-icon icon="mdi:battery-arrow-down-outline"></ha-icon>Standard-Leer-Schwelle <small>wenn Klasse/Gerät keine hat</small></span>${num('default_threshold', 1, 80, 1, '%')}</div>
        <div class="opt"><span><ha-icon icon="mdi:battery-check-outline"></ha-icon>Volle Batterie ab <small>Tausch gilt als erkannt</small></span>${num('full_threshold', 50, 100, 5, '%')}</div>
        <div class="opt"><span><ha-icon icon="mdi:trending-up"></ha-icon>Vorzeitiger Wechsel: Anstieg mind.</span>${num('min_rise', 5, 90, 5, '%')}</div>
        <div class="opt"><span><ha-icon icon="mdi:lan-disconnect"></ha-icon>Offline-Geräte wie leere Batterie melden</span><div class="sw${s.offline_alert ? ' on' : ''}" data-a="sbool:offline_alert"></div></div>
        ${s.offline_alert ? `<div class="opt"><span><ha-icon icon="mdi:battery-unknown"></ha-icon>… nur wenn letzter Stand unter <small>Melder ohne Prozent: zuletzt „schwach“</small></span>${num('offline_level', 5, 100, 5, '%')}</div>` : ''}
        <div class="opt"><span><ha-icon icon="mdi:weather-night"></ha-icon>Ruhezeit <small>gleich = keine</small></span><div class="num"><input type="time" style="width:110px" value="${esc(s.quiet_from)}" data-c="stime:quiet_from"><em>–</em><input type="time" style="width:110px" value="${esc(s.quiet_to)}" data-c="stime:quiet_to"></div></div>
        <div class="opt"><span><ha-icon icon="mdi:shape-outline"></ha-icon>Klasse ohne Zuordnung</span><select data-c="stext:default_class">${this._d.classes.map(c => `<option value="${c.id}"${c.id === s.default_class ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="opt"><span><ha-icon icon="mdi:battery-charging"></ha-icon>Klasse für Akku-Geräte <small>Handy, Tablet …</small></span><select data-c="stext:akku_class">${this._d.classes.map(c => `<option value="${c.id}"${c.id === s.akku_class ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="hint">Getauscht = nach dem Wechsel mindestens „Volle Batterie ab“. Darunter erscheint das Gerät als <b style="color:#ffb347">TAUSCH?</b> (✓ bestätigt). Melder ohne Prozent: getauscht, sobald wieder „Batterie OK“. Vorzeitige Wechsel werden bei einem Sprung um den Mindest-Anstieg auf über „Volle Batterie ab“ erkannt. Geräte ohne Verbindung gelten nur als leer, wenn die Batterie vorher schon fast leer war – sonst ist es meist die Reichweite.</div></div>
      <div class="plate set"><h3>Battery-Notes-Vorschläge${this._flows.length ? ` <small style="color:#ffb347">${this._flows.length}</small>` : ''}</h3>
        <div class="hint">Battery Notes kennt für viele Modelle den Batterietyp und meldet z. T. Max.-/Min.-Spannung. Übernehmen legt den Eintrag an.</div>
        ${this._flows.length ? `<div class="foot" style="justify-content:flex-start;margin:0 0 6px"><button class="btn sm ok" data-a="flowall">Alle übernehmen (ohne Akkus)</button></div>${this._flows.map(f => {
          const tp = f.context.title_placeholders || {}, dev = this._d.devices.find(x => `bn_${x.k}` === f.context.unique_id);
          return `<div class="sug"><div><b>${esc(tp.name || f.flow_id)}</b><small>${esc([tp.manufacturer, tp.model, tp.model_id].filter(Boolean).join(' · '))}</small></div><div>${dev ? dev.classes.map(c => `<span class="gch" style="--gc:${this._cls(c).color}">${esc(this._cls(c).name)}</span>`).join(' ') : ''}</div>
            <div class="acts"><button class="btn sm ok" data-a="flowok:${f.flow_id}">Übernehmen</button><button class="btn sm" data-a="flowign:${f.flow_id}">Ignorieren</button></div></div>`;
        }).join('')}` : '<div class="hint" style="color:#3ddc84">Keine offenen Vorschläge.</div>'}</div>
      <div class="plate set"><h3>Ausgeblendete Geräte${this._d.hidden.length ? ` <small style="color:#9a9fa8">${this._d.hidden.length}</small>` : ''}</h3>
        <div class="hint">Tauchen nirgends auf und lösen nichts aus.</div>
        ${this._d.hidden.length ? `<div class="pick" style="max-height:260px">${this._d.hidden.map(x => `<div class="sug"><div><b>${esc(x.n)}</b><small>${esc(x.k)}</small></div><div>${esc(x.a || '')}</div><div class="acts"><button class="btn sm" data-a="unhide:${esc(x.k)}">Einblenden</button></div></div>`).join('')}</div>` : ''}</div>
      <div class="plate set"><h3>Prüfen</h3><div class="hint">Läuft bei jeder Änderung und jede Minute.</div>
        <div class="foot" style="justify-content:flex-start"><button class="btn pri" data-a="run">Jetzt prüfen</button><button class="btn" data-a="todo">To-do-Liste öffnen</button></div></div>`;
  }

  // ---------- Verlauf ----------
  async _loadEvents(more) {
    try {
      const before = more && this._events && this._events.length ? this._events[this._events.length - 1].id : undefined;
      const r = await this._ws('events', { limit: 200, ...(before ? { before } : {}) });
      this._events = more ? [...(this._events || []), ...r.events] : r.events;
      this._evMore = r.events.length === 200;
    } catch (e) { this._events = []; this._err = errText(e); }
    if (!this._dlg) this._render();
  }
  _tabEvents() {
    return `<div class="plate tools"><input type="search" data-i="evq" placeholder="Gerät oder Text suchen …" value="${esc(this._v.evq)}" style="width:320px"><span class="sp"></span><button class="btn sm" data-a="evreload">Neu laden</button></div>
      <div class="plate list" style="display:block;padding:4px 0" id="evl">${this._eventsHtml()}</div>
      ${this._evMore ? '<div class="foot" style="justify-content:center"><button class="btn sm" data-a="evmore">Ältere laden</button></div>' : ''}`;
  }
  _eventsHtml() {
    if (this._events === null) return '<div class="empty">Lade …</div>';
    const q = (this._v.evq || '').trim().toLowerCase();
    const rules = Object.fromEntries((this._d.rules || []).map(r => [r.id, r.name]));
    const ev = this._events.filter(e => !q || [e.name, e.message, e.kind, rules[e.rule]].join(' ').toLowerCase().includes(q));
    if (!ev.length) return '<div class="empty">Keine Einträge.</div>';
    return ev.map(e => {
      const [icon, col, title] = BM_EV[e.kind] || BM_EV.info;
      const head = e.name ? esc(e.name) : e.rule ? `Regel „${esc(rules[e.rule] || e.rule)}“` : title;
      const val = [e.level != null ? Math.round(e.level) + ' %' : '', e.voltage != null ? fmtV(e.voltage) + ' V' : ''].filter(Boolean).join(' · ');
      return `<div class="ev" style="--ec:${col}"><time>${esc(this._fmtDate(e.ts, true))}</time><ha-icon icon="${icon}"></ha-icon><div><b>${esc(title)} · ${head}${val ? ` <small style="color:#9a9fa8;font-family:'Share Tech Mono',monospace">${val}</small>` : ''}</b>${e.message ? `<pre>${esc(e.message)}</pre>` : ''}</div></div>`;
    }).join('');
  }

  // ---------- Dialoge ----------
  _dialog() {
    const f = this._dlg;
    if (f.kind === 'edit') {
      const d = f.d, h = this._hass, isEnt = d.k.includes('.');
      const volts = Object.keys(h.states).filter(e => e.startsWith('sensor.') && h.states[e].attributes.device_class === 'voltage').sort();
      return `<div class="ov"><div class="plate dlg"><h3>${esc(d.n)}</h3><div class="sub">${esc([d.h, d.m, d.a].filter(Boolean).join(' · '))}</div>
        <div class="grid">
          <div class="full ents">${[...(d.e || []), ...(d.ve ? [d.ve] : [])].map(id => { const s = h.states[id]; return `<div><span>${esc(id)}</span><span>${s ? esc(s.state) + (s.attributes.unit_of_measurement ? ' ' + esc(s.attributes.unit_of_measurement) : '') : '–'}</span></div>`; }).join('')}</div>
          ${this._fcBox(d)}
          <div class="full"><label>Klassen <span style="text-transform:none;letter-spacing:0;color:#979ca5">(keine Auswahl = automatisch)</span></label><div class="svc">${this._d.classes.map(c => `<label class="cb"><input type="checkbox" data-k="${c.id}"${f.classes.includes(c.id) ? ' checked' : ''}><span class="gch" style="--gc:${c.color}">${esc(c.name)}</span></label>`).join('')}</div></div>
          <div class="full"><label class="cb" style="display:flex;gap:8px;align-items:center;cursor:pointer;text-transform:none;letter-spacing:.3px;font-size:14px;color:#c9ccd2"><input type="checkbox" id="d-ex"${d.excluded ? ' checked' : ''}>🔕 Keine Benachrichtigung und kein Tauschauftrag (z. B. Handy, Tablet)</label></div>
          <div><label>Eigene Leer-Schwelle %</label><input id="d-thr" type="number" min="1" max="90" value="${f.thr ?? ''}" placeholder="aus Klasse (${d.s} %)"></div>
          <div><label>Anzeigename</label><input id="d-name" value="${esc(f.name)}" placeholder="${esc(d.n)}"></div>
          <div class="full"><label>Spannungs-Sensor</label><input id="d-ve" list="bm-volts" value="${esc(f.ve)}" placeholder="${esc(d.ve || 'automatisch')}"><datalist id="bm-volts">${volts.map(e => `<option value="${e}">`).join('')}</datalist></div>
          <div><label>Eingesetzter Batterietyp</label><select id="d-bt" data-c="dbt"><option value="">– nicht festgelegt –</option>${this._typeOpts(d, f.bt)}</select></div>
          <div><label>Anzahl Zellen</label><input id="d-bc" type="number" min="1" max="24" data-c="dbt" value="${esc(f.bc ?? '')}" placeholder="${esc(f.qty || 1)}"></div>
          <div><label>Spannung voll (V)</label><input id="d-vmax" type="number" step="0.05" min="0" value="${f.vmax ?? ''}" placeholder="${d.vmax != null ? fmtV(d.vmax) : 'z. B. 3,0'}"></div>
          <div><label>Spannung leer (V)</label><input id="d-vmin" type="number" step="0.05" min="0" value="${f.vmin ?? ''}" placeholder="${d.vmin != null ? fmtV(d.vmin) : 'z. B. 2,2'}"></div>
          <div class="full hint" id="d-tinfo">${this._typeInfo(f.bt, f.bc || f.qty)}</div>
          ${isEnt ? '<div class="full hint">Diese Entität gehört zu keinem Gerät – Battery Notes ist dafür nicht möglich.</div>' : `
          <div><label>Battery Notes: Typ</label><input id="d-t" list="bm-types" value="${esc(f.type)}" placeholder="z. B. AA, CR2032"><datalist id="bm-types">${BM_TYPES.map(t => `<option value="${t}">`).join('')}</datalist></div>
          <div><label>Anzahl</label><input id="d-q" type="number" min="1" max="12" value="${esc(f.qty)}"></div>
          ${d.bn ? `<div><label>Zuletzt getauscht am</label><input id="d-r" type="date" value="${esc(f.rep)}"></div><div class="hint" style="align-self:end">Leer lassen = unverändert.</div>` : '<div class="full hint">Speichern mit Typ legt einen Battery-Notes-Eintrag an.</div>'}`}
          <div class="full"><label>Notiz</label><input id="d-note" value="${esc(f.note)}" placeholder="z. B. Batteriefach hinten, Torx T6"></div>
          <div class="full"><label class="cb" style="display:flex;gap:8px;align-items:center;cursor:pointer;text-transform:none;letter-spacing:.3px;font-size:14px;color:#c9ccd2"><input type="checkbox" id="d-hid">Gerät ausblenden (nirgends anzeigen)</label></div>
        </div>
        ${f.err ? `<div class="err">${esc(f.err)}</div>` : ''}
        <div class="foot"><button class="btn" data-a="cancel">Abbrechen</button><button class="btn ok" data-a="saveedit">${this._busy ? 'Speichere …' : 'Speichern'}</button></div>
      </div></div>`;
    }
    if (f.kind === 'assign') {
      const c = this._cls(f.c), devs = this._d.devices.slice().sort((a, b) => (a.a || '~').localeCompare(b.a || '~', 'de') || a.n.localeCompare(b.n, 'de'));
      return `<div class="ov"><div class="plate dlg"><h3>Geräte → ${esc(c.name)}</h3><div class="sub">Häkchen = gehört (auch) zu dieser Klasse. Andere Klassen der Geräte bleiben erhalten.</div>
        <input type="search" data-i="pickq" placeholder="Suchen …">
        <div class="pick" id="pick">${devs.map(d => `<label class="cb" data-s="${esc((d.n + ' ' + d.a + ' ' + d.m).toLowerCase())}"><input type="checkbox" data-k="${esc(d.k)}"${d.classes.includes(f.c) ? ' checked' : ''}><span>${d.excluded ? '🔕 ' : ''}${esc(d.n)} <small>${esc(d.a || '')}</small></span><span>${d.classes.map(x => `<span class="gch" style="--gc:${this._cls(x).color}">${esc(this._cls(x).name)}</span>`).join(' ')}</span></label>`).join('')}</div>
        ${f.err ? `<div class="err">${esc(f.err)}</div>` : ''}
        <div class="foot"><button class="btn" data-a="cancel">Abbrechen</button><button class="btn ok" data-a="saveassign">${this._busy ? 'Speichere …' : 'Übernehmen'}</button></div>
      </div></div>`;
    }
    if (f.kind === 'class') {
      const c = f.c;
      return `<div class="ov"><div class="plate dlg"><h3>${c.id ? 'Klasse bearbeiten' : 'Neue Klasse'}</h3><div class="sub">${c.id ? esc(c.id) : 'z. B. Fensterkontakt, Alarmanlage, Thermostat, Rauchmelder'}</div>
        <div class="grid">
          <div><label>Name</label><input id="c-name" value="${esc(c.name || '')}"></div>
          <div><label>Leer-Schwelle %</label><input id="c-thr" type="number" min="1" max="90" value="${c.threshold ?? ''}" placeholder="Standard (${this._d.settings.default_threshold} %)"></div>
          <div class="full"><label>Symbol</label><input id="c-icon" value="${esc(c.icon || 'mdi:battery')}" placeholder="mdi:window-closed-variant"></div>
          <div class="full"><label>Farbe</label><div class="colr">${BM_PALETTE.map(x => `<b class="${x === (f.color || c.color) ? 'on' : ''}" style="--cc:${x}" data-a="ccol:${x}"></b>`).join('')}<input id="c-col" type="color" value="${esc(f.color || c.color || '#4dc3ff')}" style="width:44px;height:26px;padding:0"></div></div>
          <div class="full"><label>Beschreibung</label><input id="c-desc" value="${esc(c.description || '')}"></div>
        </div>
        ${f.err ? `<div class="err">${esc(f.err)}</div>` : ''}
        <div class="foot"><button class="btn" data-a="cancel">Abbrechen</button><button class="btn ok" data-a="saveclass">${this._busy ? 'Speichere …' : 'Speichern'}</button></div>
      </div></div>`;
    }
    if (f.kind === 'type') {
      const c = f.c, chem = c.chemistry || 'alkaline', ch = BM_CHEM[chem] || BM_CHEM.alkaline;
      return `<div class="ov"><div class="plate dlg"><h3>${c.id ? 'Batterietyp bearbeiten' : 'Neuer Batterietyp'}</h3><div class="sub">z. B. „1,2V - NiMH - Mignon (AA)“ – der Name ergibt sich automatisch, wenn das Feld leer bleibt</div>
        <div class="grid">
          <div><label>Chemie</label><select id="t-chem" data-c="tchem">${Object.entries(BM_CHEM).map(([k, v]) => `<option value="${k}"${k === chem ? ' selected' : ''}>${esc(v[0])}</option>`).join('')}</select></div>
          <div><label>Baugröße</label><select id="t-size" data-c="tsize">${Object.entries(BM_SIZES).map(([k, v]) => `<option value="${k}"${k === (c.size || 'AA') ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
          <div><label>Spannung voll (V je Zelle)</label><input id="t-v" type="number" step="0.05" min="0" value="${c.voltage ?? ch[1]}"></div>
          <div><label>Spannung leer (V je Zelle)</label><input id="t-ve" type="number" step="0.05" min="0" value="${c.v_empty ?? ch[2]}"></div>
          <div><label>Kapazität (mAh je Zelle)</label><input id="t-cap" type="number" step="10" min="0" value="${c.capacity ?? ''}" placeholder="z. B. 2000"></div>
          <div style="align-self:end"><label class="cb" style="display:flex;gap:8px;align-items:center;cursor:pointer;text-transform:none;letter-spacing:.3px;font-size:14px;color:#c9ccd2"><input type="checkbox" id="t-rc"${(c.rechargeable ?? ch[3]) ? ' checked' : ''}>wiederaufladbar (Akku)</label></div>
          <div class="full"><label>Name <span style="text-transform:none;letter-spacing:0;color:#979ca5">(leer = automatisch)</span></label><input id="t-name" value="${esc(c.name || '')}" placeholder="${esc(bmTypeName({ ...c, name: '', chemistry: chem, voltage: c.voltage ?? ch[1], size: c.size || 'AA' }))}"></div>
          <div class="full"><label>Farbe</label><div class="colr">${BM_PALETTE.map(x => `<b class="${x === (f.color || c.color) ? 'on' : ''}" style="--cc:${x}" data-a="ccol:${x}"></b>`).join('')}<input id="c-col" type="color" value="${esc(f.color || c.color || '#4dc3ff')}" style="width:44px;height:26px;padding:0"></div></div>
          <div class="full"><label>Notiz</label><input id="t-note" value="${esc(c.note || '')}" placeholder="z. B. Marke, Ladegerät"></div>
        </div>
        ${f.err ? `<div class="err">${esc(f.err)}</div>` : ''}
        <div class="foot"><button class="btn" data-a="cancel">Abbrechen</button><button class="btn ok" data-a="savetype">${this._busy ? 'Speichere …' : 'Speichern'}</button></div>
      </div></div>`;
    }
    if (f.kind === 'rclasses') {
      const r = this._d.rules.find(x => x.id === f.r);
      return `<div class="ov"><div class="plate dlg"><h3>${esc(r.name)}: gilt für</h3><div class="sub">Keine Auswahl = alle Klassen</div>
        <div class="pick" id="pick">${this._d.classes.map(c => `<label class="cb"><input type="checkbox" data-k="${c.id}"${r.classes.includes(c.id) ? ' checked' : ''}><span class="gch" style="--gc:${c.color}">${esc(c.name)}</span><small>${this._d.devices.filter(d => d.classes.includes(c.id)).length} Geräte</small></label>`).join('')}</div>
        <div class="foot"><button class="btn" data-a="cancel">Abbrechen</button><button class="btn ok" data-a="saverclasses">Übernehmen</button></div>
      </div></div>`;
    }
    return '';
  }
  _filterPick(q) {
    q = q.trim().toLowerCase();
    this.shadowRoot.querySelectorAll('#pick label.cb').forEach(l => { l.style.display = !q || (l.dataset.s || '').includes(q) ? '' : 'none'; });
  }

  // ---------- Aktionen ----------
  async _act(a, el) {
    const [cmd, ...rest] = a.split(':'), arg = rest.join(':'), h = this._hass;
    try {
      if (cmd === 'tab' || cmd === 'filter' || cmd === 'by') {
        if (cmd === 'filter' && this._v.tab !== 'geraete') this._v.tab = 'geraete';
        this._v[cmd] = cmd === 'filter' && this._v.filter === arg && arg !== 'alle' ? 'alle' : arg; this._save(); this._render(); return;
      }
      if (cmd === 'todo') { history.pushState(null, '', '/todo?entity_id=todo.batterien_tauschen'); window.dispatchEvent(new CustomEvent('location-changed')); return; }
      if (cmd === 'info') { this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: arg } })); return; }
      if (cmd === 'cancel') { this._dlg = null; this._render(); return; }
      if (cmd === 'run') { await this._ws('check'); this._toast('Geprüft'); return; }
      if (cmd === 'evreload') { this._events = null; this._render(); return; }
      if (cmd === 'evmore') { await this._loadEvents(true); return; }
      if (cmd === 'test') { await this._ws('rule/test', { rule_id: arg }); this._toast('Testmeldung gesendet'); return; }
      if (cmd === 'rset') {
        const [rid, path] = [rest[0], rest.slice(1).join(':')], r = JSON.parse(JSON.stringify(this._d.rules.find(x => x.id === rid)));
        const ks = path.split('.'); let o = r; for (const k of ks.slice(0, -1)) o = o[k] = o[k] || {};
        o[ks[ks.length - 1]] = !o[ks[ks.length - 1]];
        await this._ws('rule/save', { rule: r }); return;
      }
      if (cmd === 'sbool') { await this._ws('settings/save', { settings: { [arg]: !this._d.settings[arg] } }); return; }
      if (cmd === 'replaced') {
        const d = this._dev(arg); if (!d) return;
        if (!confirm(`Batterie bei „${d.n}“ als heute getauscht markieren?${d.case ? '\nDer Tauschauftrag wird geschlossen.' : ''}${d.st === 'low' ? '\n\nAchtung: Das Gerät meldet noch „leer“ – es wird erst wieder gemeldet, nachdem es einmal „OK“ war.' : ''}`)) return;
        await this._ws('case/confirm', { key: d.k }); this._toast('Tausch gespeichert'); return;
      }
      if (cmd === 'edit') {
        const d = this._dev(arg); if (!d) return;
        const x = /^(\d+)\s*[×x]\s*(.+)$/.exec(d.t || '');
        const r = d.r && !isNaN(new Date(String(d.r).replace(' ', 'T'))) ? new Date(String(d.r).replace(' ', 'T')).toISOString().slice(0, 10) : '';
        const own = (this._d.devices.find(y => y.k === d.k) || {}).own || [];
        this._dlg = { kind: 'edit', d, classes: own.slice(), type: x ? x[2] : (d.t || ''), qty: x ? x[1] : (d.t ? 1 : ''), rep: r, repOrig: r, bt: d.bt || '', bc: d.bt ? d.bc : '',
          thr: d.cfg.threshold, name: d.cfg.name, ve: d.cfg.voltage_entity, vmax: d.cfg.voltage_nominal, vmin: d.cfg.voltage_min, note: d.note || '' };
        this._render(); return;
      }
      if (cmd === 'saveedit') return this._saveEdit();
      if (cmd === 'assign') { this._dlg = { kind: 'assign', c: arg }; this._render(); return; }
      if (cmd === 'saveassign') {
        const keys = [...this.shadowRoot.querySelectorAll('#pick input[data-k]')].filter(b => b.checked).map(b => b.dataset.k);
        await this._withBusy(() => this._ws('class/assign', { class_id: this._dlg.c, keys })); return;
      }
      if (cmd === 'newclass') { this._dlg = { kind: 'class', c: { color: '#4dc3ff', icon: 'mdi:battery' } }; this._render(); return; }
      if (cmd === 'editclass') { this._dlg = { kind: 'class', c: { ...this._cls(arg) } }; this._render(); return; }
      if (cmd === 'ccol') { this._dlg.color = arg; const i = this.shadowRoot.getElementById('c-col'); if (i) i.value = arg; this.shadowRoot.querySelectorAll('.colr b').forEach(b => b.classList.toggle('on', b.dataset.a === a)); return; }
      if (cmd === 'saveclass') {
        const $ = id => this.shadowRoot.getElementById(id), c = this._dlg.c, name = $('c-name').value.trim();
        if (!name) { this._dlg.err = 'Bitte einen Namen angeben.'; this._render(); return; }
        const thr = $('c-thr').value.trim();
        await this._withBusy(() => this._ws('class/save', { class: { ...(c.id ? { id: c.id } : {}), name, threshold: thr === '' ? null : parseFloat(thr), icon: $('c-icon').value.trim() || 'mdi:battery', color: $('c-col').value, description: $('c-desc').value.trim() } }));
        return;
      }
      if (cmd === 'newtype') { this._dlg = { kind: 'type', c: { chemistry: 'nimh', size: 'AA', color: '#3ddc84' } }; this._render(); return; }
      if (cmd === 'edittype') { this._dlg = { kind: 'type', c: { ...this._type(arg) } }; this._render(); return; }
      if (cmd === 'savetype') {
        const $ = id => this.shadowRoot.getElementById(id), c = this._dlg.c, num = id => { const v = $(id).value.trim().replace(',', '.'); return v === '' ? null : parseFloat(v); };
        const ty = { ...(c.id ? { id: c.id } : {}), name: $('t-name').value.trim(), chemistry: $('t-chem').value, size: $('t-size').value, voltage: num('t-v'), v_empty: num('t-ve'),
          capacity: num('t-cap'), rechargeable: $('t-rc').checked, color: $('c-col').value, note: $('t-note').value.trim() };
        await this._withBusy(() => this._ws('type/save', { battery_type: ty })); return;
      }
      if (cmd === 'deltype') {
        const ty = this._type(arg), n = this._d.devices.filter(d => d.bt === arg).length;
        if (!confirm(`Batterietyp „${ty ? ty.label : arg}“ löschen?${n ? `\n${n} Geräte verlieren die Zuordnung.` : ''}\nFrühere Laufzeiten bleiben im Verlauf.`)) return;
        await this._ws('type/delete', { type_id: arg }); return;
      }
      if (cmd === 'delclass') {
        const c = this._cls(arg);
        if (!confirm(`Klasse „${c.name}“ löschen?\nDie Geräte verlieren nur diese Zuordnung, Regeln nur diesen Eintrag.`)) return;
        await this._ws('class/delete', { class_id: arg }); return;
      }
      if (cmd === 'newrule') {
        const name = prompt('Name der neuen Regel:', 'Neue Regel'); if (!name) return;
        await this._ws('rule/save', { rule: { name } }); return;
      }
      if (cmd === 'renamerule') {
        const r = this._d.rules.find(x => x.id === arg), name = prompt('Neuer Name:', r.name); if (!name) return;
        await this._ws('rule/save', { rule: { ...r, name } }); return;
      }
      if (cmd === 'delrule') {
        const r = this._d.rules.find(x => x.id === arg);
        if (!confirm(`Regel „${r.name}“ löschen?`)) return;
        await this._ws('rule/delete', { rule_id: arg }); return;
      }
      if (cmd === 'rclasses') { this._dlg = { kind: 'rclasses', r: arg }; this._render(); return; }
      if (cmd === 'saverclasses') {
        const r = this._d.rules.find(x => x.id === this._dlg.r), classes = [...this.shadowRoot.querySelectorAll('#pick input[data-k]')].filter(b => b.checked).map(b => b.dataset.k);
        await this._withBusy(() => this._ws('rule/save', { rule: { ...r, classes } })); return;
      }
      if (cmd === 'unhide') { await this._ws('device/save', { key: arg, hidden: false }); return; }
      if (cmd === 'flowok') { await this._withBusy(() => this._acceptFlow(arg), true); return; }
      if (cmd === 'flowign') { await this._withBusy(async () => { const f = this._flows.find(x => x.flow_id === arg); await h.callWS({ type: 'config_entries/ignore_flow', flow_id: arg, title: (f && f.context.title_placeholders && f.context.title_placeholders.name) || 'Battery Note' }); await this._loadFlows(); }, true); return; }
      if (cmd === 'flowall') {
        const akku = this._d.settings.akku_class;
        const list = this._flows.filter(f => { const d = this._d.devices.find(x => `bn_${x.k}` === f.context.unique_id); return !d || !d.classes.includes(akku); });
        if (!confirm(`${list.length} Vorschläge übernehmen?`)) return;
        await this._withBusy(async () => { for (const f of list) { try { await this._acceptFlow(f.flow_id, true); } catch (e) { console.warn('Battery Notes', f, e); } } await this._loadFlows(); }, true);
        return;
      }
    } catch (e) { alert('Fehler: ' + errText(e)); }
    void el;
  }
  async _chg(c, el) {
    const [cmd, ...rest] = c.split(':');
    const s = this._d && this._d.settings;
    try {
      if (cmd === 'tchem') {
        const ch = BM_CHEM[el.value], $ = id => this.shadowRoot.getElementById(id); if (!ch) return;
        $('t-v').value = ch[1]; $('t-ve').value = ch[2]; $('t-rc').checked = ch[3];
        $('t-name').placeholder = bmTypeName({ chemistry: el.value, voltage: ch[1], size: $('t-size').value }); return;
      }
      if (cmd === 'dbt') {
        const $ = id => this.shadowRoot.getElementById(id), t = this._type($('d-bt').value), f = this._dlg || {};
        const n = Math.max(1, parseInt($('d-bc').value, 10) || parseInt(f.qty, 10) || 1);
        if (t && el.id === 'd-bt' && !$('d-bc').value) $('d-bc').value = n;
        if (t && t.voltage != null) $('d-vmax').value = Math.round(t.voltage * n * 100) / 100;
        if (t && t.v_empty != null) $('d-vmin').value = Math.round(t.v_empty * n * 100) / 100;
        $('d-tinfo').innerHTML = this._typeInfo($('d-bt').value, n); return;
      }
      if (cmd === 'tsize') {
        const $ = id => this.shadowRoot.getElementById(id), v = parseFloat($('t-v').value.replace(',', '.'));
        $('t-name').placeholder = bmTypeName({ chemistry: $('t-chem').value, voltage: isNaN(v) ? null : v, size: el.value }); return;
      }
      if (cmd === 'akkus') { this._v.akkus = el.checked; this._save(); this._renderList(); return; }
      if (cmd === 'snum') { const v = parseFloat(el.value); if (!isNaN(v)) await this._ws('settings/save', { settings: { [rest[0]]: v } }); return; }
      if (cmd === 'stext') { await this._ws('settings/save', { settings: { [rest[0]]: el.value } }); return; }
      if (cmd === 'stime') { if (el.value) await this._ws('settings/save', { settings: { [rest[0]]: el.value.slice(0, 5) } }); return; }
      if (cmd === 'slist') {
        const key = rest[0], val = rest.slice(1).join(':'), cur = (s[key] || []).slice();
        const next = el.checked ? [...new Set([...cur, val])] : cur.filter(x => x !== val);
        await this._ws('settings/save', { settings: { [key]: next } }); return;
      }
      const r = rest[0] && this._d.rules.find(x => x.id === rest[0]);
      if (cmd === 'rnum' && r) { const v = parseFloat(el.value); if (!isNaN(v)) await this._ws('rule/save', { rule: { ...r, [rest[1]]: v } }); return; }
      if (cmd === 'rsel' && r) { await this._ws('rule/save', { rule: { ...r, [rest[1]]: el.value } }); return; }
      if (cmd === 'rpush' && r) {
        const a = rest.slice(1).join(':'), cur = r.push_targets || [];
        await this._ws('rule/save', { rule: { ...r, push_targets: el.checked ? [...new Set([...cur, a])] : cur.filter(x => x !== a) } }); return;
      }
    } catch (e) { alert('Fehler: ' + errText(e)); }
  }
  async _withBusy(fn, keepDlg) {
    this._busy = true; this._render();
    try { await fn(); if (!keepDlg) this._dlg = null; } catch (e) { if (this._dlg) this._dlg.err = errText(e); else alert('Fehler: ' + errText(e)); }
    this._busy = false; this._render();
  }
  _toast(msg) { this.dispatchEvent(new CustomEvent('hass-notification', { bubbles: true, composed: true, detail: { message: msg } })); }

  async _saveEdit() {
    const f = this._dlg, d = f.d, $ = id => this.shadowRoot.getElementById(id), h = this._hass;
    const nv = id => { const v = $(id) && $(id).value.trim(); return v === '' || v == null ? null : parseFloat(v.replace(',', '.')); };
    const patch = {
      key: d.k, classes: [...this.shadowRoot.querySelectorAll('.dlg .svc input[data-k]')].filter(b => b.checked).map(b => b.dataset.k),
      excluded: $('d-ex').checked, threshold: nv('d-thr'), voltage_nominal: nv('d-vmax'), voltage_min: nv('d-vmin'),
      voltage_entity: $('d-ve').value.trim(), note: $('d-note').value.trim(), name: $('d-name').value.trim(),
    };
    if ($('d-hid').checked) patch.hidden = true;
    patch.battery_type = $('d-bt').value || null;
    const bcv = parseInt($('d-bc').value, 10); patch.battery_count = bcv > 0 ? bcv : (parseInt(f.qty, 10) || 1);
    const type = $('d-t') ? $('d-t').value.trim() : '', qty = $('d-q') ? parseInt($('d-q').value, 10) || 1 : 1, rep = $('d-r') ? $('d-r').value : '';
    await this._withBusy(async () => {
      await this._ws('device/save', patch);
      if (!d.k.includes('.') && type && (type !== f.type || String(qty) !== String(f.qty) || !d.bn)) await this._bnNote(d.k, type, qty);
      if (d.bn && rep && rep !== f.repOrig) await h.callService('battery_notes', 'set_battery_replaced', { device_id: d.k, datetime_replaced: rep + 'T12:00:00' });
    });
  }

  // ---------- Battery Notes ----------
  async _bnEntry() {
    const list = await this._hass.callWS({ type: 'config_entries/get', domain: 'battery_notes' });
    if (!list.length) throw new Error('Battery Notes ist nicht eingerichtet.');
    return list[0].entry_id;
  }
  async _drive(base, r, values) {
    const fill = schema => {
      const out = {};
      (schema || []).forEach(f => {
        if (f.type === 'expandable') { out[f.name] = fill(f.schema); return; }
        if (values[f.name] !== undefined) out[f.name] = values[f.name];
        else if (f.description && f.description.suggested_value != null) out[f.name] = f.description.suggested_value;
        else if (f.default !== undefined) out[f.name] = f.default;
      });
      return out;
    };
    for (let i = 0; i < 8 && r; i++) {
      if (r.type === 'create_entry' || (r.type === 'abort' && /success/.test(r.reason || ''))) return r;
      if (r.type === 'abort') throw new Error('Battery Notes: ' + r.reason);
      if (r.type === 'menu') { r = await this._hass.callApi('POST', `${base}/${r.flow_id}`, { next_step_id: (r.menu_options || []).includes('device') ? 'device' : r.menu_options[0] }); continue; }
      if (r.type === 'form') {
        if (r.errors && Object.keys(r.errors).length && i > 0) throw new Error('Battery Notes: ' + JSON.stringify(r.errors));
        r = await this._hass.callApi('POST', `${base}/${r.flow_id}`, fill(r.data_schema)); continue;
      }
      throw new Error('Unerwarteter Schritt: ' + r.type);
    }
    throw new Error('Battery Notes: Flow nicht abgeschlossen');
  }
  async _bnNote(deviceId, type, qty) {
    const entry = await this._bnEntry(), h = this._hass;
    let sub = null;
    try { sub = (await h.callWS({ type: 'config_entries/subentries/list', entry_id: entry })).find(s => s.unique_id === `bn_${deviceId}`); } catch (e) { /* ältere HA */ }
    const base = 'config/config_entries/subentries/flow';
    const r = await h.callApi('POST', base, { handler: [entry, 'battery_note'], show_advanced_options: false, ...(sub ? { subentry_id: sub.subentry_id } : {}) });
    await this._drive(base, r, { device_id: deviceId, battery_type: type, battery_quantity: qty });
  }
  async _acceptFlow(flowId, quiet) {
    const base = 'config/config_entries/flow';
    const r = await this._hass.callApi('GET', `${base}/${flowId}`);
    await this._drive(base, r, {});
    if (!quiet) await this._loadFlows();
  }
}
if (!customElements.get('batterie-manager')) customElements.define('batterie-manager', BatterieManager);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'batterie-manager')) window.customCards.push({ type: 'batterie-manager', name: 'Batterie-Manager', description: 'Alle Batteriegeräte, Klassen, Regeln und Benachrichtigungen' });
console.info(`%c BATTERIE-MANAGER %c v${BM_VERSION} `, 'background:#3ddc84;color:#000;font-weight:700', 'background:#222;color:#3ddc84');
