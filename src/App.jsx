import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from './shell/Layout';
import CoursePicker from './shell/CoursePicker';
import CoursePage from './shell/CoursePage';
import ExperimentPage from './shell/ExperimentPage';

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<CoursePicker />} />
          <Route path="/:courseId" element={<CoursePage />} />
          <Route path="/:courseId/:chapterSlug/:experimentSlug" element={<ExperimentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-usna-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
