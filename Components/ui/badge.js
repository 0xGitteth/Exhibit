import React from 'react';
import PropTypes from 'prop-types';

export function Badge({ children, className }) {
  return React.createElement('span', { className }, children);
}

Badge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
