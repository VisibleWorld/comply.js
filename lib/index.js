'use strict';

var _ = require('lodash');

function constant(o) {
    return o;
}

function extend(o, f, v) {
    var nO = _.clone(o);
    nO[f] = v;
    return nO;
}

function isSchema(s) {
    return s && _.isFunction(s.test);
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

function runValidator(o, k, extra, v) {
    try {
        return v.apply(o, [o[k]].concat(extra));
    }
    catch (err) {
        return false;
    }
}

function testNonSchemaValidators(rules, o, extra, k) {
    var run = _.curry(runValidator)(o)(k)(extra);
    var required = rules[k].required;
    var presence = k in o;
    var pass = presence ? _(rules[k].validators).reject(isSchema).map(run).every() : !required;

    return validationResult(pass, (required && !presence) ? '"' + k + '" is required.' : rules[k].message, k === '*' ? '' : k, !presence, function() {
        return rules[k].sanitizer(o[k]);
    });
}

function testProperty(rules, o, extra, k) {
    var f = o[k];
    var r = rules[k];
    var nsv = testNonSchemaValidators(rules, o, extra, k);
    var sch = _.find(r.validators, isSchema);

    if (nsv.pass && sch && sch.test) {
        if (_.isArray(f)) {
            var xs = _.map(f, sch.test.bind(sch));
            var pass = _.every(xs, 'valid');

            return validationResult(pass, _.pluck(xs, 'errors')[0], k, false, function() {
                return _.pluck(xs, 'object');
            });
        } else if (_.isObject(f)) {
            var ov = sch.test(f);

            return validationResult(ov.valid, ov.valid ? ov.errors[0] : '', k, false, _.constant(ov.object));
        }
    }

    return nsv;
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
    return _(rules).pairs().map(function(pair) {
        var r = pair[0].split('?');
        var key = r[0];
        var val = pair[1];
        var isRequired = r.length !== 2;
        var o = {};

        if (_.isFunction(val)) {
            o[key] = {
                validators: [val],
                message: 'Field "' + key + '" is invalid.',
                sanitizer: constant,
                required: isRequired,
            };
        } else if (_.isArray(val)) {
            o[key] = {
                validators: val.filter(_.isFunction),
                message: 'Field "' + key + '" is invalid.',
                sanitizer: constant,
                required: isRequired,
            };
        } else if (_.isPlainObject(val)) {
            o[key] = {
                validators: val.validators || [],
                message: val.message || 'Field "' + key + '" is invalid.',
                sanitizer: val.sanitizer || constant,
                required: isRequired,
            };
        } else {
            var san;

            switch (typeof val) {
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

            o[key] = {
                validators: [alwaysTrue],
                message: '',
                sanitizer: san,
                require: isRequired,
            };
        }

        return o;
    }).foldl(_.assign, {});
}

Schema.prototype.test = function(o) {
    var _this = this;
    var rules = _this.rules();
    var extra = Array.prototype.slice.call(arguments, 1);
    var initial = {
        valid: true,
        errors: [],
        object: {},
    };

    return _(rules).keys().map(_.curry(testProperty)(rules)(o)(extra)).foldl(function(o, r) {
        return {
            valid: o.valid && r.pass,
            errors: !r.pass ? o.errors.concat(r.message) : o.errors,
            object: r.pass && r.field ? extend(o.object, r.field.name, r.field.value) : o.object,
        };
    }, initial);
};

Schema.type = {
    String: require('./type/string'),
    Number: require('./type/number'),
    Pass: require('./type/pass'),
};

module.exports = Schema;
