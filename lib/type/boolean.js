'use strict';

/**
 * Module exports
 */

module.exports = BooleanType;

/**
 * Helpers
 */

function alwaysTrue() {
    return true;
}

function toBoolean(a) {
    return !!a;
}

/**
 * Construct a Schema rule to validate a booelan. Takes no arguments or
 * additional validators. It functions like normal JavaScript truthy and
 * falsy evaluation with one important difference: undefined and null are
 * considered invalid, since they are the absence of a value, not a false
 * value.
 *
 * @return {object}
 */

function BooleanType() {
    return {
        validators: [alwaysTrue],
        sanitizer: toBoolean,
    };
}
