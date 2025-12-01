import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10 w-full max-w-5xl">{children}</div>
    </div>,
    document.body
  );
};

Dialog.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  children: PropTypes.node,
};

export const DialogContent = ({ children, className }) => (
  <div
    className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[calc(100vh-4rem)] overflow-y-auto ${className || ''}`}
  >
    {children}
  </div>
);

DialogContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const DialogHeader = ({ children }) => <div className="px-6 pt-6">{children}</div>;

DialogHeader.propTypes = {
  children: PropTypes.node,
};

export const DialogTitle = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-slate-900 ${className || ''}`}>{children}</h3>
);

DialogTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
