const CSS = `
.ui-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: #e8e8f2;
  user-select: none;
}
.ui-layer * { pointer-events: auto; }

.panel {
  position: absolute;
  background: rgba(18, 20, 32, 0.88);
  border: 1px solid rgba(120, 140, 200, 0.35);
  border-radius: 8px;
  padding: 10px 12px;
  backdrop-filter: blur(4px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}

.unit-panel { left: 14px; bottom: 14px; min-width: 200px; }
.target-panel { right: 14px; bottom: 14px; min-width: 180px; }
.panel h3 { font-size: 15px; margin-bottom: 2px; }
.panel .sub { font-size: 12px; opacity: 0.7; margin-bottom: 8px; }

.bar { height: 8px; border-radius: 4px; background: rgba(0,0,0,0.5); margin: 4px 0; overflow: hidden; }
.bar > span { display: block; height: 100%; transition: width 0.2s; }
.bar.hp > span { background: linear-gradient(90deg,#4caf6a,#7fe39a); }
.bar.mp > span { background: linear-gradient(90deg,#4a78d6,#7fb0ff); }
.stat-row { font-size: 11px; opacity: 0.85; display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.statuses { font-size: 11px; color: #ffd34d; margin-top: 4px; min-height: 14px; }

.action-menu {
  left: 50%; transform: translateX(-50%); bottom: 16px;
  display: flex; gap: 8px; padding: 8px;
}
.btn {
  background: rgba(40, 50, 80, 0.95);
  border: 1px solid rgba(140,160,220,0.5);
  color: #eee; font-size: 14px; font-weight: 600;
  padding: 8px 16px; border-radius: 6px; cursor: pointer;
  transition: background 0.12s, transform 0.05s;
}
.btn:hover { background: rgba(70, 90, 140, 1); }
.btn:active { transform: translateY(1px); }
.btn[disabled] { opacity: 0.4; cursor: not-allowed; }
.btn.small { padding: 6px 10px; font-size: 13px; }

.submenu {
  left: 50%; transform: translateX(-50%); bottom: 70px;
  display: flex; flex-direction: column; gap: 6px; max-height: 50vh; overflow-y: auto;
  min-width: 240px;
}
.submenu .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.submenu .row-left { display: flex; align-items: center; gap: 8px; }
.submenu .cost { font-size: 12px; opacity: 0.8; }

.icon { image-rendering: pixelated; image-rendering: crisp-edges; vertical-align: middle; flex: none; }
.weapon-line { display: flex; align-items: center; gap: 6px; }

.turn-bar {
  left: 50%; transform: translateX(-50%); top: 12px;
  display: flex; gap: 6px; align-items: center; padding: 6px 10px;
}
.turn-bar .label { font-size: 11px; opacity: 0.7; margin-right: 4px; }
.turn-chip {
  width: 30px; height: 30px; border-radius: 6px; display: flex; overflow: hidden;
  align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
  border: 2px solid transparent; color: #10121c;
}
.turn-chip.first { border-color: #ffd34d; box-shadow: 0 0 8px rgba(255,211,77,0.7); }
.turn-chip.enemy { outline: 2px solid #ff5a5a; outline-offset: -2px; }
.chip-portrait { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; image-rendering: crisp-edges; }

.toast {
  left: 50%; transform: translateX(-50%); top: 58px;
  font-size: 14px; padding: 6px 14px; opacity: 0; transition: opacity 0.2s;
  background: rgba(10,12,20,0.9);
}
.toast.show { opacity: 1; }

.banner {
  inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(6, 8, 16, 0.7);
}
.banner-card {
  background: rgba(20, 24, 40, 0.97);
  border: 1px solid rgba(140,160,220,0.5);
  border-radius: 14px; padding: 28px 36px; text-align: center; max-width: 520px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.6);
}
.banner-card h1 { font-size: 28px; margin-bottom: 10px; }
.banner-card p { font-size: 15px; opacity: 0.88; line-height: 1.5; margin-bottom: 18px; }
.banner-card .btn { font-size: 16px; padding: 10px 24px; }

.hint { position: absolute; left: 50%; transform: translateX(-50%); bottom: 78px;
  font-size: 12px; opacity: 0.65; }

/* Party / intermission screen */
.party-screen { inset: 0; background: rgba(8,10,18,0.96); overflow-y: auto; padding: 24px; }
.party-screen h1 { text-align: center; font-size: 24px; margin-bottom: 6px; }
.party-screen .sub { text-align: center; opacity: 0.7; margin-bottom: 20px; }
.party-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; max-width: 1100px; margin: 0 auto; }
.unit-card { background: rgba(22,26,42,0.95); border: 1px solid rgba(120,140,200,0.3); border-radius: 10px; padding: 14px; }
.unit-card h3 { font-size: 17px; margin-bottom: 2px; }
.unit-card .role { font-size: 12px; opacity: 0.7; margin-bottom: 8px; }
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.card-head .icon { background: rgba(0,0,0,0.25); border-radius: 6px; padding: 2px; }
.wlabel { display: flex; align-items: center; gap: 6px; }
.skill-icons { display: flex; gap: 4px; margin-top: 4px; }
.unit-card label { font-size: 12px; opacity: 0.8; display: block; margin: 8px 0 3px; }
.unit-card select { width: 100%; background: #1a1e30; color: #eee; border: 1px solid #455; border-radius: 5px; padding: 5px; }
.unit-card .skills { font-size: 12px; opacity: 0.85; margin-top: 6px; }
.unit-card .jpline { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.party-footer { text-align: center; margin: 24px 0 8px; }
.inv-line { text-align:center; font-size: 13px; opacity: 0.85; margin-top: 10px; }
.crit { color: #ffd34d; }
`;

let injected = false;
export function injectStyles(): void {
  if (injected) return;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}
