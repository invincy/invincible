(() => {
  "use strict";

  const state = { mode: "pen", ids: new Set(), box: null, gesture: null };
  const batchHistory = window.__journalBatchHistory ||= { undo: [], redo: [] };
  const $ = (selector, root = document) => root.querySelector(selector);
  const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const icons = {
    select: svg('<path d="m5 3 14 9-7 2-3 7z"/><path d="m13 14 4 5"/>'),
    text: svg('<path d="M5 5h14M12 5v14M8 19h8"/>'),
    handwriting: svg('<path d="M3 17c3-7 5-10 7-10 3 0-1 10 2 10 2 0 3-5 5-5 2 0 0 5 4 5"/><path d="M3 21h18"/>')
  };

  function api() { return window.__journalApi; }
  function point(event) {
    const rect = api().container().getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function toolButton(name, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-btn advanced-tool";
    button.dataset.mode = name;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = icons[name];
    button.addEventListener("click", () => activate(name));
    return button;
  }
  function install() {
    const toolbar = $(".toolbar");
    const canvas = $("#live-canvas");
    if (!toolbar || !canvas || !api()) return;
    const group = toolbar.firstElementChild;
    if (group && !group.querySelector(".advanced-tool")) {
      group.append(toolButton("select", "Select and transform"));
      group.append(toolButton("text", "Add text"));
      group.append(toolButton("handwriting", "Handwriting tools"));
    }
    if (!toolbar.dataset.advancedToolSync) {
      toolbar.dataset.advancedToolSync = "true";
      toolbar.addEventListener("click", () => requestAnimationFrame(() => requestAnimationFrame(syncModeFromApp)), true);
    }
    if (!canvas.dataset.advancedTools) {
      canvas.dataset.advancedTools = "true";
      canvas.addEventListener("pointerdown", canvasDown, true);
      canvas.addEventListener("dblclick", editSelectedText, true);
    }
    updateButtons();
  }
  function activate(mode) {
    if (state.mode !== mode) clearSelection();
    state.mode = mode;
    api().setTool(mode);
    updateButtons();
    if (mode === "handwriting") showHandwritingPanel();
    else closePanel();
  }
  function syncModeFromApp() {
    const current = api()?.tool?.();
    if (!current || current === state.mode) return updateButtons();
    state.mode = current;
    clearSelection();
    if (current !== "handwriting") closePanel();
    updateButtons();
  }
  function updateButtons() {
    document.querySelectorAll(".advanced-tool").forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  }

  function strokeBounds(strokes) {
    const points = strokes.flatMap((stroke) => stroke.points || []);
    if (!points.length) return null;
    const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(24, Math.max(...xs) - Math.min(...xs)), height: Math.max(24, Math.max(...ys) - Math.min(...ys)) };
  }
  function selectedStrokes() { return api().strokes().filter((stroke) => state.ids.has(stroke.id)); }
  function selectRect(rect) {
    const right = rect.x + rect.width, bottom = rect.y + rect.height;
    state.ids = new Set(api().strokes().filter((stroke) => (stroke.points || []).some((p) => p.x >= rect.x && p.x <= right && p.y >= rect.y && p.y <= bottom)).map((stroke) => stroke.id));
    showSelection();
  }
  function distanceToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (!dx && !dy) return Math.hypot(p.x - a.x, p.y - a.y);
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function hitStroke(at) {
    const strokes = api().strokes();
    for (let index = strokes.length - 1; index >= 0; index--) {
      const stroke = strokes[index], points = stroke.points || [];
      if (!points.length) continue;
      if (stroke.tool === "text") {
        const size = stroke.fontSize || 26, lines = String(stroke.text || "").split("\n");
        const width = Math.max(...lines.map((line) => line.length), 1) * size * .62;
        if (at.x >= points[0].x - 8 && at.x <= points[0].x + width + 8 && at.y >= points[0].y - 8 && at.y <= points[0].y + lines.length * size * 1.3 + 8) return stroke;
      }
      const tolerance = Math.max(10, (stroke.width || 2) / 2 + 7);
      if (points.length === 1 && Math.hypot(at.x - points[0].x, at.y - points[0].y) <= tolerance) return stroke;
      for (let i = 0; i < points.length - 1; i++) if (distanceToSegment(at, points[i], points[i + 1]) <= tolerance) return stroke;
    }
    return null;
  }
  function clearSelection() {
    state.ids.clear();
    state.box?.remove();
    state.box = null;
  }
  function showSelection() {
    state.box?.remove();
    const bounds = strokeBounds(selectedStrokes());
    if (!bounds) return;
    const box = document.createElement("div");
    box.className = "journal-selection";
    Object.assign(box.style, { left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });
    box.innerHTML = '<span class="selection-count"></span><button class="selection-handle" type="button" aria-label="Resize selection"></button><div class="selection-actions"><button data-action="duplicate" title="Duplicate">⧉</button><label title="Recolour"><input type="color" value="#111827"></label><button data-action="delete" title="Delete">⌫</button></div>';
    $(".selection-count", box).textContent = `${state.ids.size} selected`;
    box.addEventListener("pointerdown", moveStart);
    $(".selection-handle", box).addEventListener("pointerdown", resizeStart);
    $("[data-action=delete]", box).addEventListener("click", deleteSelected);
    $("[data-action=duplicate]", box).addEventListener("click", duplicateSelected);
    $("input[type=color]", box).addEventListener("change", (event) => recolourSelected(event.target.value));
    api().container().append(box);
    state.box = box;
  }

  function canvasDown(event) {
    if (!["select", "text", "handwriting"].includes(state.mode)) {
      batchHistory.redo.length = 0;
      return;
    }
    if (event.pointerType === "touch") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.mode === "text") return placeText(point(event));
    if (state.mode === "handwriting") return;
    clearSelection();
    const start = point(event);
    const marquee = document.createElement("div");
    marquee.className = "journal-marquee";
    api().container().append(marquee);
    const move = (moveEvent) => {
      const now = point(moveEvent);
      const rect = { x: Math.min(start.x, now.x), y: Math.min(start.y, now.y), width: Math.abs(now.x - start.x), height: Math.abs(now.y - start.y) };
      Object.assign(marquee.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      state.gesture = rect;
    };
    const up = () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      marquee.remove();
      const rect = state.gesture || { x: start.x, y: start.y, width: 0, height: 0 };
      state.gesture = null;
      if (rect.width < 8 && rect.height < 8) {
        const hit = hitStroke(start);
        state.ids = hit ? new Set([hit.id]) : new Set();
        showSelection();
      } else selectRect(rect);
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
  }

  function moveStart(event) {
    if (event.target.closest("button, input, label")) return;
    event.preventDefault(); event.stopPropagation();
    const start = { x: event.clientX, y: event.clientY };
    const original = { left: parseFloat(state.box.style.left), top: parseFloat(state.box.style.top) };
    const move = (e) => { state.box.style.left = `${original.left + e.clientX - start.x}px`; state.box.style.top = `${original.top + e.clientY - start.y}px`; };
    const up = (e) => { window.removeEventListener("pointermove", move, true); window.removeEventListener("pointerup", up, true); transformSelected({ dx: e.clientX - start.x, dy: e.clientY - start.y, sx: 1, sy: 1 }); };
    window.addEventListener("pointermove", move, true); window.addEventListener("pointerup", up, true);
  }
  function resizeStart(event) {
    event.preventDefault(); event.stopPropagation();
    const bounds = strokeBounds(selectedStrokes());
    const start = { x: event.clientX, y: event.clientY };
    const move = (e) => {
      const scale = Math.max(.2, Math.max((bounds.width + e.clientX - start.x) / bounds.width, (bounds.height + e.clientY - start.y) / bounds.height));
      state.box.style.width = `${bounds.width * scale}px`; state.box.style.height = `${bounds.height * scale}px`; state.gesture = { scale, bounds };
    };
    const up = () => { window.removeEventListener("pointermove", move, true); window.removeEventListener("pointerup", up, true); const g = state.gesture; state.gesture = null; if (g) transformSelected({ dx: 0, dy: 0, sx: g.scale, sy: g.scale, origin: g.bounds }); };
    window.addEventListener("pointermove", move, true); window.addEventListener("pointerup", up, true);
  }
  function transformSelected({ dx, dy, sx, sy, origin }) {
    const bounds = origin || strokeBounds(selectedStrokes());
    selectedStrokes().forEach((stroke) => api().save({ ...stroke, fontSize: stroke.fontSize ? stroke.fontSize * sx : stroke.fontSize, width: stroke.width ? stroke.width * Math.sqrt(sx * sy) : stroke.width, points: (stroke.points || []).map((p) => ({ ...p, x: bounds.x + (p.x - bounds.x) * sx + dx, y: bounds.y + (p.y - bounds.y) * sy + dy })) }));
    redrawSoon(); setTimeout(showSelection, 90);
  }
  function recolourSelected(color) { selectedStrokes().forEach((stroke) => api().save({ ...stroke, color })); redrawSoon(); }
  function duplicateSelected() {
    const clones = selectedStrokes().map((stroke) => ({ ...stroke, id: crypto.randomUUID(), createdAtMs: Date.now(), points: (stroke.points || []).map((p) => ({ ...p, x: p.x + 24, y: p.y + 24 })) }));
    clones.forEach((stroke) => api().save(stroke)); state.ids = new Set(clones.map((stroke) => stroke.id)); setTimeout(showSelection, 80);
  }
  function deleteSelected() {
    const strokes = selectedStrokes().map((stroke) => structuredClone(stroke));
    if (!strokes.length) return;
    batchHistory.undo.push({ type: "delete", strokes });
    batchHistory.redo.length = 0;
    strokes.forEach((stroke) => api().remove(stroke.id));
    clearSelection();
  }
  function redrawSoon() { requestAnimationFrame(() => requestAnimationFrame(() => api()?.redraw())); }

  function placeText(at, existing = null) {
    const editor = document.createElement("textarea");
    editor.className = "journal-text-editor";
    editor.value = existing?.text || "";
    editor.placeholder = "Type here…";
    Object.assign(editor.style, { left: `${at.x}px`, top: `${at.y}px`, color: existing?.color || "#111827", fontSize: `${existing?.fontSize || 26}px` });
    api().container().append(editor); editor.focus();
    const commit = () => {
      const text = editor.value.trim(); editor.remove(); if (!text) return;
      const stroke = existing ? { ...existing, text } : { id: crypto.randomUUID(), tool: "text", text, color: "#111827", opacity: 1, fontSize: 26, width: 26, createdAtMs: Date.now(), points: [{ x: at.x, y: at.y, pressure: .5, timestamp: Date.now() }] };
      api().save(stroke);
    };
    editor.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "Escape") editor.remove(); });
    editor.addEventListener("blur", commit, { once: true });
  }
  function editSelectedText(event) {
    if (state.mode !== "select") return;
    const textStroke = selectedStrokes().find((stroke) => stroke.tool === "text");
    if (!textStroke) return;
    event.preventDefault(); event.stopImmediatePropagation();
    placeText(textStroke.points[0], textStroke);
  }

  function showHandwritingPanel() {
    closePanel();
    const panel = document.createElement("div");
    panel.className = "advanced-panel tool-panel";
    panel.innerHTML = '<div class="panel-label">Handwriting</div><button data-action="beautify">✨ Beautify Ink</button><button data-action="recognise">Aa Convert to Text <small>Beta</small></button><div class="advanced-status"></div>';
    panel.querySelector("[data-action=beautify]").addEventListener("click", beautify);
    panel.querySelector("[data-action=recognise]").addEventListener("click", recognise);
    $(".toolbar").append(panel);
  }
  function closePanel() { $(".advanced-panel")?.remove(); }
  function targetInk() {
    const chosen = selectedStrokes().filter((stroke) => stroke.tool === "pen" || stroke.tool === "highlighter");
    return chosen.length ? chosen : api().strokes().filter((stroke) => stroke.tool === "pen" || stroke.tool === "highlighter");
  }
  function beautify() {
    const strokes = targetInk();
    strokes.forEach((stroke) => {
      let points = stroke.points || [];
      for (let pass = 0; pass < 2 && points.length > 3; pass++) {
        const smooth = [points[0]];
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i], b = points[i + 1];
          smooth.push({ ...a, x: a.x * .75 + b.x * .25, y: a.y * .75 + b.y * .25 });
          smooth.push({ ...b, x: a.x * .25 + b.x * .75, y: a.y * .25 + b.y * .75 });
        }
        smooth.push(points[points.length - 1]); points = smooth;
      }
      api().save({ ...stroke, points });
    });
    redrawSoon(); status(`${strokes.length} stroke${strokes.length === 1 ? "" : "s"} beautified`);
  }
  function status(message) { const node = $(".advanced-status"); if (node) node.textContent = message; }
  function loadOCR() {
    if (window.Tesseract) return Promise.resolve();
    status("Loading recognition engine…");
    return new Promise((resolve, reject) => { const script = document.createElement("script"); script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"; script.onload = resolve; script.onerror = reject; document.head.append(script); });
  }
  async function recognise() {
    const strokes = targetInk(); const bounds = strokeBounds(strokes);
    if (!bounds) return status("Select handwriting first");
    try {
      await loadOCR(); status("Reading handwriting…");
      const padding = 18, canvas = document.createElement("canvas");
      canvas.width = Math.ceil(bounds.width + padding * 2); canvas.height = Math.ceil(bounds.height + padding * 2);
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.translate(-bounds.x + padding, -bounds.y + padding);
      strokes.forEach((stroke) => api().render(ctx, stroke));
      const result = await window.Tesseract.recognize(canvas, "eng");
      const text = result?.data?.text?.trim(); if (!text) return status("No text recognised");
      const edited = window.prompt("Check and edit recognised text", text); if (!edited) return status("Conversion cancelled");
      const textStroke = { id: crypto.randomUUID(), tool: "text", text: edited, color: "#111827", opacity: 1, fontSize: 26, width: 26, createdAtMs: Date.now(), points: [{ x: bounds.x, y: bounds.y, pressure: .5, timestamp: Date.now() }] };
      api().save(textStroke); strokes.forEach((stroke) => api().remove(stroke.id)); state.ids = new Set([textStroke.id]); setTimeout(showSelection, 120); status("Converted to editable text");
    } catch (error) { console.error(error); status("Recognition failed—your ink is unchanged"); }
  }

  const observer = new MutationObserver(install);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", install);
  install();
})();
