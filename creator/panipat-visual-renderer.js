// Panipat Visual Renderer — Atlas cards, typography, military formations & battle comparison modes
// Pure 2D canvas overlay engine tailored for 9:16 portrait historical atlas video.

export const PALETTE = {
  navy: '#101B2B',
  navyCard: '#17293B',
  gold: '#D9B76E',
  goldBorder: 'rgba(217, 183, 110, 0.32)',
  white: '#F7F5F0',
  muted: '#B8C6D1',
  attacker: '#679DBB',
  opponent: '#D6A26E',
  river: '#72B7C8',
  fertile: '#6F9977',
  arid: '#B79568',
  badgeBg: 'rgba(23, 41, 59, 0.85)',
  cardBg: 'rgba(16, 27, 43, 0.88)'
};

// Safe margins for 1080 x 1920 canvas
export const BASE_VIEWPORT = {width: 1080, height: 1920};
export const SAFE_AREA = {top: 92, bottom: 160, horizontal: 28};

// Helper: draw rounded rectangle
export function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Compute formation positions for 16 icons in 4x4 or 8x2 or morphed between them
export function getFormationPositions(morphT = 0, {cellSize = 24, gap = 4} = {}) {
  // morphT: 0 = 4x4 square, 1 = 8x2 line
  // 4 sub-units of 4 icons = 16 icons total
  // sub-unit 0: icons 0..3, sub-unit 1: 4..7, sub-unit 2: 8..11, sub-unit 3: 12..15
  const positions = [];
  const t = Math.max(0, Math.min(1, morphT));
  const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  for (let i = 0; i < 16; i++) {
    const subUnit = Math.floor(i / 4);
    const subIdx = i % 4;

    // 4x4 layout:
    // row = Math.floor(i / 4), col = i % 4
    // Sub-unit cluster spacing:
    const sqRow = Math.floor(i / 4);
    const sqCol = i % 4;
    const sqX = sqCol * (cellSize + gap) + (sqCol >= 2 ? gap * 2 : 0);
    const sqY = sqRow * (cellSize + gap) + (sqRow >= 2 ? gap * 2 : 0);

    // 8x2 layout:
    // row = Math.floor(i / 8), col = i % 8
    const lnRow = Math.floor(i / 8);
    const lnCol = i % 8;
    const lnX = lnCol * (cellSize + gap) + Math.floor(lnCol / 2) * (gap * 1.5);
    const lnY = lnRow * (cellSize + gap * 1.5);

    // Interpolate
    const x = sqX + (lnX - sqX) * ease;
    const y = sqY + (lnY - sqY) * ease;

    positions.push({
      index: i,
      subUnit,
      subIdx,
      x,
      y,
      sqX,
      sqY,
      lnX,
      lnY
    });
  }

  return positions;
}

// Cache of loaded Image elements
const imageCache = new Map();

export function getImage(url) {
  if (!url) return null;
  if (imageCache.has(url)) return imageCache.get(url);
  if (typeof Image === 'undefined') return null; // Node environment without DOM Image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  imageCache.set(url, img);
  return img;
}

// Render fallback symbol badge if image asset isn't ready
export function drawFallbackBadge(ctx, x, y, size, label, color = PALETTE.gold) {
  ctx.save();
  ctx.fillStyle = PALETTE.navyCard;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, size, size, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(size * 0.5)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.slice(0, 2).toUpperCase(), x + size / 2, y + size / 2);
  ctx.restore();
}

