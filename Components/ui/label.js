import React from 'react';
import PropTypes from 'prop-types';

export const Label = ({ children, ...props }) => React.createElement('label', props, children);

Label.propTypes = {
  children: PropTypes.node,
};
