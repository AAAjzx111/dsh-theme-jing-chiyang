/**
 * 「镜 · 炽阳神光」 — Client half.
 *
 * Two halves of one picture, split for cost:
 *
 *   BACKDROP (behind the UI, never animated) — ink night sky, molten sun,
 *   corona ray fan, light shafts, frosted mirror shards, hairline cracks,
 *   legibility scrim and vignette. The app's panels are translucent, so this
 *   shows through them. A changed backdrop forces the software compositor to
 *   re-rasterise every text run above it (measured ~150% of one core), so this
 *   half stays perfectly still.
 *
 *   OVERLAY (above the UI, animated by one 20 fps clock) — the sun's breath,
 *   drifting embers and mirror dust, a periodic light sweep, and the cursor
 *   aura. Composited over static content it costs a few percent of a core
 *   instead of a full core.
 *
 * Colour work is done by overriding the app's own design tokens, which keeps
 * every panel, menu and bubble on-theme without touching component CSS.
 */
window.__ModuleLoader__.load({
  id: 'dsh-theme-jing-chiyang',
  factory() {
    const STORE_KEY = 'dsh-theme-jing-chiyang/motion'
    const STAGE_ID = 'jzs-stage'
    const OVERLAY_ID = 'jzs-overlay'
    const HUD_ID = 'jzs-hud'
    const ATTR = 'data-jing-motion'
    const MODES = ['full', 'calm', 'off']
    const MODE_LABEL = { full: '神光 · 全动效', calm: '静谧 · 缓慢', off: '关闭主题' }
    const FPS = { full: 8, calm: 2, off: 0 }
    const SPEED = { full: 1, calm: 0.5, off: 0 }

    /** Small deterministic PRNG so the artwork is stable between reloads. */
    function makeRandom(seedInit) {
      let seed = seedInit
      return () => {
        seed ^= seed << 13
        seed ^= seed >>> 17
        seed ^= seed << 5
        seed >>>= 0
        return seed / 0xffffffff
      }
    }

    /** Corona ray fan: alternating soft spokes, generated so the source stays small. */
    const rayStops = (() => {
      const spokes = 26
      const step = 360 / spokes
      const parts = []
      for (let i = 0; i < spokes; i += 1) {
        const base = step * i
        const wide = 1.1 + (i % 4) * 0.75
        const alpha = (0.035 + (i % 5) * 0.028).toFixed(3)
        parts.push(`rgba(255,216,156,0) ${(base + 1.2).toFixed(2)}deg ${(base + step - 1.2).toFixed(2)}deg`)
        parts.push(`rgba(255,216,156,${alpha}) ${(base + step - 1.2).toFixed(2)}deg ${(base + step).toFixed(2)}deg`)
        parts.push(`rgba(255,216,156,${(Number(alpha) * 1.4).toFixed(3)}) ${base.toFixed(2)}deg ${(base + wide).toFixed(2)}deg`)
      }
      return parts.join(',')
    })()

    /** Mirror cracks radiating from the sun, baked once into an inline SVG. */
    const cracksSvg = (() => {
      const rand = makeRandom(0x5eed1e5)
      const paths = []
      const ox = 760
      const oy = 40
      for (let i = 0; i < 13; i += 1) {
        const angle = (Math.PI * 2 * i) / 13 + (rand() - 0.5) * 0.42
        let x = ox
        let y = oy
        const segments = 3 + Math.floor(rand() * 3)
        let d = `M${ox} ${oy}`
        for (let s = 0; s < segments; s += 1) {
          const len = 90 + rand() * 260
          const a = angle + (rand() - 0.5) * 0.7
          x += Math.cos(a) * len
          y += Math.sin(a) * len
          const cx = x + (rand() - 0.5) * 90
          const cy = y + (rand() - 0.5) * 90
          d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
        }
        paths.push(`<path d="${d}" stroke-width="${(0.7 + rand() * 1.1).toFixed(2)}"/>`)
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">`
        + `<g fill="none" stroke="rgba(255,232,186,0.9)" stroke-linecap="round">${paths.join('')}</g></svg>`
    })()

    /* ------------------------------------------------------------------ */
    /* Tokens — the app's palette, re-tinted to ink + molten gold.          */
    /* Written for both palettes so the theme survives a light/dark switch. */
    /* ------------------------------------------------------------------ */
    const TOKENS_CSS = `
html body, html body[data-ds-dark-theme] {
  --dsw-alias-bg-base: rgba(8, 11, 20, 0.60) !important;
  --dsw-alias-bg-layer-1: rgba(13, 17, 30, 0.66) !important;
  --dsw-alias-bg-layer-2: rgba(19, 24, 41, 0.74) !important;
  --dsw-alias-bg-layer-3: rgba(26, 32, 54, 0.80) !important;
  --dsw-alias-bg-overlay: rgba(9, 11, 20, 0.93) !important;
  --dsw-alias-bg-document-preview: rgba(10, 13, 22, 0.62) !important;
  --dsw-alias-bg-document-selection: rgba(255, 186, 74, 0.26) !important;
  --dsw-alias-bg-skeleton: rgba(255, 214, 150, 0.10) !important;
  --dsw-alias-bg-module-platform: rgba(14, 18, 30, 0.55) !important;
  --dsw-alias-bg-multi-select: rgba(255, 186, 74, 0.16) !important;
  --dsw-alias-bg-mask-1: rgba(3, 5, 11, 0.55) !important;
  --dsw-alias-bg-mask-2: rgba(3, 5, 11, 0.32) !important;
  --dsw-alias-bg-mask-3: rgba(3, 5, 11, 0.74) !important;

  --dsw-alias-label-primary: #f7efe2 !important;
  --dsw-alias-label-primary-bluish: #f3e7d4 !important;
  --dsw-alias-label-primary-dimmed: #d8cbb7 !important;
  --dsw-alias-label-secondary: #d6c9b5 !important;
  --dsw-alias-label-tertiary: #ab9d87 !important;
  --dsw-alias-label-caption: #9b8b74 !important;
  --dsw-alias-label-dimmed: #8d7f6c !important;
  --dsw-alias-label-primary-foreground: #16120a !important;
  --dsw-alias-label-primary-inverted: #16120a !important;
  --dsw-alias-label-shimmer: rgba(255, 240, 210, 0.50) !important;
  --dsw-alias-label-deep-diving: #ffcb80 !important;
  --dsw-alias-label-deep-diving-shimmer: rgba(255, 236, 190, 0.75) !important;
  --dsw-alias-label-document-preview: #cbbca4 !important;

  --dsw-alias-border-inverted: rgba(10, 12, 20, 0.20) !important;
  --dsw-alias-border-inverted2: rgba(10, 12, 20, 0.35) !important;
  --dsw-alias-border-l1: rgba(255, 214, 150, 0.13) !important;
  --dsw-alias-border-l2: rgba(255, 214, 150, 0.19) !important;
  --dsw-alias-border-l3: rgba(255, 214, 150, 0.26) !important;
  --dsw-alias-border-l4: rgba(255, 214, 150, 0.34) !important;

  --dsw-alias-brand-primary: #ffc159 !important;
  --dsw-alias-brand-primary-invert: #221a0d !important;
  --dsw-alias-brand-text: #ffd998 !important;
  --dsw-alias-link: #ffcb80 !important;

  --dsw-alias-button-primary-fill: #f2ab3c !important;
  --dsw-alias-button-primary-hover: #ffc15c !important;
  --dsw-alias-button-primary-dimmed: rgba(242, 171, 60, 0.35) !important;
  --dsw-alias-button-contrast-fill: #ffd27f !important;
  --dsw-alias-button-elevated-fill: rgba(22, 27, 45, 0.74) !important;
  --dsw-alias-button-floating-fill: rgba(24, 29, 48, 0.80) !important;
  --dsw-alias-button-floating-hover: rgba(34, 40, 64, 0.86) !important;
  --dsw-alias-button-info-fill: rgba(255, 190, 90, 0.16) !important;
  --dsw-alias-button-info-hover: rgba(255, 190, 90, 0.24) !important;
  --dsw-alias-button-ghost-active-fill: rgba(255, 190, 90, 0.16) !important;
  --dsw-alias-button-ghost-active-hover: rgba(255, 190, 90, 0.24) !important;
  --dsw-alias-button-ghost-active-border: rgba(255, 200, 110, 0.42) !important;
  --dsw-alias-button-tool-bar-fill: rgba(255, 214, 150, 0.06) !important;
  --dsw-alias-button-tool-bar-fill-invisible: transparent !important;
  --dsw-alias-button-tool-bar-hover: rgba(255, 214, 150, 0.14) !important;

  --dsw-alias-interactive-bg-hover: rgba(255, 198, 100, 0.10) !important;
  --dsw-alias-interactive-bg-hover-solid: rgba(38, 44, 66, 0.86) !important;
  --dsw-alias-interactive-bg-hover-accent: rgba(255, 186, 74, 0.16) !important;
  --dsw-alias-interactive-bg-hover-danger: rgba(255, 86, 96, 0.16) !important;
  --dsw-alias-interactive-bg-active: rgba(255, 198, 100, 0.17) !important;

  --dsw-alias-state-business-primary: #ffc159 !important;
  --dsw-alias-state-business-tertiary: rgba(255, 193, 89, 0.22) !important;
  --dsw-alias-state-success-primary: #6fe0a8 !important;
  --dsw-alias-state-success-secondary: rgba(111, 224, 168, 0.16) !important;
  --dsw-alias-state-success-tertiary: rgba(111, 224, 168, 0.10) !important;
  --dsw-alias-state-error-primary: #ff6b74 !important;
  --dsw-alias-state-error-secondary: rgba(255, 107, 116, 0.16) !important;
  --dsw-alias-state-warn-primary: #ffc861 !important;
  --dsw-alias-state-warn-secondary: rgba(255, 200, 97, 0.16) !important;
  --dsw-alias-state-warn-tertiary: rgba(255, 200, 97, 0.10) !important;
  --dsw-alias-state-warn-label: #ffd489 !important;
  --dsw-alias-state-idle-primary: #9c8f7c !important;

  --dsw-menu-surface-fill: rgba(10, 13, 23, 0.90) !important;
  --dsw-specific-menu: rgba(10, 13, 23, 0.92) !important;
  --dsw-alias-menu-group-header-fill: rgba(10, 13, 23, 0.94) !important;
  --dsw-alias-menu-icon: #dccfb9 !important;
  --dsw-menu-backdrop-filter: blur(18px) saturate(1.15) !important;

  --dsw-specific-bubble: rgba(255, 186, 74, 0.12) !important;
  --dsw-specific-bubble-highlight: rgba(255, 186, 74, 0.20) !important;
  --dsw-specific-input-major: rgba(12, 16, 28, 0.62) !important;
  --dsw-specific-login-input: rgba(12, 16, 28, 0.60) !important;
  --dsw-specific-selector: rgba(26, 32, 52, 0.90) !important;
  --dsw-specific-sidebar-fill: rgba(7, 9, 17, 0.42) !important;
  --dsw-specific-sidebar-nav-item-active: rgba(255, 190, 90, 0.14) !important;
  --dsw-specific-sidebar-nav-item-active-accent: #ffc159 !important;
  --dsw-specific-sidebar-nav-item-hover: rgba(255, 214, 150, 0.08) !important;
  --dsw-specific-tip: rgba(20, 25, 42, 0.90) !important;

  --dsw-alias-toast-bg: rgba(12, 16, 28, 0.94) !important;
  --dsw-alias-toast-label: #f7efe2 !important;
  --dsw-alias-tooltip-bg: rgba(12, 16, 28, 0.94) !important;
  --dsw-alias-tooltip-key-bg: rgba(255, 214, 150, 0.14) !important;

  --dsw-alias-markdown-code-block: rgba(6, 9, 16, 0.62) !important;
  --dsw-alias-markdown-code-block-banner: rgba(255, 214, 150, 0.06) !important;
  --dsw-alias-markdown-inline-code: rgba(255, 190, 90, 0.14) !important;
  --dsw-alias-markdown-tag: rgba(255, 190, 90, 0.16) !important;
  --dsw-alias-markdown-citation: rgba(255, 190, 90, 0.12) !important;
  --dsw-alias-markdown-placeholder: rgba(255, 214, 150, 0.08) !important;
  --dsw-alias-markdown-code-segment-selected: rgba(255, 190, 90, 0.20) !important;
  --dsw-alias-markdown-code-segment-unselected: rgba(255, 255, 255, 0.04) !important;

  --dsw-alias-settings-card-fill: rgba(13, 17, 30, 0.50) !important;
  --dsw-alias-settings-card-stroke: rgba(255, 214, 150, 0.16) !important;

  --dsw-alias-scrollbar-bg-l1: rgba(255, 214, 150, 0.10) !important;
  --dsw-alias-scrollbar-bg-l2: rgba(255, 214, 150, 0.14) !important;
  --dsw-alias-scrollbar-hover-l1: rgba(255, 206, 120, 0.26) !important;
  --dsw-alias-scrollbar-hover-l2: rgba(255, 206, 120, 0.30) !important;

  --dsw-alias-switch-thumb: #ffe1a6 !important;
  --dsw-alias-turn-trigger-bg: rgba(255, 214, 150, 0.07) !important;
  --dsw-alias-turn-trigger-bg-hover: rgba(255, 214, 150, 0.13) !important;

  --dsw-focus-ring-color: rgba(255, 193, 89, 0.90) !important;
  --dsw-elevation-stroke-color: rgba(255, 214, 150, 0.22) !important;
}
`

    /* ------------------------------------------------------------------ */
    /* Backdrop — static art behind the interface.                         */
    /* ------------------------------------------------------------------ */
    const STAGE_CSS = `
html { background-color: #04050b !important; color-scheme: dark !important; }
html body { background-color: transparent !important; }
html, body, #root { background-image: none !important; }
#root { background-color: transparent !important; }
::selection { background: rgba(255, 186, 74, 0.30) !important; color: #fff8ea !important; }

#${STAGE_ID} {
  position: fixed; inset: 0; z-index: -1; overflow: hidden;
  pointer-events: none; contain: strict;
}
html[${ATTR}='off'] #${STAGE_ID} { display: none; }

.jzs-layer { position: absolute; inset: 0; }

/* base sky: ink at the top, a warm horizon far below */
.jzs-sky {
  background:
    radial-gradient(74% 50% at 76% -8%, rgba(255, 196, 92, 0.30) 0%, rgba(255, 150, 52, 0.12) 34%, rgba(255, 120, 32, 0) 62%),
    radial-gradient(64% 48% at 8% 98%, rgba(255, 132, 44, 0.14) 0%, rgba(255, 120, 40, 0) 64%),
    radial-gradient(120% 92% at 52% 46%, #0a1022 0%, #070a16 46%, #04050c 100%);
}

/* molten sun disc */
.jzs-sun {
  position: absolute;
  right: -19vmin; top: -21vmin;
  width: 64vmin; height: 64vmin; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    #fff9e6 0%, #ffe9b0 9%, #ffc961 22%, #ff9a2e 35%,
    rgba(255, 120, 30, 0.36) 49%, rgba(255, 90, 20, 0.10) 64%, transparent 76%);
  opacity: 0.92;
}

/* hairline cracks over the mirror world */
.jzs-cracks {
  background-image: url("data:image/svg+xml;utf8,${encodeURIComponent(cracksSvg)}");
  background-size: 100% 100%;
  opacity: 0.26;
  -webkit-mask-image: radial-gradient(80% 80% at 78% 4%, #000 0 18%, rgba(0, 0, 0, 0.55) 46%, transparent 78%);
  mask-image: radial-gradient(80% 80% at 78% 4%, #000 0 18%, rgba(0, 0, 0, 0.55) 46%, transparent 78%);
}

/* corona ray fan, masked away from the centre */
.jzs-rays {
  position: absolute; right: -46vmin; top: -52vmin;
  width: 132vmin; height: 132vmin; border-radius: 50%;
  background: conic-gradient(from 0deg, ${rayStops});
  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0 14%, rgba(0, 0, 0, 0.62) 24%, transparent 58%);
  mask-image: radial-gradient(circle at 50% 50%, #000 0 14%, rgba(0, 0, 0, 0.62) 24%, transparent 58%);
  opacity: 0.78;
}

/* diagonal light shafts */
.jzs-shafts { opacity: 0.6; }
.jzs-shafts i {
  position: absolute; display: block;
  top: -40%; height: 180%; width: 26vmin;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 232, 184, 0.10) 38%, rgba(255, 246, 218, 0.18) 52%, rgba(255, 232, 184, 0.08) 68%, transparent 100%);
  transform: rotate(14deg);
}
.jzs-shafts i:nth-child(1) { left: 6%; }
.jzs-shafts i:nth-child(2) { left: 34%; width: 16vmin; opacity: 0.75; }
.jzs-shafts i:nth-child(3) { left: 62%; width: 34vmin; opacity: 0.6; }

/* frosted mirror shards: a bright rim with a dark glass body */
.jzs-shards { overflow: hidden; opacity: 0.95; }
.jzs-shard {
  position: absolute;
  background: linear-gradient(150deg, rgba(255, 238, 202, 0.34) 0%, rgba(255, 208, 138, 0.20) 34%, rgba(198, 226, 255, 0.18) 72%, rgba(255, 240, 210, 0.12) 100%);
  opacity: var(--o, 0.85);
  transform: rotate(var(--r, 0deg));
}
.jzs-shard::before {
  content: ''; position: absolute; inset: 1.2px; clip-path: inherit;
  background:
    linear-gradient(150deg, rgba(13, 19, 34, 0.34) 0%, rgba(22, 28, 46, 0.14) 46%, rgba(9, 13, 24, 0.30) 100%),
    linear-gradient(135deg, rgba(224, 240, 255, 0.10) 0%, rgba(255, 214, 146, 0.06) 42%, rgba(190, 220, 255, 0.035) 68%, rgba(255, 255, 255, 0.015) 100%);
}

/* legibility: keep the reading column calm */
.jzs-scrim {
  background:
    radial-gradient(58% 64% at 54% 44%, rgba(4, 6, 12, 0.58) 0%, rgba(4, 6, 12, 0.34) 46%, rgba(4, 6, 12, 0) 74%),
    linear-gradient(180deg, rgba(3, 4, 10, 0.50) 0%, rgba(3, 4, 10, 0.10) 18%, rgba(3, 4, 10, 0.08) 60%, rgba(3, 4, 10, 0.56) 100%);
}
.jzs-vignette {
  background: radial-gradient(122% 122% at 50% 50%, transparent 40%, rgba(2, 3, 8, 0.50) 76%, rgba(2, 3, 8, 0.82) 100%);
}
`

    /* ------------------------------------------------------------------ */
    /* Overlay — the living light, composited above the interface.         */
    /* ------------------------------------------------------------------ */
    const OVERLAY_CSS = `
#${OVERLAY_ID} {
  position: fixed; inset: 0; z-index: 2147481000;
  pointer-events: none; overflow: hidden; contain: strict;
}
html[${ATTR}='off'] #${OVERLAY_ID} { display: none; }

/* the sun breathes above the header */
#${OVERLAY_ID} .jzs-glare {
  position: absolute; right: -22vmin; top: -26vmin;
  width: 70vmin; height: 70vmin; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    rgba(255, 246, 220, 0.34) 0%, rgba(255, 214, 140, 0.20) 22%,
    rgba(255, 168, 60, 0.10) 44%, rgba(255, 140, 40, 0.03) 64%, transparent 78%);
  mix-blend-mode: screen;
  opacity: 0.9;
}

/* drifting embers and mirror dust */
#${OVERLAY_ID} .jzs-embers {
  position: absolute; inset: 0; overflow: hidden;
}
#${OVERLAY_ID} .jzs-ember {
  position: absolute; bottom: -8vh; left: var(--x, 50%);
  width: var(--w, 8px); height: var(--w, 8px); border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 232, 182, 0.95) 0%, rgba(255, 176, 72, 0.55) 38%, rgba(255, 140, 40, 0.10) 64%, transparent 74%);
  opacity: 0;
  will-change: transform, opacity;
}
#${OVERLAY_ID} .jzs-ember[data-kind='dust'] {
  background: radial-gradient(circle, rgba(230, 242, 255, 0.90) 0%, rgba(150, 196, 255, 0.45) 40%, rgba(120, 170, 255, 0.08) 66%, transparent 76%);
}

/* a highlight sweeping the glass every ~19 s */
#${OVERLAY_ID} .jzs-sweep {
  position: absolute; inset: 0;
  background: linear-gradient(102deg,
    transparent 38%, rgba(255, 236, 190, 0.05) 45%, rgba(255, 246, 222, 0.13) 50%,
    rgba(255, 236, 190, 0.05) 55%, transparent 62%);
  mix-blend-mode: screen;
  opacity: 0;
  will-change: transform, opacity;
}

/* cursor aura: 神光 follows the pointer */
#${OVERLAY_ID} .jzs-aura {
  position: absolute; left: 0; top: 0;
  width: 54vmin; height: 54vmin; margin: -27vmin 0 0 -27vmin; border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 200, 104, 0.13) 0%, rgba(255, 170, 60, 0.05) 42%, transparent 70%);
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 700ms ease;
  will-change: transform;
}
`

    /* ------------------------------------------------------------------ */
    /* Emblem — the one piece of chrome the theme adds.                    */
    /* ------------------------------------------------------------------ */
    const HUD_CSS = `
#${HUD_ID} {
  position: fixed; left: 18px; bottom: 82px; z-index: 2147482000;
  display: flex; align-items: center; gap: 10px;
  font: 500 12px/1.4 -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #ffe6b8; pointer-events: none;
}
#${HUD_ID} .jzs-btn {
  position: relative; width: 38px; height: 38px; padding: 0; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer; pointer-events: auto;
  border: 1px solid rgba(255, 206, 120, 0.55);
  background: radial-gradient(circle at 32% 26%, rgba(255, 214, 140, 0.26) 0%, rgba(12, 15, 26, 0.78) 62%);
  color: #ffe3ac; font: 600 18px/1 "STKaiti", "KaiTi", "Songti SC", serif;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 0 14px rgba(255, 205, 120, 0.18);
  transition: transform 180ms ease, box-shadow 260ms ease, border-color 200ms ease;
}
#${HUD_ID} .jzs-btn:hover {
  transform: translateY(-1px) scale(1.045);
  border-color: rgba(255, 230, 176, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 10px 28px rgba(0, 0, 0, 0.5), 0 0 26px rgba(255, 190, 90, 0.38), inset 0 0 18px rgba(255, 215, 140, 0.30);
}
#${HUD_ID} .jzs-btn:active { transform: translateY(0) scale(0.98); }
#${HUD_ID} .jzs-btn:focus-visible { outline: 2px solid rgba(255, 206, 120, 0.9); outline-offset: 3px; }
#${HUD_ID} .jzs-ring {
  position: absolute; inset: -7px; border-radius: 50%; pointer-events: none;
  background: conic-gradient(from 0deg, rgba(255, 206, 120, 0) 0 60%, rgba(255, 214, 140, 0.8) 78%, rgba(255, 206, 120, 0) 92%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 0);
  opacity: 0.85;
  will-change: transform;
}
html[${ATTR}='calm'] #${HUD_ID} .jzs-ring { opacity: 0.35; }
html[${ATTR}='off'] #${HUD_ID} .jzs-ring { display: none; }
#${HUD_ID} .jzs-chip {
  pointer-events: none; padding: 4px 10px; border-radius: 999px; white-space: nowrap;
  background: rgba(10, 13, 23, 0.82); border: 1px solid rgba(255, 214, 150, 0.22);
  color: #ffe0ad; opacity: 0; transform: translateX(-4px);
  transition: opacity 220ms ease, transform 220ms ease;
}
#${HUD_ID} .jzs-chip[data-show='1'] { opacity: 1; transform: translateX(0); }
`

    const SHARDS = [
      { left: '-6%', top: '1%', w: '23vmin', h: '27vmin', r: -13, o: '0.62', clip: 'polygon(18% 0%, 72% 6%, 100% 46%, 66% 96%, 12% 78%, 0% 32%)' },
      { left: '63%', top: '-9%', w: '31vmin', h: '25vmin', r: 9, o: '0.60', clip: 'polygon(0% 14%, 58% 0%, 100% 30%, 78% 84%, 22% 100%, 4% 58%)' },
      { left: '89%', top: '25%', w: '19vmin', h: '31vmin', r: -6, o: '0.45', clip: 'polygon(12% 0%, 88% 8%, 100% 62%, 54% 100%, 8% 84%, 0% 38%)' },
      { left: '-8%', top: '42%', w: '17vmin', h: '24vmin', r: 16, o: '0.40', clip: 'polygon(24% 0%, 82% 10%, 100% 66%, 48% 100%, 0% 62%, 6% 20%)' },
      { left: '85%', top: '58%', w: '22vmin', h: '26vmin', r: -18, o: '0.42', clip: 'polygon(10% 6%, 66% 0%, 98% 40%, 70% 92%, 18% 100%, 0% 48%)' },
      { left: '1%', top: '79%', w: '25vmin', h: '19vmin', r: 7, o: '0.34', clip: 'polygon(6% 12%, 62% 0%, 100% 34%, 84% 88%, 26% 100%, 0% 54%)' },
      { left: '38%', top: '-5%', w: '15vmin', h: '12vmin', r: -9, o: '0.30', clip: 'polygon(0% 20%, 54% 0%, 100% 40%, 74% 100%, 14% 88%)' },
    ]

    /** Build the ember field; each node keeps its own simulated params. */
    function buildEmbers(host) {
      const rand = makeRandom(0x1a2b3c4d)
      const list = []
      const frag = document.createDocumentFragment()
      for (let i = 0; i < 34; i += 1) {
        const dust = i % 6 === 5
        const el = document.createElement('div')
        el.className = 'jzs-ember'
        if (dust) el.dataset.kind = 'dust'
        const width = dust ? 3 + rand() * 4 : 4 + rand() * 10
        el.style.setProperty('--x', (rand() * 100).toFixed(1) + '%')
        el.style.setProperty('--w', width.toFixed(1) + 'px')
        frag.appendChild(el)
        list.push({
          el,
          speed: dust ? 0.006 + rand() * 0.01 : 0.013 + rand() * 0.028,
          sway: 6 + rand() * 26,
          swayFreq: 0.18 + rand() * 0.5,
          phase: rand() * Math.PI * 2,
          alpha: dust ? 0.2 + rand() * 0.26 : 0.3 + rand() * 0.46,
          twinkle: 0.5 + rand() * 1.8,
        })
      }
      host.appendChild(frag)
      return list
    }

    /* -------------------------- DOM -------------------------- */
    function makeStyle(text) {
      const el = document.createElement('style')
      el.textContent = text
      return el
    }

    function buildStage() {
      const stage = document.createElement('div')
      stage.id = STAGE_ID
      stage.setAttribute('aria-hidden', 'true')
      stage.innerHTML = [
        '<div class="jzs-layer jzs-sky"></div>',
        '<div class="jzs-sun"></div>',
        '<div class="jzs-layer jzs-cracks"></div>',
        '<div class="jzs-layer jzs-rays"></div>',
        '<div class="jzs-layer jzs-shafts"><i></i><i></i><i></i></div>',
        '<div class="jzs-layer jzs-shards"></div>',
        '<div class="jzs-layer jzs-scrim"></div>',
        '<div class="jzs-layer jzs-vignette"></div>',
      ].join('')
      const shards = stage.querySelector('.jzs-shards')
      for (const s of SHARDS) {
        const el = document.createElement('div')
        el.className = 'jzs-shard'
        el.style.cssText = `left:${s.left};top:${s.top};width:${s.w};height:${s.h};`
          + `clip-path:${s.clip};--r:${s.r}deg;--o:${s.o};`
        shards.appendChild(el)
      }
      return stage
    }

    function buildOverlay() {
      const overlay = document.createElement('div')
      overlay.id = OVERLAY_ID
      overlay.setAttribute('aria-hidden', 'true')
      overlay.innerHTML = [
        '<div class="jzs-glare"></div>',
        '<div class="jzs-embers"></div>',
        '<div class="jzs-sweep"></div>',
        '<div class="jzs-aura"></div>',
      ].join('')
      const embers = buildEmbers(overlay.querySelector('.jzs-embers'))
      return { overlay, embers }
    }

    function buildHud(onCycle) {
      const hud = document.createElement('div')
      hud.id = HUD_ID
      hud.innerHTML = [
        '<div class="jzs-chip" role="status" aria-live="polite"></div>',
        '<button class="jzs-btn" type="button" aria-label="镜 · 炽阳神光 · 动效档位">镜<span class="jzs-ring"></span></button>',
      ].join('')
      const btn = hud.querySelector('button')
      btn.addEventListener('click', onCycle)
      return { hud, btn, chip: hud.querySelector('.jzs-chip'), ring: hud.querySelector('.jzs-ring') }
    }

    /* --------------------------- apply --------------------------- */
    function mount() {
      const doc = document
      const root = doc.documentElement
      const body = doc.body
      if (!body) return () => {}

      const disposers = []
      const priorMotion = root.getAttribute(ATTR)
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

      /* HMR guard: a hot replace can leave the previous instance's nodes and
       * frame loop behind. Take a generation stamp, drop any stale nodes, and
       * let every loop retire itself as soon as a newer generation exists. */
      const generation = (window.__jzsGeneration = (window.__jzsGeneration || 0) + 1)
      for (const stale of doc.querySelectorAll(`#${STAGE_ID}, #${OVERLAY_ID}, #${HUD_ID}, #jzs-debug`)) stale.remove()

      const styleTokens = makeStyle(TOKENS_CSS)
      const styleStage = makeStyle(STAGE_CSS)
      const styleOverlay = makeStyle(OVERLAY_CSS)
      const styleHud = makeStyle(HUD_CSS)
      doc.head.append(styleTokens, styleStage, styleOverlay, styleHud)
      disposers.push(() => {
        for (const el of [styleTokens, styleStage, styleOverlay, styleHud]) el.remove()
      })

      /* Force the dark palette so the artwork always has its backdrop, and keep
       * it forced if the theme presenter toggles the attribute back. */
      const forceDark = () => {
        if (!body.hasAttribute('data-ds-dark-theme')) body.setAttribute('data-ds-dark-theme', '')
      }
      forceDark()
      const guard = new MutationObserver(forceDark)
      guard.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      disposers.push(() => guard.disconnect())

      const stage = buildStage()
      body.appendChild(stage)
      disposers.push(() => stage.remove())

      const built = buildOverlay()
      const overlay = built.overlay
      body.appendChild(overlay)
      disposers.push(() => overlay.remove())

      const glareEl = overlay.querySelector('.jzs-glare')
      const emberList = built.embers
      const sweepEl = overlay.querySelector('.jzs-sweep')
      const auraEl = overlay.querySelector('.jzs-aura')

      /* ---- motion level ---- */
      let mode = 'full'
      try {
        const saved = localStorage.getItem(STORE_KEY)
        if (saved && MODES.includes(saved)) mode = saved
      } catch (err) {}
      if (reduced && mode === 'full') mode = 'calm'

      let chipTimer = 0
      const hudEls = buildHud(cycle)
      body.appendChild(hudEls.hud)
      disposers.push(() => hudEls.hud.remove())

      function showChip(text) {
        hudEls.chip.textContent = text
        hudEls.chip.setAttribute('data-show', '1')
        clearTimeout(chipTimer)
        chipTimer = setTimeout(() => hudEls.chip.removeAttribute('data-show'), 1600)
      }

      /* ---- the one clock ---- */
      let raf = 0
      let running = false
      let last = 0
      let acc = 0
      let clock = 0
      let ringAngle = 0
      let tick = 0

      function render() {
        const t = clock

        /* the sun's breath: a very slow value, so it only touches the DOM
           once every few ticks instead of every frame */
        tick += 1
        if (tick % 6 === 1) {
          const breath = Math.sin(t * 0.42)
          glareEl.style.transform = `scale(${(1 + 0.035 * breath).toFixed(4)})`
          glareEl.style.opacity = (0.78 + 0.2 * Math.sin(t * 0.42 + 1.1)).toFixed(3)
        }

        /* embers: rise, sway, twinkle */
        const span = window.innerHeight + 120
        for (let i = 0; i < emberList.length; i += 1) {
          const e = emberList[i]
          const travel = ((t * e.speed) % 1 + 1) % 1
          const y = -travel * span
          const x = Math.sin(t * e.swayFreq + e.phase) * e.sway
          const fade = travel < 0.08 ? travel / 0.08 : (travel > 0.82 ? (1 - travel) / 0.18 : 1)
          const twinkle = 0.7 + 0.3 * Math.sin(t * e.twinkle + e.phase)
          e.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
          e.el.style.opacity = Math.max(0, e.alpha * fade * twinkle).toFixed(3)
        }

        /* sweep: a highlight every ~19 s */
        const cycle = 19
        const p = ((t % cycle) + cycle) % cycle
        if (p < 4.2) {
          const q = p / 4.2
          sweepEl.style.transform = `translate3d(${(-42 + 88 * q).toFixed(2)}%, 0, 0)`
          sweepEl.style.opacity = (Math.sin(Math.PI * q) * 0.8).toFixed(3)
        } else if (sweepEl.style.opacity !== '0') {
          sweepEl.style.opacity = '0'
        }

        /* emblem ring */
        ringAngle = (ringAngle + 0.6) % 360
        hudEls.ring.style.transform = `rotate(${ringAngle.toFixed(2)}deg)`
      }

      function frame(now) {
        if (!running) return
        if (window.__jzsGeneration !== generation) {
          stopClock()
          return
        }
        raf = window.requestAnimationFrame(frame)
        const fps = FPS[mode]
        if (!fps) return
        const dt = Math.min(0.25, (now - (last || now)) / 1000)
        last = now
        acc += dt
        if (acc < 1 / fps) return
        clock += acc * SPEED[mode]
        acc = 0
        render()
      }

      function startClock() {
        if (running || mode === 'off' || doc.hidden) return
        running = true
        last = 0
        acc = 0
        render()
        raf = window.requestAnimationFrame(frame)
      }

      function stopClock() {
        running = false
        if (raf) window.cancelAnimationFrame(raf)
        raf = 0
      }
      disposers.push(stopClock)

      function applyMode(next) {
        mode = next
        root.setAttribute(ATTR, mode)
        /* Only the colour tokens switch off with the theme; the artwork sheets
         * stay loaded and their nodes are hidden inline, so "off" can never
         * leave an unstyled stage painted over the interface. */
        styleTokens.disabled = mode === 'off'
        stage.style.display = mode === 'off' ? 'none' : ''
        overlay.style.display = mode === 'off' ? 'none' : ''
        hudEls.btn.title = MODE_LABEL[mode]
        hudEls.btn.setAttribute('aria-label', `镜 · 炽阳神光（${MODE_LABEL[mode]}）`)
        if (mode === 'off') stopClock()
        else startClock()
        try { localStorage.setItem(STORE_KEY, mode) } catch (err) {}
      }

      function cycle() {
        applyMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length])
        showChip(MODE_LABEL[mode])
      }

      /* ---- pointer aura ---- */
      let auraTarget = null
      const auraPos = { x: -999, y: -999 }
      let auraRaf = 0

      const auraTick = () => {
        auraRaf = 0
        if (!auraTarget) return
        auraPos.x += (auraTarget.x - auraPos.x) * 0.16
        auraPos.y += (auraTarget.y - auraPos.y) * 0.16
        auraEl.style.transform = `translate3d(${auraPos.x.toFixed(1)}px, ${auraPos.y.toFixed(1)}px, 0)`
        if (Math.abs(auraTarget.x - auraPos.x) > 0.8 || Math.abs(auraTarget.y - auraPos.y) > 0.8) {
          auraRaf = window.requestAnimationFrame(auraTick)
        }
      }
      const onMove = (event) => {
        if (mode === 'off') return
        auraTarget = { x: event.clientX, y: event.clientY }
        auraEl.style.opacity = '1'
        if (!auraRaf) auraRaf = window.requestAnimationFrame(auraTick)
      }
      const onLeave = () => { auraEl.style.opacity = '0'; auraTarget = null }

      window.addEventListener('pointermove', onMove, { passive: true })
      doc.addEventListener('pointerleave', onLeave)
      disposers.push(() => {
        window.removeEventListener('pointermove', onMove)
        doc.removeEventListener('pointerleave', onLeave)
        if (auraRaf) window.cancelAnimationFrame(auraRaf)
      })

      /* Pause whenever the picture cannot be seen: a hidden document or an
       * unfocused window. The art resumes on the next visible frame. */
      const onVisibility = () => {
        if (doc.hidden) stopClock()
        else startClock()
      }
      const onBlur = () => stopClock()
      const onFocus = () => startClock()
      doc.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('blur', onBlur)
      window.addEventListener('focus', onFocus)
      disposers.push(() => {
        doc.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('blur', onBlur)
        window.removeEventListener('focus', onFocus)
      })

      applyMode(mode)
      if (reduced) overlay.querySelector('.jzs-embers').style.opacity = '0.5'

      disposers.push(() => {
        clearTimeout(chipTimer)
        if (priorMotion === null) doc.documentElement.removeAttribute(ATTR)
        else doc.documentElement.setAttribute(ATTR, priorMotion)
      })

      return () => {
        for (const off of disposers.reverse()) {
          try { off() } catch (err) {}
        }
      }
    }

    return {
      name: 'jing-chiyang-theme',
      inject: [],
      apply(ctx) {
        ctx.effect(() => {
          if (typeof document === 'undefined' || !document.body) return () => {}
          return mount()
        })
      },
    }
  },
})
