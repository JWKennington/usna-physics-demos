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
      // Future chapters:
      // { slug: 'ch03-motion-2d', number: 3, title: 'Motion in Two Dimensions', experiments: [...] },
      // { slug: 'ch04-newtons-laws', number: 4, title: 'Newton\'s Laws', experiments: [...] },
      // { slug: 'ch05-applications', number: 5, title: 'Applications of Newton\'s Laws', experiments: [...] },
      // { slug: 'ch06-work-energy', number: 6, title: 'Work and Kinetic Energy', experiments: [...] },
      // { slug: 'ch07-conservation', number: 7, title: 'Conservation of Energy', experiments: [...] },
      // { slug: 'ch08-momentum', number: 8, title: 'Systems of Particles and Momentum', experiments: [...] },
      // { slug: 'ch09-rotation', number: 9, title: 'Rotation', experiments: [...] },
      // { slug: 'ch10-angular-momentum', number: 10, title: 'Angular Momentum', experiments: [...] },
      // { slug: 'ch14-oscillations', number: 14, title: 'Oscillations', experiments: [...] },
      // { slug: 'ch15-waves', number: 15, title: 'Traveling Waves', experiments: [...] },
    ],
  },
  {
    id: 'sp212',
    title: 'SP212',
    subtitle: 'General Physics II — Electricity & Magnetism',
    description: 'Electric fields, circuits, magnetism, optics, and modern physics.',
    chapters: [
      // The existing diffraction app will migrate here:
      // { slug: 'ch33-diffraction', number: 33, title: 'Interference and Diffraction', experiments: [...] },
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
