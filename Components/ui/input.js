import React from 'react';
import PropTypes from 'prop-types';

export function Input(props) {
  return React.createElement('input', props);
}

Input.propTypes = {
  type: PropTypes.string,
};
