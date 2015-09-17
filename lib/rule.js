'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');

/**
 * Module exports
 */

module.exports = Rule;

/**
 * Helpers
 */

function alwaysTrue() {
    return true;
}

function constant(a) {
    return a;
}

function isSchema(validator) {
    return validator instanceof require('./schema');
}

function toBoolean(s) {
    return !!s;
}

function toString(s) {
    return s + '';
}

function toNumber(s) {
    return ~~s;
}

/**
 * Interpret the given 'generator' to create a new Rule. If the generator is
 * a scalar primitive, create a simple rule that coerces the value to that
 * primitive. Otherwise, construct a Rule that validates with the given
 * function, Schema, or combination thereof.
 *
 * @param {boolean} isRequired 'true' if the value must be present
 * @param {?string} property The name of the field
 * @param {(function:boolean|Schema|Array<*>|object|boolean|number|string)} generator
 * @return {Rule}
 */

function compile(isRequired, property, generator) {
    if (_.isFunction(generator) || isSchema(generator)) {
        return new Rule(isRequired, {
            validators: [generator],
            property: property,
        });
    } else if (_.isArray(generator)) {
        return new Rule(isRequired, {
            validators: generator,
            property: property,
        });
    } else if (_.isPlainObject(generator)) {
        return new Rule(isRequired, {
            validators: generator.validators,
            message: generator.message,
            sanitizer: generator.sanitizer,
            property: property,
            dynamic: generator.dynamic,
        });
    } else {
        var san;

        switch (typeof generator) {
            case 'boolean':
                san = toBoolean;
                break;
            case 'number':
                san = toNumber;
                break;
            case 'string':
                san = toString;
                break;
            default:
                throw new Error('Invalid validator expression');
        }

        return new Rule(isRequired, {
            sanitizer: san,
            property: property,
        });
    }
}

/**
 * Initialize a new rule with the given options.
 *
 * Options:
 *
 *    - `validators` array of validators; defaults to always true
 *    - `message` error message; defaults to 'Field "foo" is invalid.'
 *    - `sanitizer` sanitizer function; defaults to constant
 *    - `property` name of the property to be validated, if known
 *
 * @constructor
 * @param {boolean} isRequired true is the field must not be undefined or null
 * @param {?object} options
 */

function Rule(isRequired, options) {
    this.required = !!isRequired;

    options = options || {};

    if (options.validators && _.isArray(options.validators)) {
        this.validators = options.validators;
    } else {
        this.validators = [alwaysTrue];
    }

    if (options.property && typeof options.property === 'string') {
        this.property = options.property;
    }

    if (options.message && typeof options.message === 'string') {
        this.message = options.message;
    } else if (options.property) {
        this.message = 'Field "' + this.property + '" is invalid.';
    } else {
        this.message = 'Field is invalid.';
    }

    if (options.sanitizer && _.isFunction(options.sanitizer)) {
        this.sanitizer = options.sanitizer;
    } else {
        this.sanitizer = constant;
    }

    if (options.dynamic && _.isFunction(options.dynamic)) {
        this.dynamic = options.dynamic;
    }
}

Rule.compile = compile;
