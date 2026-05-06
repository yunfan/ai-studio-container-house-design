/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ReactNode } from 'react';
import { useAppStore } from './store/useAppStore';
import Workspace from './components/Workspace';
import Editor from './components/Editor';

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 p-10 bg-red-50 text-red-900 z-50 overflow-auto font-mono">
          <h2 className="text-2xl font-bold mb-4">Runtime Error</h2>
          <pre>{(this.state.error as any).stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { view } = useAppStore();

  return (
    <ErrorBoundary>
      {view === 'workspace' && <Workspace />}
      {view === 'editor' && <Editor />}
    </ErrorBoundary>
  );
}
