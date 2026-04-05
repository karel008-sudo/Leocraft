import Phaser from 'phaser';

/**
 * draw.ts – Procedural drawing utilities for Phaser Graphics.
 *
 * These helpers produce visual effects that are not natively supported
 * by Phaser's Graphics API (gradients, glows, layered depth).
 */

// ── Gradient helpers ──────────────────────────────────────────────────────────

/** Simulates a vertical gradient by drawing N horizontal strips. */
export function vGradient(
  g:     Phaser.GameObjects.Graphics,
  x:     number,
  y:     number,
  w:     number,
  h:     number,
  cTop:  number,
  cBot:  number,
  steps  = 14,
): void {
  const tr = (cTop >> 16) & 0xFF, tg_ = (cTop >> 8) & 0xFF, tb = cTop & 0xFF;
  const br = (cBot >> 16) & 0xFF, bg_ = (cBot >> 8) & 0xFF, bb = cBot & 0xFF;
  const sh = h / steps;

  for (let i = 0; i < steps; i++) {
    const t  = i / (steps - 1);
    const r  = Math.round(tr + (br - tr) * t);
    const gv = Math.round(tg_ + (bg_ - tg_) * t);
    const b  = Math.round(tb + (bb - tb) * t);
    g.fillStyle((r << 16) | (gv << 8) | b, 1)
     .fillRect(x, y + i * sh, w, sh + 1.5);
  }
}

/** Simulates a horizontal gradient by drawing N vertical strips. */
export function hGradient(
  g:    Phaser.GameObjects.Graphics,
  x:    number,
  y:    number,
  w:    number,
  h:    number,
  cL:   number,
  cR:   number,
  steps = 14,
): void {
  const lr = (cL >> 16) & 0xFF, lg_ = (cL >> 8) & 0xFF, lb = cL & 0xFF;
  const rr = (cR >> 16) & 0xFF, rg_ = (cR >> 8) & 0xFF, rb = cR & 0xFF;
  const sw = w / steps;

  for (let i = 0; i < steps; i++) {
    const t  = i / (steps - 1);
    const r  = Math.round(lr + (rr - lr) * t);
    const gv = Math.round(lg_ + (rg_ - lg_) * t);
    const b  = Math.round(lb + (rb - lb) * t);
    g.fillStyle((r << 16) | (gv << 8) | b, 1)
     .fillRect(x + i * sw, y, sw + 1.5, h);
  }
}

// ── Glow helpers ──────────────────────────────────────────────────────────────

/** Draws a radial glow (circular, fading from innerR to outerR). */
export function circleGlow(
  g:     Phaser.GameObjects.Graphics,
  cx:    number,
  cy:    number,
  color: number,
  innerR: number,
  outerR: number,
  steps  = 6,
  maxAlpha = 0.12,
): void {
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const r = innerR + (outerR - innerR) * (1 - t);
    g.fillStyle(color, maxAlpha * t).fillCircle(cx, cy, r);
  }
}

/** Draws a rectangular glow (soft halo around a box). */
export function rectGlow(
  g:        Phaser.GameObjects.Graphics,
  x:        number,
  y:        number,
  w:        number,
  h:        number,
  color:    number,
  padding:  number,
  radius:   number,
  steps     = 5,
  maxAlpha  = 0.10,
): void {
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const p = padding * t;
    g.fillStyle(color, maxAlpha * t)
     .fillRoundedRect(x - p, y - p, w + p * 2, h + p * 2, radius + p);
  }
}

// ── Color math ────────────────────────────────────────────────────────────────

/** Returns a lightened version of a hex colour. */
export function lighten(hex: number, amount: number): number {
  const r = Math.min(255, ((hex >> 16) & 0xFF) + amount);
  const g = Math.min(255, ((hex >> 8)  & 0xFF) + amount);
  const b = Math.min(255, ( hex        & 0xFF) + amount);
  return (r << 16) | (g << 8) | b;
}

/** Returns a darkened version of a hex colour. */
export function darken(hex: number, amount: number): number {
  const r = Math.max(0, ((hex >> 16) & 0xFF) - amount);
  const g = Math.max(0, ((hex >> 8)  & 0xFF) - amount);
  const b = Math.max(0, ( hex        & 0xFF) - amount);
  return (r << 16) | (g << 8) | b;
}

/** Mixes two hex colours at ratio t (0=a, 1=b). */
export function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xFF, ag = (a >> 8) & 0xFF, ab = a & 0xFF;
  const br = (b >> 16) & 0xFF, bg = (b >> 8) & 0xFF, bb = b & 0xFF;
  const r  = Math.round(ar + (br - ar) * t);
  const g  = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bv;
}
