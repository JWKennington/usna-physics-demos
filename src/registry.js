/**
 * registry.js — Course & experiment manifest.
 *
 * Each experiment's `component` is a React.lazy() import, so Vite code-splits
 * automatically. Only the shell + chosen demo are loaded on any given page.
 *
 * To add a new experiment:
 *   1. Create the component in src/courses/<courseId>/<chapterSlug>/
 *   2. Add an entry below with a lazy() import
 *   3. That's it — routing and nav are auto-generated from this file
 */
import { lazy } from 'react';

const courses = [
  {
    id: 'sp211',
    title: 'SP211',
    subtitle: 'General Physics I — Mechanics',
    description: 'Kinematics, Newton\'s laws, energy, momentum, rotation, oscillations, and waves.',
    chapters: [
      {
        slug: 'ch02-motion-1d',
        number: 2,
        title: 'Motion in One Dimension',
        experiments: [
          {
            slug: 'free-fall',
            title: 'Free Fall',
            description: 'Explore position, velocity, and acceleration under constant gravitational acceleration.',
            component: lazy(() => import('./courses/sp211/ch02-motion-1d/FreeFall')),
          },
        ],
      },
    ],
  },
  {
    id: 'sp212',
    title: 'SP212',
    subtitle: 'General Physics II — Electricity & Magnetism',
    description: 'Electric fields, circuits, magnetism, optics, and modern physics.',
    chapters: [
      {
        slug: 'ch33-diffraction',
        number: 33,
        title: 'Interference and Diffraction',
        experiments: [
          {
            slug: 'single-slit',
            title: 'Single-Slit Diffraction',
            description: 'Fraunhofer diffraction pattern from a single slit — intensity profile, screen strip, and minima annotations.',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/SingleSlit')),
          },
          {
            slug: 'circular-aperture',
            title: 'Circular Aperture (Airy Pattern)',
            description: 'Diffraction through a circular aperture — radial intensity profile and 2D Airy disk visualization.',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/CircularAperture')),
          },
          {
            slug: 'rayleigh',
            title: 'Rayleigh Criterion',
            description: 'Two-source resolution limit — overlapping Airy patterns with resolved/unresolved status indicator.',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/Rayleigh')),
          },
          {
            slug: 'comparison',
            title: 'Double vs. Single Slit',
            description: 'Side-by-side interference, envelope, and combined patterns with missing order annotations.',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/Comparison')),
          },
          {
            slug: 'sandbox',
            title: 'N-Slit Sandbox',
            description: 'Explore the evolution from single slit (N=1) through double slit to diffraction grating (N=20).',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/Sandbox')),
          },
          {
            slug: 'phasors',
            title: 'Phasor Diagrams',
            description: 'Dynamic vector addition diagrams showing how phasors determine intensity for single-slit and N-slit patterns.',
            component: lazy(() => import('./courses/sp212/ch33-diffraction/Phasors')),
          },
        ],
      },
    ],
  },
];

export default courses;

/**
 * Lookup helpers used by the shell routing components.
 */
export function findCourse(courseId) {
  return courses.find((c) => c.id === courseId);
}

export function findChapter(courseId, chapterSlug) {
  const course = findCourse(courseId);
  return course?.chapters.find((ch) => ch.slug === chapterSlug);
}

export function findExperiment(courseId, chapterSlug, experimentSlug) {
  const chapter = findChapter(courseId, chapterSlug);
  return chapter?.experiments.find((e) => e.slug === experimentSlug);
}
