var _ = require('lodash');

function Schema(rules, o) {
    this.rules = rules;
}

function constant(o) {
    return o;
}

function extend(o, f, v) {
    var nO = _.clone(o);
    nO[f] = v;
    return nO;
}

function isDate(s) {
    return moment(s).isValid();
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

function runValidator(o, k, v) {
    try {
        return v.bind(o)(o[k]);
    }
    catch (err) {
        return false;
    }
}

function testNonSchemaValidators(rules, o, k) {
    var run = _.curry(runValidator)(o)(k),
        pass = _(rules[k].validators).reject(isSchema).map(run).every();
    return validationResult(pass, rules[k].message, k === '*' ? '' : k, function() {
        return (rules[k].sanitizer || constant)(o[k]);
    });
}

function testProperty(rules, o, k) {
    var f = o[k],
        r = rules[k],
        nsv = testNonSchemaValidators(rules, o, k);

    if (_.isArray(f)) {
        var sch = _.find(r.validators, isSchema);

        if (nsv.pass) {
            var xs = _.map(f, sch.test.bind(sch)),
                pass = _.every(xs, 'valid');
            if (pass) {
                return {
                    pass: true,
                    field: {
                        name: k,
                        value: _.pluck(xs, 'object')
                    }
                };
            } else {
                return {
                    pass: false,
                    message: _.pluck(xs, 'errors')[0]
                };
            }
        }
        return nsv;
    } else {
        return nsv;
    }
}

Schema.prototype.test = function(o) {
    var rules = this.rules;
    return _(rules).keys().map(_.curry(testProperty)(rules)(o)).foldl(function(o, r) {
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

function flip(func) {
    return function() {
        return func.apply(this, Array.prototype.slice.call(arguments, 0).reverse());
    };
}

module.exports = Schema;
