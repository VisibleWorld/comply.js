'use strict';

var _ = require('lodash');

function and(a, b) {
    return a && b;
}

function isArray(a) {
    return _.isArray(a) || _.isArguments(a);
}

function sanitizer(a) {
    return Array.prototype.slice.call(a, 0);
}

function minLength(n) {
    return function(a) {
        return a.length >= n;
    };
}

function minAndMaxLength(n, m) {
    return function(a) {
        var len = a.length;
        return len >= n && len <= m;
    };
}

function ArrayType() {
    var args = Array.prototype.slice.call(arguments, 0);
    var validators = [];

    validators.push(isArray);

    if (typeof args[0] === 'number') {
        if (typeof args[1] === 'number') {
            validators.push(minAndMaxLength(args[0], args[1]));
            args = args.slice(2);
        } else {
            validators.push(minLength(args[0]));
            args = args.slice(1);
        }
    }

    var elementValidators = _.filter(args, _.isFunction);
    if (elementValidators.length) {
        var combinedElementValidator = function validateElement(e) {
            return e.map(function(member) {
                return elementValidators.map(function(v) { return v(member); }).reduce(and, true);
            }).reduce(and, true);
        };

        validators.push(combinedElementValidator);
    }

    return { validators: validators, sanitizer: sanitizer };
}

module.exports = ArrayType;
