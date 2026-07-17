import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProjectileArc from './demos/ProjectileArc';
import AirVacuumDrop from './demos/AirVacuumDrop';
import CollisionCarts from './demos/CollisionCarts';
import GravityAssist from './demos/GravityAssist';
import NeutronStarSpin from './demos/NeutronStarSpin';
import OrbitSim from './demos/OrbitSim';
import DopplerWavefronts from './demos/DopplerWavefronts';
import StandingWaves from './demos/StandingWaves';

/**
 * SeasonPreview — the Day-1 (M1) "semester in four acts" performance.
 *
 * A full-screen, keyboard-driven deck that lives OUTSIDE the usual course/chapter
 * chrome (its own route, /#/sp211/season-preview). Each act follows the plan's
 * fixed rhythm — one live visual, one naval mission, one frontier "wow" — then a
 * hard cut. Live experiments are embedded directly; video/audio are local files.
 *
 * Keys:  →/Space next · ← prev · F fullscreen · N speaker notes · Esc exit
 */
const MEDIA = `${import.meta.env.BASE_URL}media/season-preview/`;

const GOLD = '#C5B783';
const NAVY = '#00205B';
const TEXT = '#F0ECE3';
const MUTED = '#8B8C8E';

export default function SeasonPreview() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const n = SLIDES.length;
  // Deep-link to an act with ?s=N (also lets you resume mid-deck).
  const start = Math.min(n - 1, Math.max(0, parseInt(params.get('s'), 10) || 0));
  const [i, setI] = useState(start);
  const [notes, setNotes] = useState(false);

  // Force the dark (projector) palette while the deck is mounted.
  useEffect(() => {
    const html = document.documentElement;
    const had = html.classList.contains('dark');
    html.classList.add('dark');
    return () => { if (!had) html.classList.remove('dark'); };
  }, []);

  const next = useCallback(() => setI((k) => Math.min(n - 1, k + 1)), [n]);
  const prev = useCallback(() => setI((k) => Math.max(0, k - 1)), []);
  const toggleFull = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(n - 1);
      else if (e.key === 'f' || e.key === 'F') toggleFull();
      else if (e.key === 'n' || e.key === 'N') setNotes((v) => !v);
      else if (e.key === 'Escape') {
        if (document.fullscreenElement) return; // let the browser exit fullscreen first
        navigate('/sp211');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, toggleFull, navigate, n]);

  const slide = SLIDES[i];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden select-none"
      style={{ background: `radial-gradient(120% 120% at 50% 0%, #012 0%, #001233 55%, #00060f 100%)`, color: TEXT }}
    >
      {/* slide body (only the active slide mounts, so its videos/animations are fresh) */}
      <div className="flex-1 min-h-0 px-10 pt-8 pb-4 flex flex-col">
        {slide.render()}
      </div>

      {/* speaker notes */}
      {notes && slide.notes && (
        <div className="px-10 pb-2">
          <div className="rounded-lg px-4 py-3 text-sm leading-relaxed"
               style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${NAVY}`, color: TEXT }}>
            <span className="font-mono text-xs uppercase tracking-widest mr-2" style={{ color: GOLD }}>notes</span>
            {slide.notes}
          </div>
        </div>
      )}

      {/* footer: progress + hints */}
      <div className="flex items-center justify-between px-10 py-3 text-xs" style={{ color: MUTED }}>
        <div className="flex items-center gap-2">
          {SLIDES.map((s, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Go to slide ${k + 1}`}
              className="h-2 rounded-full transition-all"
              style={{ width: k === i ? 22 : 8, background: k === i ? GOLD : 'rgba(255,255,255,0.25)' }} />
          ))}
          <span className="ml-3 font-mono">{i + 1} / {n}</span>
        </div>
        <div className="font-mono tracking-wide">
          →/Space next · ← back · F fullscreen · N notes · Esc exit
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── slide primitives ─────────────────────────── */

