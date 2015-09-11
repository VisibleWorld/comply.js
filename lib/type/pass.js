'use strict';

var _ = require('lodash');
var alwaysTrue = _.constant(true);

function PassType() {
    return {
        validators: [alwaysTrue],
    };
}

module.exports = PassType;
