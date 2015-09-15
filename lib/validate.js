'use strict';

var _ = require('lodash');

function and(a, b) {
    return a && b;
}

function createConstant(a) {
    return function() {
        return a;
    };
}

function isSchema(validator) {
    return validator && _.isFunction(validator.test);
}

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

function runValidator(object, value, extra, validator) {
    try {
        return validator.apply(object, [value].concat(extra));
    }
    catch (err) {
        return false;
    }
}

function testValue(rule, value, object, property, extra) {
    var run = function curriedRunValidator(validator) {
        return runValidator(object, value, extra, validator);
    };

    if (value === undefined || value === null) {
        var fieldName = property ? '"' + property + '"' : 'Field';
        return validationResult(!rule.required, fieldName + ' is required.', property, true);
    }

    var nonSchemaValidators = rule.validators.reduce(function rejectSchemaValidators(acc, validator) {
        if (!isSchema(validator)) {
            return acc.concat(validator);
        }

        return acc;
    }, []);

    var nonSchemaValidatorsPassed = nonSchemaValidators.map(run).reduce(and, true);

    if (nonSchemaValidatorsPassed) {
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

                return validationResult(objectValidationResult.valid, objectValidationResult.valid ? objectValidationResult.errors[0] : '', property, false, createConstant(objectValidationResult.object));
            }
        }
    }

    return validationResult(nonSchemaValidatorsPassed, rule.message, property === '*' ? '' : property, false, function() {
        return rule.sanitizer(value);
    });
}

function testProperty(rule, object, extra, property) {
    var isRequired = rule.required;
    var isPresent = property in object;

    if (isRequired && !isPresent) {
        return validationResult(false, '"' + property + '" is required.', property, true);
    }

    var value = object[property];

    return testValue(rule, value, object, property, extra);
}

module.exports = {
    testValue: testValue,
    testProperty: testProperty,
};
