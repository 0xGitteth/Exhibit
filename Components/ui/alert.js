import React from 'react';
import PropTypes from 'prop-types';

export const Alert = ({ children }) => React.createElement('div', null, children);
Alert.propTypes = {
  children: PropTypes.node,
};

export const AlertDescription = ({ children }) => React.createElement('div', null, children);
AlertDescription.propTypes = {
  children: PropTypes.node,
};
