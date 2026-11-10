// Decorative only: one full-screen triangle strip, no textures or input listeners.
const canvas = document.querySelector('.tts-forest');

if (canvas) {
  const vertexSource = `attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
  const fragmentSource = `#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 resolution;
    uniform float time;

    float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
    float hill(float x, float base, float amplitude) {
      return base + amplitude * (0.50 * sin(x * 7.0 + 0.6) + 0.25 * sin(x * 15.0 - 0.8) + 0.15 * sin(x * 26.0));
    }
    float segment(vec2 p, vec2 a, vec2 b) {
      vec2 pa = p - a, ba = b - a;
      return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
    }
    // Pines have distinct trunks and overlapping tiered branches, with varied heights.
    float forest(vec2 uv, float count, float base, float height, float seed) {
      float cell = floor(uv.x * count);
      float tree = 0.0;
      for (int i = -1; i <= 1; i++) {
        float id = cell + float(i);
        float x = (id + 0.5 + (hash(id + seed) - 0.5) * 0.5) / count;
        float h = height * (0.72 + 0.54 * hash(id + seed + 17.0));
        float ground = hill(x, base, 0.025);
        float y = (uv.y - ground) / h;
        float dx = abs(uv.x - x) * count;
        float branch = max(max((1.0-y) * 0.34, (0.76-y) * 0.48), (0.52-y) * 0.62);
        float foliage = step(0.13, y) * step(y, 1.0) * step(dx, max(0.0, branch));
        float trunk = step(0.0, y) * step(y, 0.4) * step(dx, 0.035);
        tree = max(tree, max(foliage, trunk));
      }
      return tree;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      float x = uv.x, y = uv.y;
      vec3 color = mix(vec3(0.075, 0.16, 0.20), vec3(0.025, 0.065, 0.105), smoothstep(0.35, 1.0, y));
      float haze = exp(-pow((x - 0.62) * 3.0, 2.0) - pow((y - 0.59) * 5.0, 2.0));
      color += vec3(0.08, 0.13, 0.13) * haze;
      float cloud = smoothstep(0.25, 0.8, sin(x * 12.0 + sin(x * 19.0)) * 0.5 + 0.5);
      color += vec3(0.018, 0.027, 0.03) * cloud * exp(-pow((y - 0.78) * 12.0, 2.0));

      // One long, soft pulse rather than flashes: no full-screen luminance change.
      float glow = 0.48 + 0.24 * pow(max(0.0, sin(time * 0.20)), 4.0);
      float bolt = min(segment(uv, vec2(0.76, 0.94), vec2(0.73, 0.83)),
                   min(segment(uv, vec2(0.73, 0.83), vec2(0.755, 0.85)),
                   min(segment(uv, vec2(0.755, 0.85), vec2(0.715, 0.71)),
                       segment(uv, vec2(0.738, 0.81), vec2(0.78, 0.77)))));
      color += vec3(0.22, 0.40, 0.39) * glow * (exp(-bolt * 105.0) * 0.35 + exp(-bolt * 600.0) * 0.65);

      float distant = hill(x, 0.50, 0.065);
      color = mix(color, vec3(0.15, 0.27, 0.28), step(y, distant));
      color = mix(color, vec3(0.105, 0.21, 0.22), forest(uv, 24.0, 0.48, 0.105, 10.0));
      float middle = hill(x, 0.40, 0.048);
      color = mix(color, vec3(0.075, 0.16, 0.17), step(y, middle));
      color = mix(color, vec3(0.045, 0.115, 0.12), forest(uv, 18.0, 0.38, 0.19, 40.0));
      float land = hill(x, 0.30, 0.035);
      color = mix(color, vec3(0.032, 0.085, 0.09), step(y, land));

      // River narrows at its source and curves toward the viewer. Highlights move
      // downstream along its length, changing position, not just brightness.
      float depth = clamp((0.42 - y) / 0.42, 0.0, 1.0);
      float centre = 0.53 + 0.055 * sin(depth * 5.0) + depth * 0.035;
      float halfWidth = 0.012 + 0.23 * pow(depth, 1.25);
      float river = step(y, 0.42) * (1.0 - smoothstep(halfWidth - 0.003, halfWidth + 0.003, abs(x - centre)));
      float bank = step(y, 0.42) * (1.0 - smoothstep(halfWidth + 0.005, halfWidth + 0.015, abs(x - centre)));
      color = mix(color, vec3(0.12, 0.22, 0.19), bank * 0.65);
      float across = (x - centre) / max(halfWidth, 0.01);
      float current = depth * 31.0 - time * 0.65 + 1.5 * sin(across * 5.0 + depth * 5.0);
      float streak = pow(max(0.0, sin(current)), 12.0) * (0.4 + 0.6 * pow(max(0.0, 1.0 - abs(across)), 1.5));
      float fine = pow(max(0.0, sin(depth * 61.0 - time * 0.95 + across * 4.0)), 18.0);
      vec3 water = mix(vec3(0.035, 0.14, 0.16), vec3(0.12, 0.31, 0.31), 0.45 + 0.25 * (1.0 - depth));
      water += vec3(0.12, 0.22, 0.21) * (streak * 0.55 + fine * 0.20);
      color = mix(color, water, river);

      // Dark framing trees stay away from the river and keep foreground copy legible.
      float nearTrees = forest(uv, 9.0, 0.15, 0.36, 90.0);
      nearTrees *= (1.0 - smoothstep(0.19, 0.31, x)) + smoothstep(0.69, 0.81, x);
      color = mix(color, vec3(0.018, 0.055, 0.065), clamp(nearTrees, 0.0, 1.0));
      color *= 0.88 + 0.12 * smoothstep(0.0, 0.3, min(x, 1.0 - x));
      gl_FragColor = vec4(color, 1.0);
    }`;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pixelBudget = 750000;
  let gl, program, buffer, resolution, timeUniform, timeWrap = 128;
  let timer = 0, frame = 0, failed = false;

  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
  }

  function shader(type, source) {
    const result = gl.createShader(type);
    if (!result) throw new Error('Shader unavailable');
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      gl.deleteShader(result);
      throw new Error('Shader compilation failed');
    }
    return result;
  }

  function initialise() {
    let vertex, fragment;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL unavailable');
      timeWrap = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? 2048 : 128;
      vertex = shader(gl.VERTEX_SHADER, vertexSource);
      fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program linking failed');
      buffer = gl.createBuffer();
      if (!buffer) throw new Error('Buffer unavailable');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      resolution = gl.getUniformLocation(program, 'resolution');
      timeUniform = gl.getUniformLocation(program, 'time');
      failed = false;
      schedule(true);
    } catch (_) {
      failed = true;
      stop();
      canvas.classList.remove('is-ready');
      if (gl && buffer) gl.deleteBuffer(buffer);
      if (gl && program) gl.deleteProgram(program);
      buffer = program = null;
    } finally {
      if (gl && vertex) gl.deleteShader(vertex);
      if (gl && fragment) gl.deleteShader(fragment);
    }
  }

  function draw() {
    frame = 0;
    if (failed || document.hidden || !gl || gl.isContextLost()) return;
    const width = Math.max(1, innerWidth), height = Math.max(1, innerHeight);
    const dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 1 : 1.25, Math.sqrt(pixelBudget / (width * height)));
    // Floor rather than round so the pixel budget remains a strict upper bound.
    const w = Math.max(1, Math.floor(width * dpr)), h = Math.max(1, Math.floor(height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(resolution, w, h);
    gl.uniform1f(timeUniform, motion.matches ? 0 : (performance.now() / 1000) % timeWrap);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.classList.add('is-ready');
    if (!motion.matches) schedule(false);
  }

  function schedule(immediate) {
    if (failed || document.hidden || timer || frame) return;
    if (immediate) frame = requestAnimationFrame(draw);
    else timer = setTimeout(() => { timer = 0; frame = requestAnimationFrame(draw); }, 1000 / 20);
  }
  function refresh() { stop(); schedule(true); }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); canvas.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { program = buffer = null; initialise(); });
  window.addEventListener('resize', refresh, { passive: true });
  document.addEventListener('visibilitychange', refresh);
  motion.addEventListener('change', refresh);
  initialise();
}