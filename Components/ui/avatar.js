import React from 'react';
import PropTypes from 'prop-types';

export function Avatar({ children, className }) {
  return React.createElement('div', { className }, children);
}

Avatar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function AvatarImage({ src, alt = '' }) {
  return React.createElement('img', { src, alt });
}

AvatarImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

export function AvatarFallback({ children }) {
  return React.createElement('div', null, children);
}

AvatarFallback.propTypes = {
  children: PropTypes.node,
};
