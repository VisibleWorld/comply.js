'use strict';

var _ = require('lodash');

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

function NumberType() {
    var args = Array.prototype.slice.call(arguments, 0);
    var validators = [isNumber];
    var min = args[0];
    var max = args[1];

    if (typeof min === 'number' && max === '*') {
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

module.exports = NumberType;
