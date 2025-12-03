import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({ children, className }) =>
  React.createElement('div', { className }, children);
Card.displayName = 'Card';
Card.propTypes = { children: PropTypes.node, className: PropTypes.string };

export const CardContent = ({ children }) => React.createElement('div', null, children);
CardContent.displayName = 'CardContent';
CardContent.propTypes = { children: PropTypes.node };

export const CardHeader = ({ children }) => React.createElement('div', null, children);
CardHeader.displayName = 'CardHeader';
CardHeader.propTypes = { children: PropTypes.node };

export const CardTitle = ({ children }) => React.createElement('h3', null, children);
CardTitle.displayName = 'CardTitle';
CardTitle.propTypes = { children: PropTypes.node };

export const CardFooter = ({ children }) => React.createElement('div', null, children);
CardFooter.displayName = 'CardFooter';
CardFooter.propTypes = { children: PropTypes.node };
