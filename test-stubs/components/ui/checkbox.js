const React = require('react');
exports.Checkbox = ({ checked, onCheckedChange, ...props }) => React.createElement('input', { type: 'checkbox', checked, onChange: (e) => onCheckedChange && onCheckedChange(e.target.checked), ...props });
