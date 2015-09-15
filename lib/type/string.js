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

    var otherValidators = args.reduce(function filterFunctions(acc, validator) {
        if (_.isFunction(validator)) {
            return acc.concat(validator);
        }

        return acc;
    }, []);

    Array.prototype.push.apply(validators, otherValidators);

    return {
        sanitizer: sanitizer,
        validators: validators,
    };
}

module.exports = StringType;
