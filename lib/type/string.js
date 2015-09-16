'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');

/**
 * Module exports
 */

module.exports = StringType;

/**
 * Helpers
 */

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

/**
 * Construct a Schema rule to validate a string. If it passes, the string
 * will be trimmed of whitespace. Examples:
 *
 *   StringType() - only validate the value is a string
 *   StringType(1) - the value is 1 or more characters long
 *   StringType(1, 10) - the value is between 1 and 10 characters long
 *   StringType(/abc/) - the value matches the regex /abc/
 *   StringType(fn1, fn2) - validate the value with functions fn1 and fn2,
 *     which return true if the value passes
 *   StringType(1, /abc/, fn) - validate that the value is at least 1
 *     character long, matches regex /abc/, and passes fn
 *
 * @param {..(number|function():boolean)}
 * @return {object}
 */

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
