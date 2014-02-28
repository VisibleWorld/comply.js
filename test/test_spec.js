var Schema = require('../lib'),
    expect = require('chai').expect,
    sinon = require('sinon');

describe("Schema", function() {
    describe(".test()", function() {
        it("should call all validators on property", function() {
            var v1 = sinon.stub().returns(true),
                v2 = sinon.stub().returns(true),
                schema = new Schema({
                    'name': {
                        validators: [v1, v2],
                        message: 'Error'
                    }
                });

            void(schema.test({
                'name': 'test'
            }));

            sinon.assert.calledOnce(v1);
            sinon.assert.calledWith(v1, 'test');
            sinon.assert.calledOnce(v2);
            sinon.assert.calledWith(v2, 'test');
        });

        it("should call Schema.test() on all array elements", function() {
            var v = sinon.stub().returns(true),
                subSchema = new Schema({
                    'id': {
                        validators: [v]
                    }
                }),
                schema = new Schema({
                    'array': {
                        validators: [subSchema]
                    }
                });

            void(schema.test({
                'array': [
                    {
                        'id': 'test1'
                    },
                    {
                        'id': 'test2'
                    }
                ]
            }));

            sinon.assert.calledTwice(v);
            sinon.assert.calledWith(v, 'test1');
            sinon.assert.calledWith(v, 'test2');
        });

        it("should call Schema.test() on object member", function() {
            var v = sinon.stub().returns(true),
                subSchema = new Schema({
                    'id': {
                        validators: [v]
                    }
                }),
                schema = new Schema({
                    'obj': {
                        validators: [subSchema]
                    }
                }),
                obj = { 'id': 1 };

            void(schema.test({
                'obj': obj
            }));

            sinon.assert.calledOnce(v);
            sinon.assert.calledWith(v, obj.id);
        });
    });
});
