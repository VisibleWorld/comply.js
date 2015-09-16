'use strict';

/**
 * Module exports
 */

module.exports = PassType;

/**
 * Helpers
 */

function alwaysTrue() {
    return true;
}

/**
 * Construct a Schema rule to always validate a value. The value is returned
 * unchanged. This is useful for optional fields with no type restriction,
 * for example.
 *
 * @return {object}
 */

function PassType() {
    return {
        validators: [alwaysTrue],
    };
}
