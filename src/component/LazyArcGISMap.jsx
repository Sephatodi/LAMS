/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React from 'react';
// src/components/LazyArcGISMap.tsx
import { lazy, Suspense } from 'react';

const ArcGISMap = lazy(() => import('./ArcGISMap'));

export function LazyArcGISMap() {
  return (
    <Suspense fallback={<div className="map-loading">Loading Map...</div>}>
      <ArcGISMap />
    </Suspense>
  );
}