const React = require('react');

exports.Avatar = ({ children, className }) => React.createElement('div', { className }, children);
exports.AvatarImage = ({ src }) => React.createElement('img', { src });
exports.AvatarFallback = ({ children }) => React.createElement('div', null, children);
