import React from 'react';
import PropTypes from 'prop-types';

export function Textarea(props) {
  return React.createElement('textarea', props);
}

Textarea.propTypes = {
  rows: PropTypes.number,
};
