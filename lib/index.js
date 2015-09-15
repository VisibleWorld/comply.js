'use strict';

var _ = require('lodash');

function and(a, b) {
    return a && b;
}

function constant(a) {
    return a;
}

function createConstant(a) {
    return function() {
        return a;
    };
}

function extend(object, property, value) {
    var clonedObject = _.clone(object);
    clonedObject[property] = value;
    return clonedObject;
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

function runValidator(object, property, extra, validator) {
    try {
        return validator.apply(object, [object[property]].concat(extra));
    }
    catch (err) {
        return false;
    }
}

function testNonSchemaValidators(rules, object, extra, property) {
    var run = function curriedRunValidator(validator) {
        return runValidator(object, property, extra, validator);
    };

    var rule = rules[property];
    var required = rule.required;
    var isPresent = property in object;
    var nonSchemaValidators = rule.validators.reduce(function rejectSchemaValidators(acc, validator) {
        if (!isSchema(validator)) {
            return acc.concat(validator);
        }

        return acc;
    }, []);

    var pass = isPresent ? nonSchemaValidators.map(run).reduce(and, true) : !required;

    return validationResult(pass, (required && !isPresent) ? '"' + property + '" is required.' : rule.message, property === '*' ? '' : property, !isPresent, function() {
        return rule.sanitizer(object[property]);
    });
}

function testProperty(rules, object, extra, property) {
    var value = object[property];
    var rule = rules[property];
    var nonSchemaValidatorsResult = testNonSchemaValidators(rules, object, extra, property);
    var schemaValidator = rule.validators.reduce(function filterSchemaValidators(acc, validator) {
        if (isSchema(validator)) {
            return acc.concat(validator);
        }

        return acc;
    }, [])[0];

    if (nonSchemaValidatorsResult.pass && schemaValidator) {
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

    return nonSchemaValidatorsResult;
}

function Schema(rules) {
    this.rules = createGetRules(rules);
}

function createGetRules(rules) {
    var rawRules = rules;
    var transformedRules;

    return function getRules() {
        return (transformedRules = transformedRules || transformRules(rawRules));
    };
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

Schema.prototype.test = function(object) {
    var _this = this;
    var rules = _this.rules();
    var extra = Array.prototype.slice.call(arguments, 1);
    var initial = {
        valid: true,
        errors: [],
        object: {},
    };

    var curriedTestProperty = function curriedTestProperty(property) {
        return testProperty(rules, object, extra, property);
    };

    return Object.keys(rules).map(curriedTestProperty).reduce(function(acc, result) {
        return {
            valid: acc.valid && result.pass,
            errors: !result.pass ? acc.errors.concat(result.message) : acc.errors,
            object: result.pass && result.field ? extend(acc.object, result.field.name, result.field.value) : acc.object,
        };
    }, initial);
};

Schema.type = {
    String: require('./type/string'),
    Number: require('./type/number'),
    Pass: require('./type/pass'),
};

module.exports = Schema;
