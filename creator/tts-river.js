// A decorative, texture-free water surface. It never observes or handles input.
const canvas = document.querySelector('.tts-river');

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

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.y;
      vec2 p = uv * 3.0;
      // Advection moves the field along the river rather than translating a picture.
      vec2 current = vec2(-time * 0.16, time * 0.065);
      float warp = noise(p * 0.7 + current * 0.55);
      vec2 q = p + current + vec2(warp * 0.9, warp * 0.55);
      float eddy = noise(q * 1.3) * 0.65 + noise(q * 2.7 + 7.0) * 0.35;
      float bands = sin(p.y * 5.4 + p.x * 2.1 + eddy * 4.5 - time * 0.75);
      float fine = sin(p.y * 12.0 + p.x * 3.0 + eddy * 5.0 - time * 1.15);
      float light = smoothstep(0.12, 0.9, bands * 0.5 + 0.5) * 0.42;
      light += smoothstep(0.65, 1.0, fine * 0.5 + 0.5) * 0.12;
      light += eddy * 0.18;

      // Each cell has one expanding, fading raindrop ring, not moving particles.
      vec2 rain = uv * 3.2;
      vec2 cell = floor(rain);
      float rings = 0.0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 id = cell + vec2(float(x), float(y));
          vec2 centre = id + vec2(hash(id + 19.0), hash(id + 71.0));
          float phase = fract(time * 0.22 + hash(id + 3.0));
          float radius = phase * 0.48;
          float dist = length(rain - centre);
          float ring = 1.0 - smoothstep(0.012, 0.035, abs(dist - radius));
          rings += ring * sin(phase * 3.14159) * 0.22;
        }
      }
      vec3 deep = vec3(0.018, 0.075, 0.13);
      vec3 cyan = vec3(0.055, 0.36, 0.47);
      vec3 color = mix(deep, cyan, clamp(light + rings, 0.0, 0.9));
      gl_FragColor = vec4(color, 1.0);
    }`;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let gl, program, buffer, resolution, timeUniform, timeWrap = 2048;
  let timer = 0, frame = 0, failed = false;

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
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL unavailable');
      timeWrap = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? 2048 : 128;
      const vertex = shader(gl.VERTEX_SHADER, vertexSource);
      let fragment;
      try { fragment = shader(gl.FRAGMENT_SHADER, fragmentSource); }
      catch (error) { gl.deleteShader(vertex); throw error; }
      program = gl.createProgram();
      if (!program) { gl.deleteShader(vertex); gl.deleteShader(fragment); throw new Error('Program unavailable'); }
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
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
      canvas.classList.remove('is-ready');
      if (gl && buffer) gl.deleteBuffer(buffer);
      if (gl && program) gl.deleteProgram(program);
      buffer = program = null;
    }
  }

  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
  }

  function draw() {
    frame = 0;
    if (failed || document.hidden || !gl || gl.isContextLost()) return;
    // Cap both DPR and total pixels, including unusually large displays.
    const width = Math.max(1, innerWidth), height = Math.max(1, innerHeight);
    const dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 1 : 1.25, Math.sqrt(750000 / (width * height)));
    const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
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