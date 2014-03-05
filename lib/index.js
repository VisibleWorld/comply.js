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
    return s && !!s.test;
}

function validationResult(pass, message, field, valueAccessor) {
    if (pass) {
        if (field) {
            return {
                pass: true,
                field: {
                    name: field,
                    value: valueAccessor()
                }
            };
        } else {
            return {
                pass: true
            };
        }
    } else {
        return {
            pass: false,
            message: message
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
    var run = _.curry(runValidator)(o)(k)(extra),
        pass = _(rules[k].validators).reject(isSchema).map(run).every();
    return validationResult(pass, rules[k].message, k === '*' ? '' : k, function() {
        return rules[k].sanitizer(o[k]);
    });
}

function testProperty(rules, o, extra, k) {
    var f = o[k],
        r = rules[k],
        nsv = testNonSchemaValidators(rules, o, extra, k),
        sch = _.find(r.validators, isSchema);

    if (nsv.pass && sch && sch.test) {
        if (_.isArray(f)) {
            var xs = _.map(f, sch.test.bind(sch)),
                pass = _.every(xs, 'valid');
            return validationResult(pass, _.pluck(xs, 'errors')[0], k, function() {
                return _.pluck(xs, 'object');
            });
        } else if (_.isObject(f)) {
            var ov = sch.test(f);
            return validationResult(ov.valid, ov.valid ? ov.errors[0] : '', k, _.constant(ov.object));
        }
    } else {
        return nsv;
    }
}

function Schema(rules) {
    this.rules = createGetRules(rules);
}

function createGetRules(rules) {
    var raw_rules = rules,
        transformed_rules;
    return function getRules() {
        return (transformed_rules = transformed_rules || transformRules(raw_rules));
    };
}

function transformRules(rules) {
    return _(rules).pairs().map(function(pair) {
        var key = pair[0],
            val = pair[1],
            o = {};
        if (_.isFunction(val)) {
            o[key] = {
                validators: [val],
                message: 'Field "' + key + '" is invalid.',
                sanitizer: constant
            };
        } else if (_.isArray(val)) {
            o[key] = {
                validators: val.filter(_.isFunction),
                message: 'Field "' + key + '" is invalid.',
                sanitizer: constant
            };
        } else if (_.isPlainObject(val)) {
            o[key] = {
                validators: val.validators || [],
                message: val.message || 'Field "' + key + '" is invalid.',
                sanitizer: val.sanitizer || constant
            };
        }
        return o;
    }).foldl(_.assign, {});
}

Schema.prototype.test = function(o) {
    var self = this,
        rules = self.rules(),
        extra = Array.prototype.slice.call(arguments, 1);

    return _(rules).keys().map(_.curry(testProperty)(rules)(o)(extra)).foldl(function(o, r) {
        return {
            valid: o.valid && r.pass,
            errors: !r.pass ? o.errors.concat(r.message) : o.errors,
            object: r.pass ? extend(o.object, r.field.name, r.field.value) : o.object
        };
    }, {
        valid: true,
        errors: [],
        object: {}
    });
};

module.exports = Schema;
