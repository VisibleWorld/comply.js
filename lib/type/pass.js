'use strict';

function alwaysTrue() {
    return true;
}

function PassType() {
    return {
        validators: [alwaysTrue],
    };
}

module.exports = PassType;
