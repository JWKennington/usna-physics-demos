import { useRef, useEffect, useState } from 'react';
import { setupCanvas } from '@shared/lib/canvas';

/**
 * NeutronStarSpin — Act III "Spin & gravity" wow demo: conservation of
 * angular momentum.
 *
 * A star modeled as a uniform sphere has moment of inertia I = k*M*R^2 with
 * mass M fixed. Angular momentum L = I*omega is CONSERVED as the star collapses,
 * so omega(R) = L / (k*M*R^2) — spin rate scales as 1/R^2. Halve the radius and
 * the spin quadruples. This is EXACTLY the figure skater pulling her arms in:
 * shrink the mass distribution, spin faster.
 *
 * Rotational KE = 1/2 I omega^2 = L^2 / (2I) also scales as 1/R^2 and RISES as R
 * shrinks — that extra energy is the work gravity does pulling mass inward (the
 * skater does the work with her muscles).
 *
 * The hook: the Sun (R ~ 700,000 km) turns once a month. Collapse it to the size
 * of Annapolis (~10 km) and it spins ~700 times a SECOND — a neutron star /
 * pulsar. We calibrate the slider so the smallest radius reads ~700 rev/s.
 *
 * The on-screen animation spin is CAPPED (real 700 Hz would strobe); we convey
 * the true speed with brighter gold glow and longer motion-blur trails while the
 * numeric readout shows the honest omega. Self-contained (own canvas + rAF +
 * ResizeObserver); palette + setupCanvas match the shared design system.
 */

// Physics calibration. Radius fraction f runs 1.0 (big slow star) -> 0.03 (tiny
// pulsar). Because omega ∝ 1/R^2 and KE ∝ 1/R^2, we quote both relative to f=1.
const F_MAX = 1.0;      // radius fraction at slider max (100%)
const F_MIN = 0.03;     // radius fraction at slider min (~3% — neutron star)
const BASE_REV = 3.0e-4; // rev/s at f=1 (slow: ~once per hour-ish on our clock)
// At f=F_MIN, omega = BASE_REV / F_MIN^2. Choose BASE_REV so this reads ~700.
// BASE_REV = 700 * F_MIN^2 = 700 * 0.0009 = 0.63 rev/s at full size.
const OMEGA0 = 700 * F_MIN * F_MIN; // rev/s at f=1 so f_min -> 700 rev/s

const SUN_R_KM = 696000;   // solar radius for the km readout
const N_HOTSPOTS = 5;      // bright orbiting markers to show rotation

