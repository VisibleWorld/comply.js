'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var validate = require('../validate');

/**
 * Module exports
 */

module.exports = ArrayType;

/**
 * Helpers
 */

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

/**
 * Construct a Schema rule to validate an array. The array length can be
 * tested. Any other validators are then applied to the array's elements.
 * Examples:
 *
 *   ArrayType() - only validate the value is an array
 *   ArrayType(1) - the array has at least 1 element
 *   ArrayType(1, 10) - the array has between 1 and 10 elements
 *   ArrayType(fn1, fn2) - every element of the array passes validators fn1
 *     and fn2, which return true if the element passes
 *   ArrayType(schema) - every element of the array validates against the
 *     schema
 *   ArrayType(1, schema) - the array has at least one element, and it must
 *     validate against the given schema
 *
 * @param {..(number|function():boolean|Schema)}
 * @return {object}
 */

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
            var result = e.map(function(member, idx) {
                var valid = validate.testValue(rule, member);
                var mapped = { pass: valid.pass };
                if (valid.message && valid.message.length) {
                    mapped.message = 'row index ' + idx + ': ' + valid.message.join('\n');
                }

                return mapped;
            }).reduce(function reducer(acc, el) {
                acc.pass = acc.pass && el.pass;
                if (el.message) {
                    acc.error = acc.error.concat(el.message);
                }

                return acc;
            }, {pass: true, error: ''});

            return result;
        };

        validators.push(combinedElementValidator);
    }

    return { validators: validators, sanitizer: sanitizer };
}
