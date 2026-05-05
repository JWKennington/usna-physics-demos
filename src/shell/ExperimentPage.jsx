import { useParams, Navigate, NavLink } from 'react-router-dom';
import { findChapter, findExperiment } from '../registry';

export default function ExperimentPage() {
  const { courseId, chapterSlug, experimentSlug } = useParams();
  const chapter = findChapter(courseId, chapterSlug);
  const experiment = findExperiment(courseId, chapterSlug, experimentSlug);

  if (!experiment) return <Navigate to="/" replace />;

  const Component = experiment.component;
  const siblings = chapter?.experiments || [];

  return (
    <>
      {siblings.length > 1 && (
        <div className="flex gap-1 overflow-x-auto mb-5 pb-1">
          {siblings.map((exp) => (
            <NavLink
              key={exp.slug}
              to={`/${courseId}/${chapterSlug}/${exp.slug}`}
              className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                exp.slug === experimentSlug
                  ? 'bg-usna-gold text-usna-navy'
                  : 'bg-usna-card border border-usna-grid text-usna-text hover:text-usna-gold hover:border-usna-gold'
              }`}
            >
              {exp.title}
            </NavLink>
          ))}
        </div>
      )}
      <Component />
    </>
  );
}
