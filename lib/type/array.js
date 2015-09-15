'use strict';

var _ = require('lodash');
var validate = require('../validate');

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

    if (args.length) {
        var rule = {
            validators: args,
        };
        var combinedElementValidator = function validateElement(e) {
            return e.map(function(member) {
                return validate.testValue(rule, member).pass;
            }).reduce(and, true);
        };

        validators.push(combinedElementValidator);
    }

    return { validators: validators, sanitizer: sanitizer };
}

module.exports = ArrayType;
