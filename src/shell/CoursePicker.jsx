import { Link } from 'react-router-dom';
import courses from '../registry';

export default function CoursePicker() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <img
          src="./usna-logo-small.png"
          alt="USNA Crest"
          className="h-20 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-usna-gold mb-2">USNA Physics Demos</h1>
        <p className="text-usna-muted text-lg">
          Interactive demonstrations for undergraduate physics courses.
        </p>
        <p className="text-usna-muted text-sm mt-1">
          United States Naval Academy &middot; Physics Department
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {courses.map((course) => {
          const expCount = course.chapters.reduce((n, ch) => n + ch.experiments.length, 0);
          return (
            <Link
              key={course.id}
              to={`/${course.id}`}
              className="group block bg-usna-card border border-usna-grid rounded-lg p-6 hover:border-usna-gold transition-colors"
            >
              <h2 className="text-xl font-semibold text-usna-gold group-hover:text-usna-gold-light mb-1">
                {course.title}
              </h2>
              <p className="text-usna-text text-sm mb-3">{course.subtitle}</p>
              <p className="text-usna-muted text-sm">{course.description}</p>
              <p className="text-usna-muted text-xs mt-4">
                {course.chapters.length} chapter{course.chapters.length !== 1 ? 's' : ''} &middot;{' '}
                {expCount} demo{expCount !== 1 ? 's' : ''}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
