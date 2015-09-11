'use strict';

var _ = require('lodash');

function sanitizer(s) {
    return (s + '').trim();
}

function maxLength(n) {
    return function(s) {
        return s.length <= n;
    };
}

function minAndMaxLength(n, m) {
    return function(s) {
        var len = s.length;
        return len >= n && len <= m;
    };
}

function StringType() {
    var args = Array.prototype.slice.call(arguments, 0);
    var validators = [];
    var config = { sanitizer: sanitizer };

    if (typeof args[0] === 'number') {
        if (typeof args[1] === 'number') {
            validators.push(minAndMaxLength(args[0], args[1]));
            args = args.slice(2);
        } else {
            validators.push(maxLength(args[0]));
            args = args.slice(1);
        }
    } else if (_.isRegExp(args[0])) {
        validators.push(args[0].test.bind(args[0]));
        args = args.slice(1);
    }

    config.validators = validators.concat(_.filter(args, _.isFunction));

    return config;
}

module.exports = StringType;
