import { useParams, Navigate } from 'react-router-dom';
import { findExperiment } from '../registry';

export default function ExperimentPage() {
  const { courseId, chapterSlug, experimentSlug } = useParams();
  const experiment = findExperiment(courseId, chapterSlug, experimentSlug);

  if (!experiment) return <Navigate to="/" replace />;

  const Component = experiment.component;
  return <Component />;
}