function Eyebrow({ act, unit, test }) {
  return (
    <div className="font-mono text-sm tracking-widest uppercase" style={{ color: GOLD }}>
      Act {act} <span style={{ color: MUTED }}>·</span> {unit} <span style={{ color: MUTED }}>→ {test}</span>
    </div>
  );
}

function Beat({ tag, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,183,131,0.25)' }}>
      <div className="font-mono text-[11px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>{tag}</div>
      <div className="text-[15px] leading-snug" style={{ color: TEXT }}>{children}</div>
    </div>
  );
}

function Video({ src, caption, ambient = false }) {
  return (
    <figure className="flex flex-col gap-1 min-h-0">
      <video
        src={`${MEDIA}${src}`}
        className="w-full rounded-lg bg-black object-cover flex-1 min-h-0"
        controls playsInline preload="metadata"
        {...(ambient ? { autoPlay: true, muted: true, loop: true } : {})}
      />
      {caption && <figcaption className="text-xs" style={{ color: MUTED }}>{caption}</figcaption>}
    </figure>
  );
}

function ActFrame({ eyebrow, title, demo, aside, stat }) {
  return (
    <>
      <header className="mb-4">
        {eyebrow}
        <h2 className="text-4xl font-bold mt-1" style={{ color: TEXT }}>{title}</h2>
      </header>
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-7 min-h-0 rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {demo}
        </div>
        <div className="col-span-5 min-h-0 flex flex-col gap-3">{aside}</div>
      </div>
      {stat && (
        <div className="mt-4 text-center text-lg" style={{ color: MUTED }}>{stat}</div>
      )}
    </>
  );
}

/* ─────────────────────────────── slides ──────────────────────────────── */

