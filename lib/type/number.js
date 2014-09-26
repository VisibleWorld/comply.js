'use strict';

var _ = require('lodash');

function sanitizer(i) {
    return parseFloat(i);
}

function gte(min) {
    return function (i) {
        return ~~i >= min;
    };
}

function lte(max) {
    return function (i) {
        return ~~i <= max;
    };
}

function between(min, max) {
    return function (i) {
        return ~~i >= min && ~~i <= max;
    };
}

function NumberType() {
    var args = Array.prototype.slice.call(arguments, 0),
        validators = [],
        config = { sanitizer: sanitizer },
        min = args[0], max = args[1];

    if (typeof min === 'number' && max === '*') {
        validators.push(gte(min));
        args = args.slice(2);
    }
    else if(min === '*' && typeof max === 'number') {
        validators.push(lte(max));
        args = args.slice(2);
    }
    else if(typeof min === 'number' && typeof max === 'number') {
        validators.push(between(min, max));
        args = args.slice(2);
    }
    
    config.validators = validators.concat(_.filter(args, _.isFunction));
    return config;
}

module.exports = NumberType;
