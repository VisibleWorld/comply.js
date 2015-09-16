'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var validate = require('./validate');

/**
 * Module exports
 */

module.exports = Schema;

/**
 * Return a clone of 'object' with an additional key 'property' set to 'value'
 *
 * @param {object} object The object to extend
 * @param {string} property Key
 * @param {*} value Value
 * @return {object}
 */

function extend(object, property, value) {
    var clonedObject = _.clone(object);
    clonedObject[property] = value;
    return clonedObject;
}

/**
 * Helpers
 */

function constant(a) {
    return a;
}

function alwaysTrue() {
    return true;
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
 * Transform a Schema's ruleset into a standard format that lists the
 * validators to apply to each field; the sanitizer, if any, to apply to the
 * value before returning; an error message; and whether the value is
 * required.
 *
 * @param {object} rules The rules to transform
 * @return {object}
 */

function transformRules(rules) {
    return _.pairs(rules).map(function(pair) {
        var _splitProperty = pair[0].split('?');
        var property = _splitProperty[0];
        var rule = pair[1];
        var isRequired = _splitProperty.length === 1;
        var parsedRules = {};

        if (_.isFunction(rule)) {
            parsedRules[property] = {
                validators: [rule],
                message: 'Field "' + property + '" is invalid.',
                sanitizer: constant,
                required: isRequired,
            };
        } else if (_.isArray(rule)) {
            var validators = rule.reduce(function filterFunctions(acc, v) {
                if (_.isFunction(v)) {
                    return acc.concat(v);
                }

                return acc;
            }, []);

            parsedRules[property] = {
                validators: validators,
                message: 'Field "' + property + '" is invalid.',
                sanitizer: constant,
                required: isRequired,
            };
        } else if (_.isPlainObject(rule)) {
            parsedRules[property] = {
                validators: rule.validators || [],
                message: rule.message || 'Field "' + property + '" is invalid.',
                sanitizer: rule.sanitizer || constant,
                required: isRequired,
            };
        } else {
            var san;

            switch (typeof rule) {
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

            parsedRules[property] = {
                validators: [alwaysTrue],
                message: '',
                sanitizer: san,
                require: isRequired,
            };
        }

        return parsedRules;
    }).reduce(_.assign, {});
}

/**
 * Initialize a new schema with the given set of rules:
 *
 *    var personSchema = new Schema({
 *      firstName: Schema.type.String(1, 100),
 *      'middleName?': Schema.type.String(1, 100),
 *      lastName: Schema.type.String(1, 100),
 *      age: Schema.type.Number(1, 125)
 *    });
 *
 * @constructor
 * @param {object} rules
 */

function Schema(rules) {
    this._rules = rules;
}

/**
 * Return the transformed ruleset for this Schema.
 *
 * @return {object}
 */

Schema.prototype.rules = function getRules() {
    return (this._transformedRules = this._transformedRules || transformRules(this._rules));
};

/**
 * Validate the given object against this Schema. Returns an object that
 * describes whether the validation succeeded, a list of errors, if any, and
 * the sanitized object.
 *
 * @param {object} object The object to validate
 * @return {object}
 */

Schema.prototype.test = function(object) {
    var _this = this;
    var rules = _this.rules();
    var extra = Array.prototype.slice.call(arguments, 1);
    var initial = {
        valid: true,
        errors: [],
        object: {},
    };

    var proxiedTestProperty = function proxiedTestProperty(property) {
        return validate.testProperty(rules[property], object, extra, property);
    };

    return Object.keys(rules).map(proxiedTestProperty).reduce(function(acc, result) {
        return {
            valid: acc.valid && result.pass,
            errors: !result.pass ? acc.errors.concat(result.message) : acc.errors,
            object: result.pass && result.field ? extend(acc.object, result.field.name, result.field.value) : acc.object,
        };
    }, initial);
};

/**
 * Expose standard helpers under the Schema namespace.
 */

Schema.type = {
    String: require('./type/string'),
    Number: require('./type/number'),
    Pass: require('./type/pass'),
    Array: require('./type/array'),
};
