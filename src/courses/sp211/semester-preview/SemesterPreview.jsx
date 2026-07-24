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
import CircularMotion from './demos/CircularMotion';
import EnergyWell from './demos/EnergyWell';
import BuoyancyTank from './demos/BuoyancyTank';
import SpringSHM from './demos/SpringSHM';

/**
 * SemesterPreview — the Day-1 (M1) "semester in four units" performance.
 *
 * A full-screen, keyboard-driven deck that lives OUTSIDE the usual course/chapter
 * chrome (its own route, /#/sp211/semester-preview). Each act follows the plan's
 * fixed rhythm — one live visual, one naval mission, one frontier hook — then a
 * hard cut. Live experiments are embedded directly; video/audio are local files.
 *
 * Keys:  →/Space next · ← prev · F fullscreen · N speaker notes · Esc exit
 */
const MEDIA = `${import.meta.env.BASE_URL}media/semester-preview/`;

const GOLD = '#C5B783';
const NAVY = '#00205B';
const TEXT = '#F0ECE3';
const MUTED = '#8B8C8E';

export default function SemesterPreview() {
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

function Eyebrow({ num, unit, test }) {
  return (
    <div className="font-mono text-sm tracking-widest uppercase" style={{ color: GOLD }}>
      Unit {num} <span style={{ color: MUTED }}>·</span> {unit} <span style={{ color: MUTED }}>→ {test}</span>
    </div>
  );
}

function Beat({ tag, community, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,183,131,0.25)' }}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: GOLD }}>{tag}</span>
        {community && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(197,183,131,0.16)', color: GOLD, border: '1px solid rgba(197,183,131,0.35)' }}>
            {community}
          </span>
        )}
      </div>
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
        <h1 className="text-6xl font-extrabold mb-4" style={{ color: TEXT }}>Semester Preview</h1>
        <p className="text-2xl mb-10" style={{ color: MUTED }}>Four units. Fifteen weeks. One toolkit.</p>
        <p className="max-w-2xl text-lg leading-relaxed" style={{ color: TEXT }}>
          Everything you are about to see is on the syllabus. The homework teaches you to compute it,
          the labs let you measure it, and the simulations let you explore it.
        </p>
        <div className="mt-12 font-mono text-sm animate-pulse" style={{ color: GOLD }}>press → to begin</div>
      </div>
    ),
    notes: 'Say the meta-message out loud, then move into Unit I. Three minutes per unit is a ceiling, not a target.',
  },

  // 1 — Act I-a: Things that fly
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="I" unit="Kinematics & Newton" test="Test 1" />}
        title="Things that fly"
        demo={<ProjectileArc />}
        aside={<>
          <Video src="sniper-marine.mp4" ambient caption="A military sniper team engaging a distant target" />
          <Beat tag="Mission" community="Marine Corps">
            A Marine scout sniper puts this arc to work on every shot: the round starts falling the instant it
            leaves the barrel, so the scope is set high to compensate, and the crosswind, which is drag on the
            round, is dialed in to walk it back onto the target.
          </Beat>
          <Beat tag="Application" community="Aviation">
            The same launch physics runs a carrier catapult, which accelerates an aircraft from 0 to
            <b> 165&nbsp;kt in about 2&nbsp;s</b>, roughly <b>3&nbsp;g</b>. You will compute that in week 3.
          </Beat>
        </>}
        stat="Drag the launch angle. The dashed complementary angle always lands at the same range."
      />
    ),
    notes: 'Drop something real first. Tease the angle slider live. Park questions for later.',
  },

  // 2 — Act I-b: ...and how they fall
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="I" unit="Kinematics & Newton" test="Test 1" />}
        title="…and how they fall"
        demo={<AirVacuumDrop />}
        aside={<>
          <Video src="apollo15-hammer-feather.mp4" caption="Apollo 15: hammer and feather on the Moon (NASA)" />
          <Beat tag="Frontier · the Moon">
            Hammer and feather, released together, land together. With no air, everything falls at the same
            rate: the vacuum approximation we rely on all semester, made real.
          </Beat>
          <Beat tag="Application" community="Special Warfare">
            Naval special warfare plans a HALO insertion around this drag: the jumper reaches a terminal speed
            near <b>55&nbsp;m/s</b>, and the same physics sets the altitude to open the canopy.
          </Beat>
        </>}
        stat="Turn air resistance to zero and the two land together. That is the Moon."
      />
    ),
    notes: 'Slide air resistance to zero live; the two balls sync up. Then play the Apollo clip (has audio).',
  },

  // Unit I-c: Turning
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="I" unit="Kinematics & Newton" test="Test 1" />}
        title="Turning"
        demo={<CircularMotion />}
        aside={<>
          <Video src="blueangels-turn.mp4" ambient caption="US Navy Blue Angels banking through a turn (US Navy)" />
          <Beat tag="Application">
            Even at a constant speed, a turn is an acceleration, because the direction of the velocity keeps
            changing. A fighter pulls several g in a tight turn, and a ship's turning circle is the same
            physics at sea, only slower and wider.
          </Beat>
          <Beat tag="Idea">
            The acceleration always points to the center of the turn, and it grows with the square of the speed.
          </Beat>
        </>}
        stat="a = v² / r. Double the speed and you quadruple the pull toward the center."
      />
    ),
    notes: 'Constant speed, but the velocity vector keeps turning. Point out the inward acceleration arrow growing with v.',
  },

  // 3 — Act II-a: Collisions & impulse
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="II" unit="Work · Energy · Momentum" test="Test 2" />}
        title="Collisions & impulse"
        demo={<CollisionCarts />}
        aside={<>
          <Video src="eod-seamine.mp4" ambient caption="A sea mine detonating (naval mine warfare)" />
          <Beat tag="Mission">
            A collision or a blast delivers its force in a flash. Impulse, a force applied over a short time, is
            what changes momentum, whether two carts meet or a charge lets go.
          </Beat>
          <Beat tag="Application" community="EOD">
            Explosive ordnance disposal reads that in reverse, working from a blast's impulse and energy to the
            standoff distances and procedures that make a device safe to approach.
          </Beat>
        </>}
        stat="Momentum is conserved in every collision. Kinetic energy is conserved only when it is perfectly elastic."
      />
    ),
    notes: 'Drag elasticity from 1 to 0; the KE bar collapses while momentum holds. This is the "two carts."',
  },

  // 4 — Act II-b: Momentum, at a distance
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="II" unit="Work · Energy · Momentum" test="Test 2" />}
        title="Momentum, at a distance"
        demo={<GravityAssist />}
        aside={<>
          <Video src="lucy-gravity-assist.mp4" ambient caption="Gravity-assist flyby trajectory (NASA, Lucy mission)" />
          <Beat tag="Frontier · gravity assist">
            Voyager gained speed from Jupiter in an encounter with <i>no contact</i>, the same conservation
            law as two carts, with gravity as the spring. Vary the flyby distance to see the boost grow.
          </Beat>
          <Beat tag="Application">
            Every outer-planet mission, from Voyager to Cassini to New Horizons, buys speed this way instead
            of carrying the fuel for it.
          </Beat>
        </>}
        stat="A light craft whips around a heavy moving planet and leaves faster, exactly like a cart off a wall."
      />
    ),
    notes: 'The slingshot is the payoff of the cart collision: same law, no contact. Default flyby boosts about 50%.',
  },

  // Unit II-c: Energy, traded
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="II" unit="Work · Energy · Momentum" test="Test 2" />}
        title="Energy, traded"
        demo={<EnergyWell />}
        aside={<>
          <Video src="coaster-energy.mp4" ambient caption="A roller coaster trading height for speed and back" />
          <Beat tag="Application">
            A roller coaster, a pole vaulter, and a diving aircraft all trade the same two currencies, kinetic
            energy and potential energy. Add them and the total holds constant, which is what makes the outcome
            predictable.
          </Beat>
          <Beat tag="Idea">
            Friction and drag skim energy off into heat, which is why nothing swings forever. Conservation of
            energy still accounts for every bit of it.
          </Beat>
        </>}
        stat="Kinetic plus potential energy stays constant. Speed is height in disguise."
      />
    ),
    notes: 'Watch the two bars trade while their sum stays flat. This is the energy half of Unit II, alongside momentum.',
  },

  // 5 — Act III-a: Spin
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="III" unit="Rotation · Gravity · Fluids" test="Test 3.1" />}
        title="Spin"
        demo={<NeutronStarSpin />}
        aside={<>
          <Video src="pulsar-spin.mp4" ambient caption="A millisecond pulsar, spinning hundreds of times a second (NASA)" />
          <Beat tag="Mission" community="Submarine">
            A submarine can operate for months with no GPS, tracking its position by inertial navigation built
            on spinning gyroscopes. A spun-up gyro resists being turned, so it holds a fixed reference
            direction. That resistance is angular momentum.
          </Beat>
          <Beat tag="Frontier · neutron star">
            Collapse a star to the size of Annapolis and it spins up to <b>700 rev/s</b>, the same law as a
            figure skater drawing her arms in. Reduce the radius and watch the spin climb.
          </Beat>
        </>}
        stat="L = Iω is conserved: halve the radius, quadruple the spin."
      />
    ),
    notes: 'Hand the physical gyroscope around here. Park the flood of questions: "Week 11, write it down."',
  },

  // 6 — Act III-b: Gravity & orbits
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="III" unit="Rotation · Gravity · Fluids" test="Test 3.1" />}
        title="Gravity & orbits"
        demo={<OrbitSim />}
        aside={<>
          <Video src="earth-orbit.mp4" ambient caption="Earth from low orbit (NASA, from the ISS)" />
          <Beat tag="Mission" community="Information Warfare">
            GPS satellites hold precise orbits fixed by this balance of speed and gravity. Information warfare
            depends on that timing and positioning, and on the electromagnetic spectrum beside it: the signals
            both sides rely on, and try to deny.
          </Beat>
          <Beat tag="Frontier · escape">
            One number decides everything: below <b>√2 times the circular speed</b> the orbit is bound, above
            it the body escapes. That threshold is why leaving Earth is the hard part.
          </Beat>
        </>}
        stat="Raise the launch speed from a tight ellipse, through a circle, to escape."
      />
    ),
    notes: 'Sweep launch speed slowly: circle → ellipse → escape. The dashed circle is the circular-orbit reference.',
  },

  // Unit III-c: Float, sink, or hover
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="III" unit="Rotation · Gravity · Fluids" test="Test 3.1" />}
        title="Float, sink, or hover"
        demo={<BuoyancyTank />}
        aside={<>
          <Video src="aav-amphibious.mp4" ambient caption="Marine amphibious assault vehicles swimming ashore (US Marine Corps)" />
          <Beat tag="Application">
            An armored amphibious vehicle floats and swims a rifle squad ashore because it pushes aside its own
            weight in water, the same reason a ship floats. A submarine turns that into a control, changing its
            average density with ballast to dive, hover, or surface.
          </Beat>
          <Beat tag="Idea">
            In uniform water the buoyant force is the same at every depth, so a denser hull sinks all the way.
            The real ocean grows denser with depth, so buoyancy climbs as the hull sinks until it matches the
            weight and the hull hovers, the way a submarine trims. Toggle it on the demo.
          </Beat>
        </>}
        stat="Buoyant force equals the weight of displaced water. Match it to your own and you hover."
      />
    ),
    notes: 'Set the density to 1.0 for neutral buoyancy, the submarine hover. Below it floats, above it sinks. Ch 13.3, L34.',
  },

  // 7 — Act IV-a: Doppler & sound
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="IV" unit="Oscillations & Waves" test="Test 3.2" />}
        title="Doppler & sound"
        demo={<DopplerWavefronts />}
        aside={<>
          <Video src="ddg-sm2-launch.mp4" ambient caption="Destroyer firing an SM-2 air-defense missile (US Navy)" />
          <Beat tag="Mission" community="Surface Warfare">
            Surface warfare runs on the radar picture. A moving contact shows up as a Doppler shift, and
            tracking it is what cues an air-defense engagement like the one in the clip.
          </Beat>
          <Beat tag="Application">
            The submarine force hears the same shift rather than seeing it: passive sonar reads a contact's
            speed from the pitch of its radiated noise, without revealing its own position.
          </Beat>
        </>}
        stat="Below Mach 1 the pitch rises ahead and drops behind. Past Mach 1 the crests form a shock cone."
      />
    ),
    notes: 'Drag speed up to and past Mach 1; the cone snaps in. Tie the shift to sonar ranging.',
  },

  // 8 — Act IV-b: Waves that carry
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="IV" unit="Oscillations & Waves" test="Test 3.2" />}
        title="Waves that carry"
        demo={<StandingWaves />}
        aside={<>
          <Video src="bbh-merger.mp4" ambient caption="Two black holes spiraling in and merging (NASA simulation)" />
          <Beat tag="Application" community="Engineering">
            A turbine blade, a propeller shaft, and a reactor's internals all have resonant modes like these.
            Naval engineers design and run the plant to keep the dangerous frequencies clear of the ones the
            ship meets at sea.
          </Beat>
          <Beat tag="Frontier · gravitational waves">
            The same standing-wave mathematics, scaled to 4-km laser interferometers, detected two black holes
            colliding <b>1.3 billion light-years</b> away. That is my research field.
          </Beat>
          <figure className="flex flex-col gap-1">
            <audio src={`${MEDIA}gw150914-chirp.wav`} controls className="w-full" />
            <figcaption className="text-xs" style={{ color: MUTED }}>
              GW150914: the actual detector "chirp" (LIGO, frequency-shifted to be audible)
            </figcaption>
          </figure>
        </>}
        stat="Fixed ends allow only whole harmonics, from a guitar string to a 4-km interferometer."
      />
    ),
    notes: 'Step through harmonics, then play the chirp last. End on the personal connection. Test speakers first.',
  },

  // Unit IV-c: Oscillations
  {
    render: () => (
      <ActFrame
        eyebrow={<Eyebrow num="IV" unit="Oscillations & Waves" test="Test 3.2" />}
        title="Oscillations"
        demo={<SpringSHM />}
        aside={<>
          <Video src="tacoma-oscillation.mp4" ambient caption="Tacoma Narrows Bridge, an oscillation that grew until it failed (1940)" />
          <Beat tag="Application">
            A ship rolls about its upright position like a mass on a spring, with a natural period set by its
            stiffness and its mass. Naval architects tune that period, and the dampers that bleed it, so a roll
            never builds.
          </Beat>
          <Beat tag="Idea">
            Pull it further and it swings wider but takes the same time. That steadiness is what makes a
            pendulum a clock.
          </Beat>
        </>}
        stat="The period depends on stiffness and mass, not on how far you pull it."
      />
    ),
    notes: 'Change the stiffness to change the period; amplitude does not matter. Sets up the wave slides that follow.',
  },

  // 5 — Closing
  {
    render: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl font-extrabold mb-6" style={{ color: TEXT }}>Four units. One toolkit.</h2>
        <p className="max-w-3xl text-xl leading-relaxed mb-10" style={{ color: TEXT }}>
          Every one of these starts with <span style={{ color: GOLD }}>F = ma</span> or a
          <span style={{ color: GOLD }}> conservation law</span>, and by Friday you will have derived your first piece of it.
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
    notes: 'Close, then one last Free Fall drop off-deck: "By Friday you will predict this entire curve with three equations."',
  },
];
