import React from 'react';
import PropTypes from 'prop-types';

export function Button({ children, ...props }) {
  return React.createElement('button', props, children);
}

Button.propTypes = {
  children: PropTypes.node,
};
