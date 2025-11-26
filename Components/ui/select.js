import React from 'react';
import PropTypes from 'prop-types';

export function Select({ children }) {
  return React.createElement('div', null, children);
}

Select.propTypes = {
  children: PropTypes.node,
};

export function SelectContent({ children }) {
  return React.createElement('div', null, children);
}

SelectContent.propTypes = {
  children: PropTypes.node,
};

export function SelectItem({ children, ...props }) {
  return React.createElement('div', props, children);
}

SelectItem.propTypes = {
  children: PropTypes.node,
};

export function SelectTrigger({ children, ...props }) {
  return React.createElement('div', props, children);
}

SelectTrigger.propTypes = {
  children: PropTypes.node,
};

export function SelectValue({ children }) {
  return React.createElement('div', null, children);
}

SelectValue.propTypes = {
  children: PropTypes.node,
};