export default function NeutronStarSpin({ compact = false }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [pct, setPct] = useState(100); // radius as percent, 100 -> 3
  const pctRef = useRef(pct);
  pctRef.current = pct;

  const f = pct / 100;
  const omega = OMEGA0 / (f * f);          // true rev/s
  const keRel = 1 / (f * f);               // rotational KE relative to f=1
  const radiusKm = SUN_R_KM * f;           // physical radius readout

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let ctx, W, H, raf, last;
    let phase = 0; // accumulated rotation angle (rad), advanced by visualOmega

    const col = (name, fallback) =>
      (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);

    const resize = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      ctx = setupCanvas(canvas, W, H);
    };

    const draw = (now) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const gold = col('--color-gold', '#C5B783');
      const grid = col('--color-grid', '#1A2332');
      const muted = col('--color-muted', '#8B8C8E');

      const fLive = pctRef.current / 100;
      const omegaLive = OMEGA0 / (fLive * fLive); // true rev/s

      // Visual spin is capped so it never strobes. Map true omega (rev/s) onto
      // a gentle on-screen rate: fast enough to read as "spinning hard" but no
      // more than a couple Hz. Speed beyond the cap is conveyed by trails/glow.
      const VIS_CAP = 2.2;                          // max on-screen rev/s
      const visRev = Math.min(VIS_CAP, 0.25 + omegaLive * 0.006);
      phase += visRev * 2 * Math.PI * dt;

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      // Faint reference circle at the full-size radius so shrink reads clearly.
      const maxR = Math.min(W, H) * 0.36;
      const R = maxR * fLive;                        // drawn star radius

      ctx.strokeStyle = grid;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // "Collapse" cue: how far along the shrink we are, 0 (big) -> 1 (pulsar).
      const t = (F_MAX - fLive) / (F_MAX - F_MIN);   // 0..1
      const heat = Math.max(0, Math.min(1, t));

      // Motion-blur trails: draw several ghost copies of the hotspots trailing
      // behind the current phase. More/longer as spin rises. This conveys speed
      // without strobing the graphics.
      const nGhosts = Math.round(3 + heat * 16);
      const ghostSpan = 0.35 + heat * 1.4;           // radians of trail

      const drawHotspots = (rotate, alpha, radius) => {
        for (let k = 0; k < N_HOTSPOTS; k++) {
          const a = rotate + (k / N_HOTSPOTS) * 2 * Math.PI;
          const hx = cx + Math.cos(a) * radius;
          const hy = cy + Math.sin(a) * radius;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = gold;
          ctx.beginPath();
          ctx.arc(hx, hy, Math.max(2, R * 0.09), 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      const spotRing = R * 0.82;
      for (let g = nGhosts; g >= 1; g--) {
        const back = (g / nGhosts) * ghostSpan;
        const alpha = 0.12 * (1 - g / (nGhosts + 1));
        drawHotspots(phase - back, alpha, spotRing);
      }

      // Star body: brighter, hotter gold with a stronger glow as it collapses.
      const glow = 10 + heat * 55;
      const bodyLight = col('--color-gold-light', '#D4C99E');
      const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
      grad.addColorStop(0, mix('#FFFFFF', bodyLight, heat * 0.7));
      grad.addColorStop(0.6, gold);
      grad.addColorStop(1, mix(gold, '#5a4f22', 0.5));

      ctx.save();
      ctx.shadowColor = gold;
      ctx.shadowBlur = glow;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Rotating spokes to make the spin legible on the body itself.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(phase);
      ctx.strokeStyle = mix('#0D1321', '#000000', 0.3);
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = Math.max(1.5, R * 0.05);
      for (let s = 0; s < 3; s++) {
        const a = (s / 3) * Math.PI; // 3 diameters -> 6 spokes
        ctx.beginPath();
        ctx.moveTo(-Math.cos(a) * R * 0.9, -Math.sin(a) * R * 0.9);
        ctx.lineTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      // Bright leading hotspots on top of the trails.
      drawHotspots(phase, 0.95, spotRing);

      // Pulsar beams: two counter-directed lighthouse cones that appear once the
      // star is well collapsed. Sweep with the rotation.
      if (heat > 0.55) {
        const beamA = phase * 0.6;
        const beamAlpha = (heat - 0.55) / 0.45 * 0.5;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(beamA);
        for (const dir of [0, Math.PI]) {
          const bg = ctx.createLinearGradient(0, 0, Math.cos(dir) * maxR * 1.6, Math.sin(dir) * maxR * 1.6);
          bg.addColorStop(0, `rgba(197,183,131,${beamAlpha})`);
          bg.addColorStop(1, 'rgba(197,183,131,0)');
          ctx.fillStyle = bg;
          const spread = 0.12;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(dir - spread) * maxR * 1.6, Math.sin(dir - spread) * maxR * 1.6);
          ctx.lineTo(Math.cos(dir + spread) * maxR * 1.6, Math.sin(dir + spread) * maxR * 1.6);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Bottom label naming where we are on the size scale.
      ctx.fillStyle = muted;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const tag = heat > 0.85 ? 'neutron star / pulsar' : heat < 0.15 ? 'sun-sized star' : 'collapsing';
      ctx.fillText(tag, cx, cy + maxR + 22);

      raf = requestAnimationFrame(draw);
    };

    // Small color-mix helper for hex strings (0..1 toward b).
    function mix(a, b, tRaw) {
      const tt = Math.max(0, Math.min(1, tRaw));
      const pa = hex(a), pb = hex(b);
      const r = Math.round(pa[0] + (pb[0] - pa[0]) * tt);
      const g = Math.round(pa[1] + (pb[1] - pa[1]) * tt);
      const bl = Math.round(pa[2] + (pb[2] - pa[2]) * tt);
      return `rgb(${r},${g},${bl})`;
    }
    function hex(c) {
      const h = c.replace('#', '');
      const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
      return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
    }

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Readout formatting: rev/s spans ~0.6 -> ~700, so switch precision.
  const omegaStr = omega >= 100 ? omega.toFixed(0) : omega >= 10 ? omega.toFixed(1) : omega.toFixed(2);
  const keStr = keRel >= 100 ? keRel.toFixed(0) : keRel.toFixed(1);
  const radiusStr = radiusKm >= 1000 ? `${(radiusKm / 1000).toFixed(0)}k` : radiusKm.toFixed(0);

  return (
    <div className="flex flex-col h-full w-full gap-3">
      <div ref={wrapRef} className="relative flex-1 min-h-0 rounded-lg overflow-hidden" style={{ background: '#0D1321' }}>
        <canvas ref={canvasRef} className="block" />
        <div className="absolute top-2 left-3 text-xs font-mono text-usna-gold/90 space-y-0.5">
          <div>radius&nbsp;&nbsp;{pct.toFixed(0)}% &middot; {radiusStr} km</div>
          <div>spin&nbsp;&nbsp;&nbsp;&nbsp;{omegaStr} rev/s</div>
          <div>rot KE&nbsp;&nbsp;&times;{keStr}</div>
        </div>
      </div>
      <div className="px-1">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-usna-text text-sm font-medium">Radius</span>
          <span className="font-mono text-lg text-usna-gold tabular-nums">{pct}%</span>
        </div>
        <input
          type="range" min={3} max={100} step={1} value={pct}
          onInput={(e) => setPct(parseFloat(e.target.value))}
          aria-label="Star radius" className="w-full"
        />
        {!compact && (
          <p className="text-usna-muted text-xs mt-2">
            L = I&omega; is conserved, so &omega; &prop; 1/R&sup2; &mdash; shrink the star like a
            skater pulling in her arms and the spin skyrockets to ~700 rev/s.
          </p>
        )}
      </div>
    </div>
  );
}
