import { useParams, Link, Navigate } from 'react-router-dom';
import { findCourse } from '../registry';

export default function CoursePage() {
  const { courseId } = useParams();
  const course = findCourse(courseId);

  if (!course) return <Navigate to="/" replace />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-usna-gold mb-1">{course.title}</h1>
      <p className="text-usna-muted mb-8">{course.subtitle}</p>

      {course.chapters.length === 0 ? (
        <p className="text-usna-muted italic">No demos yet — check back soon.</p>
      ) : (
        <div className="space-y-6">
          {course.chapters.map((chapter) => (
            <div key={chapter.slug}>
              <h2 className="text-lg font-semibold text-usna-text mb-3">
                Chapter {chapter.number}: {chapter.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {chapter.experiments.map((exp) => (
                  <Link
                    key={exp.slug}
                    to={`/${courseId}/${chapter.slug}/${exp.slug}`}
                    className="group block bg-usna-card border border-usna-grid rounded-lg p-4 hover:border-usna-gold transition-colors"
                  >
                    <h3 className="text-sm font-medium text-usna-gold group-hover:text-usna-gold-light">
                      {exp.title}
                    </h3>
                    {exp.description && (
                      <p className="text-usna-muted text-xs mt-1">{exp.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
