/**
 * canvas.js — Canvas setup and rendering utilities.
 */

/**
 * Set up a canvas for retina / high-DPI displays.
 * Returns the 2D context with the scale already applied.
 */
export function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
