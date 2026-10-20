import React from 'react';
import {createRoot} from 'react-dom/client';
import {AuthProvider} from '../src/AuthContext';
import {AppErrorBoundary} from '../src/AppErrorBoundary';
import {SpatialApp} from './SpatialApp';
import './spatial.css';
document.body.classList.add('spatial-page');
createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><AuthProvider><SpatialApp/></AuthProvider></AppErrorBoundary></React.StrictMode>
);