// Main card drawer
export function drawCard(ctx, {
  x, y, width, height,
  title = '',
  eyebrow = '',
  body = '',
  date = '',
  scale = 1.0,
  alpha = 1.0,
  footer = '',
  highlight = null
} = {}) {
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Card shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18 * scale;
  ctx.shadowOffsetY = 8 * scale;

  // Background
  ctx.fillStyle = PALETTE.cardBg;
  const radius = 16 * scale;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // Reset shadow for border and text
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = PALETTE.goldBorder;
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  ctx.stroke();

  // Header / Eyebrow & Date
  let curY = y + 24 * scale;
  const padX = x + 24 * scale;
  const contentWidth = width - 48 * scale;

  if (eyebrow || date) {
    ctx.font = `600 ${Math.round(18 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = 'top';

    if (eyebrow) {
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.gold;
      ctx.fillText(eyebrow.toUpperCase(), padX, curY);
    }

    if (date) {
      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(date, x + width - 24 * scale, curY);
    }
    curY += 26 * scale;
  }

  // Title
  if (title) {
    ctx.font = `bold ${Math.round(28 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = PALETTE.white;
    ctx.fillText(title, padX, curY, contentWidth);
    curY += 36 * scale;
  }

  // Highlight badge / pill if present
  if (highlight) {
    ctx.font = `600 ${Math.round(16 * scale)}px system-ui, sans-serif`;
    const tw = ctx.measureText(highlight).width + 20 * scale;
    ctx.fillStyle = PALETTE.badgeBg;
    ctx.strokeStyle = PALETTE.goldBorder;
    ctx.lineWidth = 1 * scale;
    roundRect(ctx, padX, curY, tw, 26 * scale, 6 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.gold;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(highlight, padX + 10 * scale, curY + 13 * scale);
    curY += 34 * scale;
  }

  // Body text
  if (body) {
    ctx.font = `500 ${Math.round(19 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = PALETTE.white;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Simple line wrap
    const words = body.split(' ');
    let line = '';
    for (const w of words) {
      const testLine = line + (line ? ' ' : '') + w;
      if (ctx.measureText(testLine).width > contentWidth && line) {
        ctx.fillText(line, padX, curY);
        curY += 26 * scale;
        line = w;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, padX, curY);
      curY += 26 * scale;
    }
  }

  // Footer / Caveat
  if (footer) {
    ctx.font = `italic 500 ${Math.round(14 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(footer, padX, y + height - 16 * scale, contentWidth);
  }

  ctx.restore();
}

// Draw Year Triptych Pills (Scene 1)
export function drawYearTriptych(ctx, {x, y, width, scale, activeIndex = 0, alpha = 1.0}) {
  const years = ['1526', '1556', '1761'];
  const pillW = Math.round(100 * scale);
  const pillH = Math.round(44 * scale);
  const gap = Math.round(18 * scale);
  const totalW = years.length * pillW + (years.length - 1) * gap;
  const startX = x + (width - totalW) / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  years.forEach((yr, i) => {
    const px = startX + i * (pillW + gap);
    const active = i <= activeIndex;
    ctx.fillStyle = active ? PALETTE.navyCard : 'rgba(16, 27, 43, 0.6)';
    ctx.strokeStyle = active ? PALETTE.gold : 'rgba(217, 183, 110, 0.2)';
    ctx.lineWidth = active ? 2 * scale : 1 * scale;
    roundRect(ctx, px, y, pillW, pillH, 12 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.font = `bold ${Math.round(20 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = active ? PALETTE.white : PALETTE.muted;
    ctx.fillText(yr, px + pillW / 2, y + pillH / 2);
  });

  ctx.restore();
}

// Draw single 16-icon main unit (4 sub-units of 4)
export function drawMainUnit(ctx, {
  x, y,
  morphT = 0,
  scale = 1.0,
  iconImg = null,
  fallbackLabel = 'INF',
  color = PALETTE.gold,
  alpha = 1.0,
  showSubunitBorders = true
}) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const iconSize = 18 * scale;
  const gap = 3 * scale;
  const positions = getFormationPositions(morphT, {cellSize: iconSize, gap});

  // Optional subtle container border
  if (showSubunitBorders) {
    ctx.strokeStyle = 'rgba(217, 183, 110, 0.2)';
    ctx.lineWidth = 1 * scale;
  }

  for (const pos of positions) {
    const ix = x + pos.x;
    const iy = y + pos.y;

    if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
      ctx.drawImage(iconImg, ix, iy, iconSize, iconSize);
    } else {
      drawFallbackBadge(ctx, ix, iy, iconSize, fallbackLabel, color);
    }
  }

  ctx.restore();
}

// Draw Battle Comparison (Scene 12)
export function drawBattleComparison(ctx, {
  battlePreset,
  scale = 1.0,
  width,
  height,
  alpha = 1.0,
  assets = new Map()
}) {
  if (!battlePreset || alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Header Banner: SCHEMATIC COMPARISON
  const bannerY = SAFE_AREA.top * scale;
  const bannerW = width - (SAFE_AREA.horizontal * 2 * scale);
  const bannerH = 46 * scale;
  const bannerX = SAFE_AREA.horizontal * scale;

  ctx.fillStyle = 'rgba(16, 27, 43, 0.94)';
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.5 * scale;
  roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 10 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.font = `bold ${Math.round(16 * scale)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('SCHEMATIC COMPARISON · NOT GEOGRAPHIC DEPLOYMENT', width / 2, bannerY + bannerH / 2);

  // Battle Title Card
  const titleY = bannerY + bannerH + 16 * scale;
  const titleH = 80 * scale;
  ctx.fillStyle = PALETTE.cardBg;
  ctx.strokeStyle = PALETTE.goldBorder;
  ctx.lineWidth = 1 * scale;
  roundRect(ctx, bannerX, titleY, bannerW, titleH, 14 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.font = `bold ${Math.round(26 * scale)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = PALETTE.white;
  ctx.fillText(`${battlePreset.year} — ${battlePreset.battle}`, width / 2, titleY + 14 * scale);

  ctx.font = `600 ${Math.round(17 * scale)}px system-ui, sans-serif`;
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(`Scale: 1 main unit (16 icons) = ${battlePreset.commonPersonnelPerMainUnit.toLocaleString()} combatants`, width / 2, titleY + 46 * scale);

  // Two columns: Left (Attacker/Approaching) vs Right (Opponent)
  const colGap = 16 * scale;
  const colW = (bannerW - colGap) / 2;
  const leftX = bannerX;
  const rightX = bannerX + colW + colGap;
  const colY = titleY + titleH + 16 * scale;
  const colH = height - colY - (SAFE_AREA.bottom * scale);

  // Draw Column Function
  const drawSide = (sideData, x, isLeft) => {
    ctx.fillStyle = PALETTE.cardBg;
    ctx.strokeStyle = isLeft ? 'rgba(103, 157, 187, 0.4)' : 'rgba(214, 162, 110, 0.4)';
    ctx.lineWidth = 1.5 * scale;
    roundRect(ctx, x, colY, colW, colH, 14 * scale);
    ctx.fill();
    ctx.stroke();

    // Side Title
    ctx.font = `bold ${Math.round(22 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isLeft ? PALETTE.attacker : PALETTE.opponent;
    ctx.fillText(sideData.army, x + colW / 2, colY + 16 * scale);

    // Commander cutout / badge
    const cmdY = colY + 50 * scale;
    const cmdImg = assets.get('commander_' + sideData.commander);
    const cmdSize = 88 * scale;
    const cmdX = x + (colW - cmdSize) / 2;

    if (cmdImg && cmdImg.complete && cmdImg.naturalWidth > 0) {
      ctx.save();
      roundRect(ctx, cmdX, cmdY, cmdSize, cmdSize, 12 * scale);
      ctx.clip();
      ctx.drawImage(cmdImg, cmdX, cmdY, cmdSize, cmdSize);
      ctx.restore();
      ctx.strokeStyle = PALETTE.goldBorder;
      ctx.lineWidth = 1.5 * scale;
      roundRect(ctx, cmdX, cmdY, cmdSize, cmdSize, 12 * scale);
      ctx.stroke();
    } else {
      drawFallbackBadge(ctx, cmdX, cmdY, cmdSize, sideData.commander, isLeft ? PALETTE.attacker : PALETTE.opponent);
    }

    // Commander facing note
    ctx.font = `600 ${Math.round(13 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = 'center';
    ctx.fillText(isLeft ? 'Commander (Faces Right →)' : '← Commander (Faces Left)', x + colW / 2, cmdY + cmdSize + 8 * scale);

    // Strength pill
    const strY = cmdY + cmdSize + 28 * scale;
    ctx.font = `bold ${Math.round(20 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.white;
    ctx.fillText(`~${sideData.strength.toLocaleString()} combatants`, x + colW / 2, strY);

    ctx.font = `500 ${Math.round(14 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(`(${sideData.strengthType})`, x + colW / 2, strY + 24 * scale);

    // Unit representation badge
    const count = battlePreset.displayMainUnits[isLeft ? 'left' : 'right'];
    const badgeY = strY + 48 * scale;
    ctx.font = `bold ${Math.round(16 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.gold;
    ctx.fillText(`${count} Main Units (${count * 16} troop icons)`, x + colW / 2, badgeY);

    // Grid of units (compact 4x4 indicator blocks)
    const unitCols = Math.min(3, Math.ceil(Math.sqrt(count)));
    const uW = 34 * scale;
    const uH = 34 * scale;
    const uGap = 8 * scale;
    const gridTotalW = unitCols * uW + (unitCols - 1) * uGap;
    const gridX = x + (colW - gridTotalW) / 2;
    const gridY = badgeY + 24 * scale;

    for (let u = 0; u < count; u++) {
      const col = u % unitCols;
      const row = Math.floor(u / unitCols);
      const ux = gridX + col * (uW + uGap);
      const uy = gridY + row * (uH + uGap);

      // Mini 4x4 representation
      ctx.fillStyle = isLeft ? 'rgba(103, 157, 187, 0.25)' : 'rgba(214, 162, 110, 0.25)';
      ctx.strokeStyle = isLeft ? PALETTE.attacker : PALETTE.opponent;
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, ux, uy, uW, uH, 4 * scale);
      ctx.fill();
      ctx.stroke();

      // mini 4x4 dots
      ctx.fillStyle = isLeft ? PALETTE.attacker : PALETTE.opponent;
      const dot = 3.5 * scale;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillRect(ux + 4 * scale + c * 6.5 * scale, uy + 4 * scale + r * 6.5 * scale, dot, dot);
        }
      }
    }

    // Equipment breakdown at bottom
    const eqY = colY + colH - 64 * scale;
    ctx.font = `italic 600 ${Math.round(14 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.gold;
    ctx.textAlign = 'center';
    let eqText = '';
    if (battlePreset.year === 1526) {
      eqText = isLeft ? 'Equipment: 20–24 field guns (separate)' : 'Equipment: ~1,000 war elephants (separate)';
    } else if (battlePreset.year === 1556) {
      eqText = isLeft ? 'Equipment: Hemu guns captured prior' : 'Equipment: 500–1,500 elephants (disputed)';
    } else if (battlePreset.year === 1761) {
      eqText = isLeft ? 'Illustrated: Camel zamburaks & field artillery' : 'Illustrated: Gardi cannons & cavalry wings';
    }
    ctx.fillText(eqText, x + colW / 2, eqY, colW - 16 * scale);

    ctx.font = `500 ${Math.round(12 * scale)}px system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('Equipment counted separately from headcounts', x + colW / 2, eqY + 22 * scale);
  };

  drawSide(battlePreset.left, leftX, true);
  drawSide(battlePreset.right, rightX, false);

  // Footer Footnote
  const footY = height - (SAFE_AREA.bottom * scale) + 18 * scale;
  ctx.font = `italic ${Math.round(14 * scale)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.muted;
  const note = battlePreset.year === 1526
    ? 'Source: Haryana Govt Gazettes · Babur araba/tulughma vs Lodi central mass'
    : battlePreset.year === 1556
    ? 'Source: panipat.gov.in · Vanguard/cavalry figures only, not total army totals'
    : 'Source: IGNCA/ASI Historical Record · One illustrative reconstruction, contested numbers';
  ctx.fillText(note, width / 2, footY);

  ctx.restore();
}

// Master Panipat Overlay Entry Point
export function renderPanipatOverlay(target, {
  project,
  spec,
  time = 0,
  width = 1080,
  height = 1920,
  isPortrait = true
} = {}) {
  const panipat = spec?.panipat || project?.historicalMap?.panipat || project?.panipat;
  if (!panipat) return; // Not a Panipat project, skip cleanly

  const scale = width / BASE_VIEWPORT.width;
  const ctx = target;

  // Find active scene
  let at = 0;
  let activeScene = null;
  let sceneIndex = 0;
  let sceneOffset = 0;

  for (let i = 0; i < (project.scenes || []).length; i++) {
    const s = project.scenes[i];
    const dur = Number(s.duration) || 0;
    if (time >= at && time < at + dur) {
      activeScene = s;
      sceneIndex = i;
      sceneOffset = time - at;
      break;
    }
    at += dur;
  }

  if (!activeScene) {
    activeScene = project.scenes?.at(-1);
    sceneIndex = (project.scenes?.length || 1) - 1;
    sceneOffset = activeScene ? (time - (at - activeScene.duration)) : 0;
  }

  if (!activeScene) return;

  const sceneDur = activeScene.duration || 10;
  // Fade in / out card animation
  const fadeInMs = 0.3;
  const fadeOutMs = 0.25;
  const cardAlpha = Math.min(1, sceneOffset / fadeInMs, (sceneDur - sceneOffset) / fadeOutMs);

  const cardW = width - (SAFE_AREA.horizontal * 2 * scale);
  const cardX = SAFE_AREA.horizontal * scale;

  // Scene-specific card rendering
  switch (activeScene.id) {
    case 'panipat_01_hook': {
      // 1526, 1556, 1761 Year Triptych
      const tripY = SAFE_AREA.top * scale + 20 * scale;
      const yrStep = Math.min(2, Math.floor(sceneOffset / 2.2));
      drawYearTriptych(ctx, {
        x: cardX,
        y: tripY,
        width: cardW,
        scale,
        activeIndex: yrStep,
        alpha: cardAlpha
      });

      drawCard(ctx, {
        x: cardX,
        y: tripY + 70 * scale,
        width: cardW,
        height: 180 * scale,
        title: 'Three Battles That Decided India',
        eyebrow: '1526 · 1556 · 1761',
        body: 'Why did the fate of north India get contested at this single small town three times in 235 years?',
        footer: 'Source: Panipat District Gazette & Archaeological Survey of India',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_02_question': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 200 * scale,
        title: 'The Contested Plain of Haryana',
        eyebrow: 'Historical Gateway',
        highlight: 'Traditional Battle Grounds',
        body: 'Just north of Delhi lies Kurukshetra and Panipat. For millennia, armies invading or defending the Delhi throne deployed on these open plains.',
        footer: 'Traditional epic association noted; strategic geographic position verified',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_03_geography': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 210 * scale,
        title: 'Northwest Subcontinent Terrain',
        eyebrow: 'Physical Geography',
        highlight: 'Relief & Approaches',
        body: 'It was neither coincidence nor myth. The physical funnel between the high mountains and the desert shaped military movements into the capital.',
        footer: 'Relief data: Natural Earth & USGS 30m shaded elevation',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_04_mountains': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 220 * scale,
        title: 'Hindu Kush & The Khyber Gateway',
        eyebrow: 'Mountain Approaches',
        highlight: 'Natural Passages',
        body: 'Invaders from Central Asia crossed the Hindu Kush through the Khyber and Bolan passes, entering the fertile Punjab river system toward Delhi.',
        footer: 'Broad communication corridors; not a modern compulsory highway',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_05_commanders': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 220 * scale,
        title: 'Commanders from the Northwest',
        eyebrow: 'Historic Examples',
        highlight: 'Babur (1526) · Ahmad Shah Abdali (1761)',
        body: 'Babur in 1526 and Ahmad Shah Abdali in 1761 followed this exact invasion line, converging on Panipat to encounter defending empires.',
        footer: 'Commander portraits are artistic interpretations; Abdali is preliminary preview',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_06_corridor': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 210 * scale,
        title: 'The Punjab–Haryana–Delhi Corridor',
        eyebrow: 'Strategic Highway',
        highlight: 'Punjab → Haryana → Delhi',
        body: 'Moving east through the five rivers, armies naturally passed through Haryana. Panipat stood as the final open gate before the imperial capital.',
        footer: 'Illustrative strategic corridor ribbon; no single historic road invented',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_07_constraints': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 210 * scale,
        title: 'The Yamuna & Desert Flanks',
        eyebrow: 'Natural Boundaries',
        highlight: 'River Eastern Flank · Arid Southwest',
        body: 'The Yamuna River barred passage to the east, while the arid Thar desert restricted cavalry to the southwest, channeling forces through Haryana.',
        footer: 'Important regional corridor; not an inescapable compulsory funnel',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_08_gangetic': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 220 * scale,
        title: 'The Ganga–Yamuna Doab & Plains',
        eyebrow: 'The Ultimate Prize',
        highlight: 'Wealth of Hindustan',
        body: 'Beyond Delhi lay the rich Ganga–Yamuna Doab and the sprawling Gangetic Plain — the dense agricultural and revenue heartland of the subcontinent.',
        footer: 'Historical revenue base of Delhi Sultanate and Mughal Empire',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_09_logistics': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 210 * scale,
        title: 'Armies & Supplies: Water, Grain, Fodder',
        eyebrow: 'Military Logistics',
        highlight: 'Logistical Lifelines',
        body: 'Tens of thousands of horses, bullocks, elephants and men required immense daily supplies of well water, grazing pastures, and local grain stores.',
        footer: 'Settlement clusters and agrarian supply belts mapped illustrative',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_10_terrain': {
      // Battlefield terrain and 4x4 <-> 8x2 formation morph demo
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 180 * scale,
        title: 'Battlefield Terrain: Open Plains',
        eyebrow: 'Tactical Deployment',
        highlight: 'Square 4x4 ↔ Line 8x2 Morph',
        body: 'Panipat’s flat ground accommodated massive cavalry charges, infantry lines, and artillery cart chains without broken topography.',
        scale,
        alpha: cardAlpha
      });

      // Formation Morph Demonstration Card
      const formCardY = SAFE_AREA.top * scale + 200 * scale;
      const formCardH = 260 * scale;
      ctx.fillStyle = PALETTE.cardBg;
      ctx.strokeStyle = PALETTE.goldBorder;
      ctx.lineWidth = 1.5 * scale;
      roundRect(ctx, cardX, formCardY, cardW, formCardH, 14 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.round(18 * scale)}px system-ui, sans-serif`;
      ctx.fillStyle = PALETTE.gold;
      ctx.textAlign = 'center';
      const morphProgress = (Math.sin(sceneOffset * 1.8) + 1) / 2;
      const morphState = morphProgress < 0.2 ? 'Square 4×4' : morphProgress > 0.8 ? 'Line 8×2' : 'Morphing Formation';
      ctx.fillText(`Main Unit Representation: 16 Soldiers (4 Sub-Units of 4) — ${morphState}`, width / 2, formCardY + 28 * scale);

      // Draw morphed formation in center of card
      const formX = width / 2 - 100 * scale;
      const formY = formCardY + 65 * scale;
      drawMainUnit(ctx, {
        x: formX,
        y: formY,
        morphT: morphProgress,
        scale: scale * 1.6,
        fallbackLabel: 'TROOP',
        color: PALETTE.gold,
        alpha: cardAlpha
      });

      ctx.font = `italic ${Math.round(14 * scale)}px system-ui, sans-serif`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText('Unit strength scales by main unit count, never by stretching icon size', width / 2, formCardY + formCardH - 18 * scale);
      break;
    }

    case 'panipat_11_delhi': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 220 * scale,
        title: 'Panipat to Delhi: The 90 km Buffer',
        eyebrow: 'Defensive Strategy',
        highlight: '~90 km (Two to Three Days March)',
        body: 'Panipat gave defending emperors room to marshal before the capital fell, while giving invaders a final staging post before capturing Delhi.',
        footer: 'Historical distance arc; not an exact fabricated single road alignment',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    case 'panipat_12_three_battles': {
      // Three battle presets sequential comparison
      const subIndex = Math.min(2, Math.floor(sceneOffset / 4.5));
      const preset = panipat.battlePresets[subIndex] || panipat.battlePresets[0];
      drawBattleComparison(ctx, {
        battlePreset: preset,
        scale,
        width,
        height,
        alpha: cardAlpha,
        assets: imageCache
      });
      break;
    }

    case 'panipat_13_conclusion': {
      drawCard(ctx, {
        x: cardX,
        y: SAFE_AREA.top * scale,
        width: cardW,
        height: 220 * scale,
        title: 'Where Geography Made History',
        eyebrow: 'Strategic Crossroads',
        highlight: 'Panipat · The Battlefield of Empires',
        body: 'Routes, mountain barriers, river constraints, and logistics repeatedly converged on this single plain — making Panipat India’s ultimate crossroads.',
        footer: 'Historical Atlas Session Complete · 151.25s Exact Audio Master',
        scale,
        alpha: cardAlpha
      });
      break;
    }

    default:
      break;
  }
}
