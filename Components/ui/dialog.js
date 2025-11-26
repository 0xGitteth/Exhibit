import React from 'react';
export const Dialog = ({ children }) => React.createElement('div', null, children);
export const DialogContent = ({ children, className }) => React.createElement('div', { className }, children);
export const DialogHeader = ({ children }) => React.createElement('div', null, children);
export const DialogTitle = ({ children, className }) => React.createElement('h3', { className }, children);
