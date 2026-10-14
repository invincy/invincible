import React, {useEffect, useRef} from 'react';

// A small 2D field behind the scene. Nearby particles connect briefly as they drift.
export default function AmbientParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = canvas.parentElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, last = 0, particles = [];
    const fractional = value => value - Math.floor(value);
    const makeParticle = index => ({
      x: fractional((index + 1) * .61803398875),
      y: fractional((index + 1) * .75487766625),
      vx: Math.sin(index * 2.17) * (2.5 + index % 4),
      vy: Math.cos(index * 1.73) * (2 + index % 3),
      size: index % 9 === 0 ? 1.65 : .8 + (index % 3) * .2,
    });
    const resize = () => {
      const rect = scene.getBoundingClientRect();
      width = rect.width; height = rect.height;
      if (!width || !height) return;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 26 : 56;
      particles = Array.from({length: count}, (_, index) => particles[index] || makeParticle(index));
      draw(0);
    };
    const draw = seconds => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x = (particle.x + particle.vx * seconds / width + 1) % 1;
        particle.y = (particle.y + particle.vy * seconds / height + 1) % 1;
      }
      const reach = Math.min(120, width * .15);
      for (let index = 0; index < particles.length; index++) {
        const first = particles[index], x = first.x * width, y = first.y * height;
        for (let other = index + 1; other < particles.length; other++) {
          const second = particles[other], dx = x - second.x * width, dy = y - second.y * height;
          const distance = Math.hypot(dx, dy);
          if (distance >= reach) continue;
          context.strokeStyle = `rgba(232, 190, 105, ${(.16 * (1 - distance / reach)).toFixed(3)})`;
          context.lineWidth = .65;
          context.beginPath(); context.moveTo(x, y); context.lineTo(second.x * width, second.y * height); context.stroke();
        }
        context.fillStyle = first.size > 1.5 ? 'rgba(250, 218, 150, .5)' : 'rgba(231, 193, 122, .32)';
        context.beginPath(); context.arc(x, y, first.size, 0, Math.PI * 2); context.fill();
      }
    };
    const schedule = () => {if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);};
    const tick = timestamp => {
      frame = 0;
      if (timestamp - last >= 33) {
        const seconds = Math.min((timestamp - last) / 1000 || 0, .05);
        last = timestamp;
        draw(seconds);
      }
      schedule();
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = performance.now();
      if (reduced.matches) draw(0);
      else schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', visibility);
    resize();
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', visibility);
    };
  }, []);
  return <canvas ref={canvasRef} className="v2-guide-particles" aria-hidden="true"/>;
}
