export function mountQuickReview(root, {canvas, seek, timeOutput, play, jpg, notices, onSelect, onOpenEditor}) {
 const review = document.createElement('section');
 review.className = 'vs-quick-review';
 review.setAttribute('aria-labelledby', 'vs-quick-title');
 review.innerHTML = `
  <header><h2 id="vs-quick-title">Quick Review</h2><button type="button" data-review-editor>Open Motion Studio</button></header>
  <p data-review-empty role="status">Loading scenes…</p>
  <div class="vs-review-body" hidden>
   <div class="vs-review-controls">
    <label>Scene<select data-review-scene></select></label>
    <div class="vs-review-navigation">
     <button type="button" data-review-prev aria-label="Previous scene" title="Previous scene"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button>
     <span data-review-position></span>
     <button type="button" data-review-next aria-label="Next scene" title="Next scene"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
    </div>
    <div class="vs-review-seek"></div>
    <div class="vs-review-actions"></div>
   </div>
   <div class="vs-review-frame"></div>
  </div>
  <div class="vs-review-notices"></div>`;
 const pick = review.querySelector('[data-review-scene]');
 const prev = review.querySelector('[data-review-prev]');
 const next = review.querySelector('[data-review-next]');
 const position = review.querySelector('[data-review-position]');
 const empty = review.querySelector('[data-review-empty]');
 let scenes = [];
 review.querySelector('[data-review-editor]').onclick = onOpenEditor;
 pick.onchange = () => onSelect(pick.value);
 prev.onclick = () => onSelect(scenes[pick.selectedIndex - 1]?.id);
 next.onclick = () => onSelect(scenes[pick.selectedIndex + 1]?.id);
 canvas.setAttribute('aria-label', 'Scene preview');
 seek.setAttribute('aria-label', 'Time in scene');
 seek.step = 'any';
 jpg.textContent = 'Download midpoint JPG';
 play.textContent = 'Play scene';
 review.querySelector('.vs-review-frame').append(canvas);
 review.querySelector('.vs-review-seek').append(seek, timeOutput);
 review.querySelector('.vs-review-actions').append(play, jpg);
 review.querySelector('.vs-review-notices').append(...notices);
 const editor = document.createElement('div');
 editor.hidden = true;
 editor.append(...root.children);
 root.append(review, editor);
 return {
  setScenes(items) {
   scenes = items;
   pick.replaceChildren(...items.map((scene, index) => new Option(
    `${index + 1}. ${scene.name || scene.engineType || 'Scene'}`, scene.id
   )));
   empty.textContent = 'No scenes to review. Open Motion Studio to add or import scenes.';
   empty.hidden = !!items.length;
   review.querySelector('.vs-review-body').hidden = !items.length;
  },
  update(scene, time, busy) {
   if (!scene) return;
   pick.value = scene.id;
   const index = pick.selectedIndex;
   position.textContent = `${index + 1} of ${scenes.length}`;
   prev.disabled = busy || index <= 0;
   next.disabled = busy || index >= scenes.length - 1;
   const offset = Math.max(0, time - scene.startSeconds);
   seek.max = scene.durationSeconds;
   seek.value = offset;
   timeOutput.textContent = `${offset.toFixed(2)} / ${scene.durationSeconds.toFixed(2)} s`;
  },
  setPlaying(value) {
   play.textContent = value ? 'Pause' : 'Play scene';
  }
 };
}
