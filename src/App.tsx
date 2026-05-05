/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from './store/useAppStore';
import Workspace from './components/Workspace';
import Editor from './components/Editor';

export default function App() {
  const { view } = useAppStore();

  return (
    <>
      {view === 'workspace' && <Workspace />}
      {view === 'editor' && <Editor />}
    </>
  );
}