const SLIDES = [
  // 0 — Title
  {
    render: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img src={`${import.meta.env.BASE_URL}usna-logo-small.png`} alt="USNA" className="h-24 mb-8 opacity-90" />
        <div className="font-mono tracking-[0.35em] text-sm mb-4" style={{ color: GOLD }}>SP211 · GENERAL PHYSICS I</div>
        <h1 className="text-6xl font-extrabold mb-4" style={{ color: TEXT }}>Season Preview</h1>
        <p className="text-2xl mb-10" style={{ color: MUTED }}>Four acts. Fifteen weeks. One toolkit.</p>
        <p className="max-w-2xl text-lg leading-relaxed" style={{ color: TEXT }}>
          Everything you are about to see is on the syllabus. The homework teaches you to compute it,
          the labs let you measure it, and the simulations let you explore it.
        </p>
        <div className="mt-12 font-mono text-sm animate-pulse" style={{ color: GOLD }}>press → to begin</div>
      </div>
    ),
    notes: 'Say the meta-message out loud, then hard cut into Act I. Three minutes per act is a ceiling, not a target.',
  },

  // 1 — Act I-a: Things that fly
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="I" unit="Kinematics & Newton" test="Test 1" />}
        title="Things that fly"
        demo={<ProjectileArc />}
        aside={<>
          <Video src="x47b-catapult.mp4" ambient caption="X-47B — first autonomous carrier catapult launch (US Navy)" />
          <Beat tag="Mission">
            The catapult takes an aircraft from 0 to <b>165&nbsp;kt in ~2&nbsp;s</b> — about <b>3&nbsp;g</b>.
            You will compute that acceleration in week 3 and determine whether a pilot can withstand it.
          </Beat>
          <Beat tag="Application">
            The same range equation is a firing solution: naval gunfire reaches a target two ways, a high arc
            and a low one — the complementary angles on screen.
          </Beat>
        </>}
        stat="Drag the launch angle — the dashed complementary angle always lands at the same range."
      />
    ),
    notes: 'Drop something real first. Tease the angle slider live. Park questions for later.',
  },

  // 2 — Act I-b: ...and how they fall
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="I" unit="Kinematics & Newton" test="Test 1" />}
        title="…and how they fall"
        demo={<AirVacuumDrop />}
        aside={<>
          <Video src="apollo15-hammer-feather.mp4" caption="Apollo 15 — hammer & feather on the Moon (NASA)" />
          <Beat tag="Frontier — the Moon">
            Hammer and feather, released together, land together. With no air, everything falls at the same
            rate: the vacuum approximation we rely on all semester, made real.
          </Beat>
          <Beat tag="Application">
            A HALO jumper levels off near <b>~55&nbsp;m/s</b> terminal speed; the same drag law sets a
            parachute's descent and a falling store's path.
          </Beat>
        </>}
        stat="Turn air resistance to zero and the two land together — that is the Moon."
      />
    ),
    notes: 'Slide air resistance to zero live; the two balls sync up. Then play the Apollo clip (has audio).',
  },

  // 3 — Act II-a: Collisions & impulse
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="II" unit="Work · Energy · Momentum" test="Test 2" />}
        title="Collisions & impulse"
        demo={<CollisionCarts />}
        aside={<>
          <Video src="x47b-arrested-landing.mp4" ambient caption="X-47B — first carrier arrested landing (US Navy)" />
          <Beat tag="Mission">
            The arresting gear stops a 25-ton jet at ~130&nbsp;kt in about <b>2&nbsp;s and ~100&nbsp;m</b> —
            an impulse problem, order <b>~50&nbsp;MJ</b> of energy, and you will do it.
          </Beat>
          <Beat tag="Application">
            A 5-inch gun's recoil is the same momentum bookkeeping: the shell leaves fast, the ship barely
            moves because it is thousands of times heavier.
          </Beat>
        </>}
        stat="Momentum is conserved in every collision; kinetic energy only when it is perfectly elastic."
      />
    ),
    notes: 'Drag elasticity from 1 to 0; the KE bar collapses while momentum holds. This is the "two carts."',
  },

  // 4 — Act II-b: Momentum, at a distance
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="II" unit="Work · Energy · Momentum" test="Test 2" />}
        title="Momentum, at a distance"
        demo={<GravityAssist />}
        aside={<>
          <Beat tag="Frontier — gravity assist">
            Voyager gained speed from Jupiter in an encounter with <i>no contact</i> — the same conservation
            law as two carts, with gravity as the spring. Vary the flyby distance to see the boost grow.
          </Beat>
          <Beat tag="Application">
            Every outer-planet mission — Voyager, Cassini, New Horizons — buys speed this way instead of
            carrying the fuel for it.
          </Beat>
        </>}
        stat="A light craft whips around a heavy moving planet and leaves faster, exactly like a cart off a wall."
      />
    ),
    notes: 'The slingshot is the payoff of the cart collision — same law, no contact. Default flyby boosts ~50%.',
  },

  // 5 — Act III-a: Spin
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="III" unit="Rotation · Gravity · Fluids" test="Test 3.1" />}
        title="Spin"
        demo={<NeutronStarSpin />}
        aside={<>
          <Beat tag="Mission">
            A gyroscope resists being tilted, and that resistance holds a heading with no external reference:
            gyrocompass and inertial navigation are how a submarine runs blind.
          </Beat>
          <Beat tag="Frontier — neutron star">
            Collapse a star to the size of Annapolis and it spins up to <b>~700 rev/s</b> — the same law as a
            figure skater drawing her arms in. Reduce the radius and watch the spin climb.
          </Beat>
        </>}
        stat="L = Iω is conserved: halve the radius, quadruple the spin."
      />
    ),
    notes: 'Hand the physical gyroscope around here. Park the flood of questions: "Week 11 — write it down."',
  },

  // 6 — Act III-b: Gravity & orbits
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="III" unit="Rotation · Gravity · Fluids" test="Test 3.1" />}
        title="Gravity & orbits"
        demo={<OrbitSim />}
        aside={<>
          <Beat tag="Mission">
            GPS satellites hold precise orbits set by this exact balance of speed and gravity; get the speed
            wrong and the constellation drifts.
          </Beat>
          <Beat tag="Frontier — escape">
            One number decides everything: below <b>√2 × circular speed</b> the orbit is bound, above it the
            body escapes. That threshold is why leaving Earth is the hard part.
          </Beat>
        </>}
        stat="Raise the launch speed from a tight ellipse, through a circle, to escape."
      />
    ),
    notes: 'Sweep launch speed slowly: circle → ellipse → escape. The dashed circle is the circular-orbit reference.',
  },

  // 7 — Act IV-a: Doppler & sound
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="IV" unit="Oscillations & Waves" test="Test 3.2" />}
        title="Doppler & sound"
        demo={<DopplerWavefronts />}
        aside={<>
          <Beat tag="Mission">
            Sonar is how the submarine force sees. Doppler sonar reads a target's speed straight off the
            frequency shift; push the source past Mach 1 for the bow shock.
          </Beat>
          <Beat tag="Application">
            The same shift drives weather and police radar, and a submarine corrects its fire-control
            solution for the motion of its own hull.
          </Beat>
        </>}
        stat="Below Mach 1 the pitch rises ahead and drops behind; past Mach 1 the crests form a shock cone."
      />
    ),
    notes: 'Drag speed up to and past Mach 1; the cone snaps in. Tie the shift to sonar ranging.',
  },

  // 8 — Act IV-b: Waves that carry
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow act="IV" unit="Oscillations & Waves" test="Test 3.2" />}
        title="Waves that carry"
        demo={<StandingWaves />}
        aside={<>
          <Beat tag="Application">
            Every instrument and every ship's hull has resonant modes like these; engineers tune structures
            to keep the dangerous ones away from the frequencies they will meet.
          </Beat>
          <Beat tag="Frontier — gravitational waves">
            The same standing-wave math, scaled to 4-km laser interferometers, detected two black holes
            colliding <b> 1.3 billion light-years</b> away. That is my research field.
          </Beat>
          <figure className="flex flex-col gap-1">
            <audio src={`${MEDIA}gw150914-chirp.wav`} controls className="w-full" />
            <figcaption className="text-xs" style={{ color: MUTED }}>
              GW150914 — the actual detector "chirp" (LIGO, frequency-shifted to be audible)
            </figcaption>
          </figure>
        </>}
        stat="Fixed ends allow only whole harmonics — from a guitar string to a 4-km interferometer."
      />
    ),
    notes: 'Step through harmonics, then play the chirp last — end on the personal connection. Test speakers first.',
  },

  // 5 — Closing
  {
    render: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl font-extrabold mb-6" style={{ color: TEXT }}>Four acts. One toolkit.</h2>
        <p className="max-w-3xl text-xl leading-relaxed mb-10" style={{ color: TEXT }}>
          Every one of these starts with <span style={{ color: GOLD }}>F = ma</span> or a
          <span style={{ color: GOLD }}> conservation law</span> — and by Friday you will have derived your first piece of it.
        </p>
        <div className="grid grid-cols-4 gap-4 max-w-4xl w-full mb-10">
          {[['I', 'Kinematics & Newton'], ['II', 'Energy & momentum'], ['III', 'Rotation & gravity'], ['IV', 'Waves']].map(([a, t]) => (
            <div key={a} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,183,131,0.25)' }}>
              <div className="font-mono text-lg" style={{ color: GOLD }}>{a}</div>
              <div className="text-sm mt-1" style={{ color: TEXT }}>{t}</div>
            </div>
          ))}
        </div>
        <p className="text-lg" style={{ color: MUTED }}>
          Fifteen weeks from now, every result you just saw will be one you can derive yourself.
        </p>
      </div>
    ),
    notes: 'Close, then one last Free Fall drop off-deck: "By Friday you’ll predict this entire curve with three equations."',
  },
];
