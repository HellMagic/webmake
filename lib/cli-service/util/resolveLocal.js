const path = require('path');

module.exports = function (...args) {
    return path.join(__dirname, '../../', ...args);
};
