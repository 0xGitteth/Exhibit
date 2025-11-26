import React from 'react';
import PropTypes from 'prop-types';

export function Checkbox({ checked, onCheckedChange, ...props }) {
  return React.createElement('input', {
    type: 'checkbox',
    checked,
    onChange: (event) => onCheckedChange?.(event.target.checked),
    ...props,
  });
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
};
