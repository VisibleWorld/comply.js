'use strict';

/**
 * Module exports
 */

module.exports = DynamicType;

/**
 * Construct a Schema rule that can choose validators at runtime. The given
 * 'choose' function should return a rule generator. It is executed in the
 * context of the object being validated and passed the value and any extras.
 *
 * @param {function} choose
 * @return {object}
 */

function DynamicType(choose) {
    return {
        dynamic: choose,
    };
}
