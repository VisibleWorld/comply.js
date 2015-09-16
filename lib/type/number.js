'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');

/**
 * Module exports
 */

module.exports = NumberType;

/**
 * Helpers
 */

function sanitizer(i) {
    return parseFloat(i);
}

function gte(min) {
    return function(i) {
        return ~~i >= min;
    };
}

function lte(max) {
    return function(i) {
        return ~~i <= max;
    };
}

function between(min, max) {
    return function(i) {
        return ~~i >= min && ~~i <= max;
    };
}

function isNumber(i) {
    return !isNaN(i);
}

/**
 * Construct a Schema rule to validate a number. Examples:
 *
 *   NumberType() - only validate the value is a number
 *   NumberType(1) - the value is greater than or equal to 1
 *   NumberType(1, 10) - the value is >= 1 and <= 10
 *   NumberType(fn1, fn2) - validate the value with functions fn1 and fn2,
 *     which return true if the value passes
 *   NumberType(1, fn) - validate that value is greater than or equal to
 *    1 and that the value passes fn
 *
 * @param {...(number|function():boolean)}
 * @return {object}
 */

function NumberType() {
    var args = Array.prototype.slice.call(arguments, 0);
    var validators = [isNumber];
    var min = args[0];
    var max = args[1];

    if (typeof min === 'number' && (max === '*' || (typeof max !== 'number' && !max))) {
        validators.push(gte(min));
        args = args.slice(2);
    } else if (min === '*' && typeof max === 'number') {
        validators.push(lte(max));
        args = args.slice(2);
    } else if (typeof min === 'number' && typeof max === 'number') {
        validators.push(between(min, max));
        args = args.slice(2);
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
