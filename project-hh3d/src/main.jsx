import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

// Guard against external DOM mutations (e.g. browser translators/extensions)
// that can make React attempt to remove/insert nodes no longer attached.
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function patchedRemoveChild(child) {
  if (child && child.parentNode !== this) {
    return child;
  }
  return originalRemoveChild.call(this, child);
};

const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function patchedInsertBefore(newNode, referenceNode) {
  if (referenceNode && referenceNode.parentNode !== this) {
    return this.appendChild(newNode);
  }
  return originalInsertBefore.call(this, newNode, referenceNode);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);