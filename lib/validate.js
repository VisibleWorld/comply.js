'use strict';

/**
 * Module dependencies
 */

var _ = require('lodash');
var Rule = require('./rule');

/**
 * Module exports
 */

module.exports = {
    testValue: testValue,
    testProperty: testProperty,
};

/**
 * Helpers
 */

function and(a, b) {
    return a && b;
}

function createConstant(a) {
    return function() {
        return a;
    };
}

function isSchema(validator) {
    return validator instanceof require('./schema');
}

/**
 * Return an internal representation of intermediate validation results
 *
 * @param {boolean} pass Did the field pass validation?
 * @param {?string} message An error message if validation failed
 * @param {string} field The name of the field
 * @param {boolean} omit If true, do not include this field in the sanitized
 *  output; required for optional fields
 * @param {function=} valueAccessor A function that returns the sanitized
 *  value of the field
 * @return {object}
 */

function validationResult(pass, message, field, omit, valueAccessor) {
    if (pass) {
        if (field && !omit) {
            return {
                pass: true,
                field: {
                    name: field,
                    value: valueAccessor(),
                },
            };
        } else {
            return {
                pass: true,
            };
        }
    } else {
        return {
            pass: false,
            message: message,
        };
    }
}

/**
 * Run the given 'validator' function in the context of 'object' with
 * parameters 'value' and 'extra'.
 *
 * @param {?object} object The context to bind the validator to
 * @param {*} value The value to validate
 * @param {*} extra Extra parameters to pass to the validator
 * @param {function} validator The validator to execute
 * @returns {boolean}
 */

function runValidator(object, value, extra, validator) {
    try {
        return validator.apply(object, [value].concat(extra));
    }
    catch (err) {
        return false;
    }
}

/**
 * Validate the given 'value' in the context of 'object'. This runs each
 * function and the first Schema in the 'rule' validators. If successful,
 * it sanitizes 'value'.
 *
 * @param {object} rule Describes the validators, sanitizers, error message,
 *  and presence requirement of the value
 * @param {*} value The value to validate
 * @param {?object} object The context to bind validators to
 * @param {?string} property A description of the value, if available
 * @param {*} extra Extra parameters to pass to validators
 * @returns {object}
 */

function testValue(rule, value, object, property, extra) {
    var run = function curriedRunValidator(validator) {
        var valid = runValidator(object, value, extra, validator);
        //flatten inner structure if valid is a result of validating array elements
        if (_.isObject(valid)) {
            return { pass: valid.pass, error: property + ': ' + valid.error };
        } else {
            return { pass: valid, error: validator.errorMessage ? validator.errorMessage : null };
        }
    };

    if (value === undefined || value === null) {
        var fieldName = property ? '"' + property + '"' : 'Field';
        return validationResult(!rule.required, fieldName + ' is required.', property, true);
    }

    if (rule.dynamic && _.isFunction(rule.dynamic)) {
        var dynamicRule = Rule.compile(false, property, rule.dynamic.apply(object, [value].concat(extra)));
        return testValue(dynamicRule, value, object, property, extra);
    }

    var nonSchemaValidators = rule.validators.reduce(function rejectSchemaValidators(acc, validator) {
        if (!isSchema(validator) && _.isFunction(validator)) {
            return acc.concat(validator);
        }

        return acc;
    }, []);

    var nonSchemaValidatorsPassed = nonSchemaValidators
    .map(run)
    .reduce(function reducer(acc, el) {
        acc.pass = acc.pass && el.pass;
        acc.error = el.error ? acc.error + '\n' + el.error : acc.error;
        return acc;
    }, { pass: true, error: ''});

    if (nonSchemaValidatorsPassed.pass) {
        var schemaValidator = rule.validators.reduce(function filterSchemaValidators(acc, validator) {
            if (isSchema(validator)) {
                return acc.concat(validator);
            }

            return acc;
        }, [])[0];

        if (schemaValidator) {
            if (_.isArray(value)) {
                var arrayValidationResults = value.map(schemaValidator.test.bind(schemaValidator));
                var pass = arrayValidationResults.map(function pluckValid(x) { return x.valid; }).reduce(and, true);
                var firstError = arrayValidationResults.map(function pluckErrors(x) { return x.errors; })[0];

                return validationResult(pass, firstError, property, false, function() {
                    return arrayValidationResults.map(function pluckObject(x) { return x.object; });
                });
            } else if (_.isObject(value)) {
                var objectValidationResult = schemaValidator.test(value);
                return validationResult(objectValidationResult.valid, !objectValidationResult.valid ? objectValidationResult.errors : '', property, false, createConstant(objectValidationResult.object));
            }
        }
    }

    return validationResult(nonSchemaValidatorsPassed.pass, nonSchemaValidatorsPassed.error ? nonSchemaValidatorsPassed.error : rule.message, property === '*' ? '' : property, false, function() {
        return rule.sanitizer(value);
    });
}

/**
 * Validate the given key 'property' of 'object'. This runs each function and
 * the first Schema in the 'rule' validators. If successful, it sanitizes
 * the value of 'property'.
 *
 * @param {object} rule Describes the validators, sanitizers, error message,
 *  and presence requirement of the value
 * @param {object} object The object that contains 'property'
 * @param {*} extra Extra parameters to pass to validators
 * @param {string} property A description of the value, if available
 * @returns {object}
 */
function testProperty(rule, object, extra, property) {
    var isRequired = rule.required;
    var isPresent = property in object;

    if (isRequired && !isPresent) {
        return validationResult(false, '"' + property + '" is required.', property, true);
    }

    var value = object[property];

    return testValue(rule, value, object, property, extra);
}
