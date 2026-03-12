(() => {
  const canvas = document.getElementById("circuitCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const statusText = document.getElementById("statusText");
  const selectedInfo = document.getElementById("selectedInfo");
  const resistorControls = document.getElementById("resistorControls");
  const switchControls = document.getElementById("switchControls");
  const resistanceInput = document.getElementById("resistanceInput");
  const toggleSwitchBtn = document.getElementById("toggleSwitchBtn");

  const TYPE = { SOURCE: "source", SWITCH: "switch", RESISTOR: "resistor", LED: "led" };
  const comps = [];
  const wires = [];
  let nextId = 1;
  let selectedId = null;
  let drag = null;
  let wireStart = null;
  let mouse = { x: 0, y: 0 };
  let sim = { solved: false, hasSource: false, ledCurrents: new Map(), litCount: 0 };

  function setCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeComp(type) {
    const id = nextId++;
    return {
      id,
      type,
      x: 120 + ((id - 1) % 4) * 140,
      y: 110 + Math.floor((id - 1) / 4) * 90,
      width: 88,
      height: 40,
      resistance: 220,
      closed: false
    };
  }

  function terminalPos(c, side) {
    const s = c.width / 2;
    return { x: c.x + (side === "a" ? -s : s), y: c.y };
  }

  function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      x = e.changedTouches[0].clientX - rect.left;
      y = e.changedTouches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    mouse = { x, y };
    return mouse;
  }

  function handlePointerDown(e) {
    mouse = getMouse(e);
    const t = hitTerminal(mouse);
    if (t) {
      if (!wireStart) wireStart = t;
      else {
        addWire(wireStart, t);
        wireStart = null;
        rerender();
      }
      return;
    }
    const c = hitComp(mouse);
    if (c) {
      selectedId = c.id;
      drag = { id: c.id, dx: mouse.x - c.x, dy: mouse.y - c.y };
      rerender();
      return;
    }
    selectedId = null;
    wireStart = null;
    rerender();
  }

  function handlePointerMove(e) {
    mouse = getMouse(e);
    if (!drag) {
      draw();
      return;
    }
    const c = comps.find((x) => x.id === drag.id);
    if (!c) return;
    c.x = mouse.x - drag.dx;
    c.y = mouse.y - drag.dy;
    clampCompToBounds(c);
    rerender();
  }

  function handlePointerUp() {
    drag = null;
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function hitTerminal(p) {
    for (let i = comps.length - 1; i >= 0; i -= 1) {
      const c = comps[i];
      const a = terminalPos(c, "a");
      const b = terminalPos(c, "b");
      if (dist(p, a) <= 10) return { componentId: c.id, terminal: "a" };
      if (dist(p, b) <= 10) return { componentId: c.id, terminal: "b" };
    }
    return null;
  }

  function hitComp(p) {
    for (let i = comps.length - 1; i >= 0; i -= 1) {
      const c = comps[i];
      const l = c.x - c.width / 2;
      const t = c.y - c.height / 2;
      if (p.x >= l && p.x <= l + c.width && p.y >= t && p.y <= t + c.height) return c;
    }
    return null;
  }

  function sameTerminal(t1, t2) {
    return t1.componentId === t2.componentId && t1.terminal === t2.terminal;
  }

  function clampCompToBounds(c) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const hw = c.width / 2;
    const hh = c.height / 2;
    c.x = Math.max(hw, Math.min(w - hw, c.x));
    c.y = Math.max(hh, Math.min(h - hh, c.y));
  }

  function addWire(a, b) {
    if (sameTerminal(a, b)) return;
    if (wires.some((w) => (sameTerminal(w.a, a) && sameTerminal(w.b, b)) || (sameTerminal(w.a, b) && sameTerminal(w.b, a)))) return;
    wires.push({ a, b });
  }

  class UF {
    constructor(n) {
      this.parent = Array.from({ length: n }, (_, i) => i);
    }
    find(x) {
      if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
      return this.parent[x];
    }
    union(a, b) {
      const pa = this.find(a);
      const pb = this.find(b);
      if (pa !== pb) this.parent[pa] = pb;
    }
  }

  function solve(A, b) {
    const n = A.length;
    const M = A.map((r, i) => [...r, b[i]]);
    const eps = 1e-10;
    for (let col = 0; col < n; col += 1) {
      let pivot = col;
      for (let r = col + 1; r < n; r += 1) {
        if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
      }
      if (Math.abs(M[pivot][col]) < eps) return null;
      [M[col], M[pivot]] = [M[pivot], M[col]];
      const div = M[col][col];
      for (let k = col; k <= n; k += 1) M[col][k] /= div;
      for (let r = 0; r < n; r += 1) {
        if (r === col) continue;
        const f = M[r][col];
        if (Math.abs(f) < eps) continue;
        for (let k = col; k <= n; k += 1) M[r][k] -= f * M[col][k];
      }
    }
    return M.map((r) => r[n]);
  }

  function runSimulation() {
    const source = comps.find((c) => c.type === TYPE.SOURCE);
    const ledCurrents = new Map();
    if (!source) return { solved: false, hasSource: false, ledCurrents, litCount: 0 };

    const tMap = new Map();
    let tCount = 0;
    comps.forEach((c) => {
      tMap.set(`${c.id}:a`, tCount++);
      tMap.set(`${c.id}:b`, tCount++);
    });
    const uf = new UF(tCount);
    wires.forEach((w) => uf.union(tMap.get(`${w.a.componentId}:${w.a.terminal}`), tMap.get(`${w.b.componentId}:${w.b.terminal}`)));

    const rootNode = new Map();
    let nodeCount = 0;
    function nodeOf(compId, side) {
      const root = uf.find(tMap.get(`${compId}:${side}`));
      if (!rootNode.has(root)) rootNode.set(root, nodeCount++);
      return rootNode.get(root);
    }

    const sp = nodeOf(source.id, "a");
    const sm = nodeOf(source.id, "b");
    if (sp === sm) return { solved: false, hasSource: true, ledCurrents, litCount: 0 };

    const edges = comps.filter((c) => c.id !== source.id).map((c) => ({ comp: c, n1: nodeOf(c.id, "a"), n2: nodeOf(c.id, "b") }));
    const ground = sm;
    const vars = new Map();
    let vc = 0;
    for (let n = 0; n < nodeCount; n += 1) if (n !== ground) vars.set(n, vc++);
    const sourceVar = vc;
    const N = vc + 1;
    const A = Array.from({ length: N }, () => new Array(N).fill(0));
    const z = new Array(N).fill(0);

    function addR(n1, n2, r) {
      const g = 1 / Math.max(r, 1e-6);
      const i = n1 === ground ? -1 : vars.get(n1);
      const j = n2 === ground ? -1 : vars.get(n2);
      if (i >= 0) A[i][i] += g;
      if (j >= 0) A[j][j] += g;
      if (i >= 0 && j >= 0) {
        A[i][j] -= g;
        A[j][i] -= g;
      }
    }

    edges.forEach((e) => {
      if (e.comp.type === TYPE.RESISTOR) addR(e.n1, e.n2, e.comp.resistance);
      if (e.comp.type === TYPE.SWITCH) addR(e.n1, e.n2, e.comp.closed ? 0.05 : 1e9);
      if (e.comp.type === TYPE.LED) addR(e.n1, e.n2, 220);
    });

    const p = sp === ground ? -1 : vars.get(sp);
    const m = sm === ground ? -1 : vars.get(sm);
    if (p >= 0) {
      A[p][sourceVar] += 1;
      A[sourceVar][p] += 1;
    }
    if (m >= 0) {
      A[m][sourceVar] -= 1;
      A[sourceVar][m] -= 1;
    }
    z[sourceVar] = 5;

    const ans = solve(A, z);
    if (!ans) return { solved: false, hasSource: true, ledCurrents, litCount: 0 };

    let litCount = 0;
    edges.forEach((e) => {
      if (e.comp.type !== TYPE.LED) return;
      const v1 = e.n1 === ground ? 0 : ans[vars.get(e.n1)];
      const v2 = e.n2 === ground ? 0 : ans[vars.get(e.n2)];
      const vf = v1 - v2;
      const current = vf > 1.8 ? (vf - 1.8) / 220 : 0;
      ledCurrents.set(e.comp.id, Math.max(0, current));
      if (current > 0.0005) litCount += 1;
    });
    return { solved: true, hasSource: true, ledCurrents, litCount };
  }

  function ledAlpha(id) {
    const i = sim.ledCurrents.get(id) || 0;
    return Math.max(0.18, Math.min(1, i / 0.02));
  }

  function updateStatus() {
    if (!sim.hasSource) statusText.textContent = "状态：没有电源，LED 不亮";
    else if (!sim.solved) statusText.textContent = "状态：电路不完整或开路";
    else statusText.textContent = sim.litCount > 0 ? `状态：有电，亮起 ${sim.litCount} 个 LED` : "状态：有电源但 LED 未导通";
  }

  function updateSelectedPanel() {
    resistorControls.classList.add("hidden");
    switchControls.classList.add("hidden");
    const c = comps.find((x) => x.id === selectedId);
    if (!c) {
      selectedInfo.textContent = "未选中";
      return;
    }
    const names = { source: "电源", switch: "开关", resistor: "电阻", led: "LED" };
    selectedInfo.textContent = `#${c.id} ${names[c.type]}`;
    if (c.type === TYPE.RESISTOR) {
      resistorControls.classList.remove("hidden");
      resistanceInput.value = String(c.resistance);
    }
    if (c.type === TYPE.SWITCH) {
      switchControls.classList.remove("hidden");
      toggleSwitchBtn.textContent = c.closed ? "开关已闭合 · 点击断开" : "开关已断开 · 点击闭合";
      toggleSwitchBtn.className = "btn block toggle-switch-btn " + (c.closed ? "switch-closed" : "switch-open");
    }
  }

  function drawGrid() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.strokeStyle = "#f0f4fb";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawGrid();

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    wires.forEach((w) => {
      const c1 = comps.find((c) => c.id === w.a.componentId);
      const c2 = comps.find((c) => c.id === w.b.componentId);
      if (!c1 || !c2) return;
      const p1 = terminalPos(c1, w.a.terminal);
      const p2 = terminalPos(c2, w.b.terminal);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    comps.forEach((c) => {
      if (selectedId === c.id) {
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x - c.width / 2 - 4, c.y - c.height / 2 - 4, c.width + 8, c.height + 8);
      }
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (c.type === TYPE.SOURCE) {
        // 电池形状：左正极（长条）右负极（短条）
        ctx.fillStyle = "#fbbf24";
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 2;
        ctx.fillRect(-20, -16, 8, 32);
        ctx.strokeRect(-20, -16, 8, 32);
        ctx.fillRect(12, -10, 8, 20);
        ctx.strokeRect(12, -10, 8, 20);
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 12px Arial";
        ctx.fillText("+", -16, -22);
        ctx.fillText("-", 16, -16);
      } else if (c.type === TYPE.SWITCH) {
        // 带拨杆的开关：闭合时绿色接通，断开时橙色明显分开
        ctx.lineWidth = 4;
        if (c.closed) {
          ctx.strokeStyle = "#16a34a";
          ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        } else {
          ctx.strokeStyle = "#d97706";
          ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        }
        ctx.beginPath();
        ctx.moveTo(-24, -10);
        ctx.lineTo(-24, 10);
        ctx.moveTo(24, -10);
        ctx.lineTo(24, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(-26, -14, 52, 28);
        ctx.fill();
        ctx.strokeStyle = c.closed ? "#16a34a" : "#d97706";
        ctx.stroke();
        if (c.closed) {
          ctx.beginPath();
          ctx.moveTo(-24, 0);
          ctx.lineTo(24, 0);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(-24, 0);
          ctx.lineTo(0, -14);
          ctx.stroke();
        }
      } else if (c.type === TYPE.RESISTOR) {
        // 标准锯齿形电阻符号
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-24, 0);
        ctx.lineTo(-16, -6);
        ctx.lineTo(-8, 6);
        ctx.lineTo(0, -6);
        ctx.lineTo(8, 6);
        ctx.lineTo(16, -6);
        ctx.lineTo(24, 0);
        ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.font = "12px Arial";
        ctx.fillText(`${Math.round(c.resistance)}Ω`, 0, 22);
      } else if (c.type === TYPE.LED) {
        const alpha = ledAlpha(c.id);
        // 发光光晕（亮度越高光晕越强）
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 28);
        gradient.addColorStop(0, `rgba(255,100,80,${alpha * 0.9})`);
        gradient.addColorStop(0.4, `rgba(255,80,60,${alpha * 0.5})`);
        gradient.addColorStop(0.7, `rgba(255,60,40,${alpha * 0.2})`);
        gradient.addColorStop(1, "rgba(255,50,30,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        // LED 主体：三角形发光体，颜色随亮度从暗红到亮红/黄
        const r = Math.floor(80 + alpha * 120);
        const g = Math.floor(40 + alpha * 80);
        const b = Math.floor(30 + alpha * 30);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-4, -12);
        ctx.lineTo(-4, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#374151";
        ctx.stroke();
        // 两条引脚
        ctx.beginPath();
        ctx.moveTo(4, -14);
        ctx.lineTo(4, 14);
        ctx.moveTo(-18, 0);
        ctx.lineTo(-24, 0);
        ctx.stroke();
      }
      ctx.restore();

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      const name = c.type === "source" ? "电源 5V" : c.type === "switch" ? (c.closed ? "开关(闭合)" : "开关(断开)") : c.type === "resistor" ? "电阻" : "LED";
      ctx.fillStyle = "#475569";
      ctx.font = "13px Arial";
      ctx.fillText(name, c.x - 32, c.y - 24);

      ["a", "b"].forEach((side) => {
        const p = terminalPos(c, side);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.8, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
      });
    });

    if (wireStart) {
      const c = comps.find((x) => x.id === wireStart.componentId);
      if (c) {
        const s = terminalPos(c, wireStart.terminal);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "#2563eb";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function rerender() {
    sim = runSimulation();
    updateStatus();
    updateSelectedPanel();
    draw();
  }

  canvas.addEventListener("mousedown", handlePointerDown);
  canvas.addEventListener("mousemove", handlePointerMove);
  canvas.addEventListener("mouseup", handlePointerUp);
  canvas.addEventListener("mouseleave", handlePointerUp);
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
  canvas.addEventListener("touchmove", (e) => { e.preventDefault(); handlePointerMove(e); }, { passive: false });
  canvas.addEventListener("touchend", (e) => { if (e.changedTouches.length) handlePointerUp(); }, { passive: true });
  canvas.addEventListener("touchcancel", handlePointerUp);
  canvas.addEventListener("dblclick", (e) => {
    const c = hitComp(getMouse(e));
    if (c && c.type === TYPE.SWITCH) {
      c.closed = !c.closed;
      selectedId = c.id;
      rerender();
    }
  });

  document.getElementById("addSourceBtn").addEventListener("click", () => {
    const c = makeComp(TYPE.SOURCE);
    clampCompToBounds(c);
    comps.push(c);
    rerender();
  });
  document.getElementById("addSwitchBtn").addEventListener("click", () => {
    const c = makeComp(TYPE.SWITCH);
    clampCompToBounds(c);
    comps.push(c);
    rerender();
  });
  document.getElementById("addResistorBtn").addEventListener("click", () => {
    const c = makeComp(TYPE.RESISTOR);
    clampCompToBounds(c);
    comps.push(c);
    rerender();
  });
  document.getElementById("addLedBtn").addEventListener("click", () => {
    const c = makeComp(TYPE.LED);
    clampCompToBounds(c);
    comps.push(c);
    rerender();
  });
  document.getElementById("clearWiresBtn").addEventListener("click", () => { wires.length = 0; wireStart = null; rerender(); });
  document.getElementById("clearAllBtn").addEventListener("click", () => { comps.length = 0; wires.length = 0; selectedId = null; wireStart = null; rerender(); });
  document.getElementById("deleteSelectedBtn").addEventListener("click", () => {
    if (selectedId == null) return;
    const i = comps.findIndex((c) => c.id === selectedId);
    if (i >= 0) comps.splice(i, 1);
    for (let w = wires.length - 1; w >= 0; w -= 1) {
      if (wires[w].a.componentId === selectedId || wires[w].b.componentId === selectedId) wires.splice(w, 1);
    }
    selectedId = null;
    rerender();
  });

  resistanceInput.addEventListener("change", () => {
    const c = comps.find((x) => x.id === selectedId);
    if (!c || c.type !== TYPE.RESISTOR) return;
    c.resistance = Math.max(1, Math.min(10000, Number(resistanceInput.value) || 220));
    rerender();
  });

  toggleSwitchBtn.addEventListener("click", () => {
    const c = comps.find((x) => x.id === selectedId);
    if (!c || c.type !== TYPE.SWITCH) return;
    c.closed = !c.closed;
    rerender();
  });

  window.addEventListener("resize", () => {
    setCanvasSize();
    comps.forEach(clampCompToBounds);
    draw();
  });

  const svgSource = '<svg class="tutorial-comp-svg" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="5" width="12" height="40" fill="#fbbf24" stroke="#92400e"/><rect x="58" y="15" width="12" height="20" fill="#fbbf24" stroke="#92400e"/><text x="16" y="18" font-size="10" fill="#1e293b">+</text><text x="64" y="28" font-size="10" fill="#1e293b">-</text></svg>';
  const svgSwitch = '<svg class="tutorial-comp-svg" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="10" x2="20" y2="40" stroke="#374151" stroke-width="3"/><line x1="60" y1="10" x2="60" y2="40" stroke="#374151" stroke-width="3"/><line x1="20" y1="25" x2="60" y2="25" stroke="#16a34a" stroke-width="3"/></svg>';
  const svgResistor = '<svg class="tutorial-comp-svg" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><path d="M0 25 L12 19 L24 31 L36 19 L48 31 L60 19 L72 31 L80 25" fill="none" stroke="#374151" stroke-width="2"/><text x="40" y="45" font-size="10" fill="#475569" text-anchor="middle">220Ω</text></svg>';
  const svgLed = '<svg class="tutorial-comp-svg" viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="15" width="12" height="20" fill="#ef4444" stroke="#374151"/><polygon points="30,10 50,25 30,40" fill="#f87171" stroke="#374151"/><line x1="50" y1="15" x2="50" y2="35" stroke="#374151" stroke-width="2"/><line x1="30" y1="25" x2="20" y2="25" stroke="#374151" stroke-width="2"/></svg>';

  const tutorialSteps = [
    {
      title: "欢迎来到电路实验室",
      content: "<p>在这里你可以学习电路基础知识，并动手搭建简单电路。让我们先认识一下各种电子元件和连线方法。</p>"
    },
    {
      title: "电源（电池）",
      content: '<div class="tutorial-with-img"><div class="tutorial-img-wrap">' + svgSource + '</div><div><p><strong>电源</strong>是电路的能量来源，像电池一样提供电压。</p><p>• 左侧长条是<strong>正极（+）</strong>，右侧短条是<strong>负极（-）</strong></p><p>• 电流从正极流出，经过用电器，流回负极</p><p>• 本实验使用 5V 电源</p></div></div>'
    },
    {
      title: "开关",
      content: '<div class="tutorial-with-img"><div class="tutorial-img-wrap">' + svgSwitch + '</div><div><p><strong>开关</strong>用于控制电路的通断。</p><p>• <strong>闭合</strong>时：电路接通，电流可以流过（显示为绿色）</p><p>• <strong>断开</strong>时：电路断开，电流无法通过（显示为橙色）</p><p>• 双击画布上的开关，或选中后点击右侧「切换开关」按钮来改变状态</p></div></div>'
    },
    {
      title: "电阻",
      content: '<div class="tutorial-with-img"><div class="tutorial-img-wrap">' + svgResistor + '</div><div><p><strong>电阻</strong>用于限制电流大小，保护电路。</p><p>• 符号是锯齿形折线</p><p>• 单位是欧姆（Ω），数值越大阻碍越大</p><p>• LED 电路中通常需要 220Ω 左右的电阻，防止电流过大烧坏 LED</p></div></div>'
    },
    {
      title: "LED 灯",
      content: '<div class="tutorial-with-img"><div class="tutorial-img-wrap">' + svgLed + '</div><div><p><strong>LED</strong>（发光二极管）是一种会发光的电子元件。</p><p>• 有<strong>正负极</strong>：三角形尖端为负极，长脚为正极，电流必须从正极流入才能发光</p><p>• 接对方向：LED 会亮，亮度随电流变化</p><p>• 接反方向：LED 不亮</p></div></div>'
    },
    {
      title: "如何连线",
      content: "<p><strong>连线步骤：</strong></p><p>1. 点击一个元件的<strong>端点</strong>（黑色圆点）开始连线</p><p>2. 移动鼠标会看到虚线跟随</p><p>3. 再点击另一个元件的端点，完成连线</p><p>4. 连线形成<strong>闭合回路</strong>后，电流才能流通，LED 才会亮</p><p>• 可拖拽元件调整位置</p><p>• 双击开关可切换开/关状态</p>"
    },
    {
      title: "开始实验",
      content: "<p>教学完成！点击下方按钮进入自由操作，动手搭建你的第一个电路吧。</p><p>建议：添加电源 → 开关 → 电阻 → LED，然后依次连线形成回路。</p>"
    }
  ];

  const overlay = document.getElementById("tutorialOverlay");
  const tutorialTitle = document.getElementById("tutorialTitle");
  const tutorialContent = document.getElementById("tutorialContent");
  const tutorialPrev = document.getElementById("tutorialPrev");
  const tutorialNext = document.getElementById("tutorialNext");
  const tutorialSkip = document.getElementById("tutorialSkip");

  let tutorialIndex = 0;

  function showTutorialStep(i) {
    tutorialIndex = i;
    const step = tutorialSteps[i];
    tutorialTitle.textContent = step.title;
    tutorialContent.innerHTML = step.content;
    tutorialPrev.style.display = i === 0 ? "none" : "inline-block";
    tutorialNext.textContent = i === tutorialSteps.length - 1 ? "开始实验" : "下一步";
  }

  function closeTutorial() {
    overlay.classList.add("hidden");
  }

  document.getElementById("tutorialBtn").addEventListener("click", () => {
    tutorialIndex = 0;
    showTutorialStep(0);
    overlay.classList.remove("hidden");
  });

  tutorialSkip.addEventListener("click", closeTutorial);

  tutorialPrev.addEventListener("click", () => {
    if (tutorialIndex > 0) showTutorialStep(tutorialIndex - 1);
  });

  tutorialNext.addEventListener("click", () => {
    if (tutorialIndex < tutorialSteps.length - 1) {
      showTutorialStep(tutorialIndex + 1);
    } else {
      closeTutorial();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeTutorial();
  });

  setCanvasSize();
  rerender();
})();
