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

        it("should return valid if all validators pass", function() {
            var v1 = sinon.stub().returns(true),
                v2 = sinon.stub().returns(true),
                v3 = sinon.stub().returns(true),
                schema = new Schema({
                    'foo': {
                        validators: [v1, v2]
                    },
                    'bar': {
                        validators: [v3]
                    }
                });

            var result = schema.test({
                'foo': true,
                'bar': true
            });

            expect(result.valid).to.be.true;
        });

        it("should return invalid if any validators fail", function() {
            var v1 = sinon.stub().returns(true),
                v2 = sinon.stub().returns(false),
                v3 = sinon.stub().returns(true),
                schema = new Schema({
                    'foo': {
                        validators: [v1, v2]
                    },
                    'bar': {
                        validators: [v3]
                    }
                });

            var result = schema.test({
                'foo': true,
                'bar': true
            });

            expect(result.valid).to.be.false;
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
                obj = {
                    'id': 1
                };

            void(schema.test({
                'obj': obj
            }));

            sinon.assert.calledOnce(v);
            sinon.assert.calledWith(v, obj.id);
        });

        it("should call validator in simple, single-validator schema format", function() {
            var v = sinon.stub().returns(true),
                schema = new Schema({
                    'foo': v
                }),
                obj = {
                    'foo': 1
                };

            void(schema.test(obj));

            sinon.assert.calledOnce(v);
            sinon.assert.calledWith(v, obj.foo);
        });

        it("should call all validators in simple, multiple-validator schema format", function() {
            var v1 = sinon.stub().returns(true),
                v2 = sinon.stub().returns(true),
                schema = new Schema({
                    'foo': [v1, v2]
                }),
                obj = {
                    'foo': 1
                };

            void(schema.test(obj));

            sinon.assert.calledOnce(v1);
            sinon.assert.calledWith(v1, obj.foo);
            sinon.assert.calledOnce(v2);
            sinon.assert.calledWith(v2, obj.foo);
        });

        it("should not fail when optional field is missing", function() {
            var v = sinon.stub().returns(false),
                schema = new Schema({
                    'foo?': v
                }),
                obj = {
                    'bar': 2
                };

            var result = schema.test(obj);

            expect(result.valid).to.be.true;
        });

        it("should coerce to boolean in simple boolean schema format", function() {
            var schema = new Schema({
                    'foo': true
                }),
                obj = {
                    'foo': '5'
                };

            var result = schema.test(obj);

            expect(result.valid).to.be.true;
            expect(result.object.foo).to.equal(!!obj.foo);
        });

        it("should coerce to number in simple number schema format", function() {
            var schema = new Schema({
                    'foo': 1
                }),
                obj = {
                    'foo': '6'
                };

            var result = schema.test(obj);

            expect(result.valid).to.be.true;
            expect(result.object.foo).to.equal(~~obj.foo);
        });

        it("should coerce to string in simple string schema format", function() {
            var schema = new Schema({
                    'foo': ''
                }),
                obj = {
                    'foo': 5
                };

            var result = schema.test(obj);

            expect(result.valid).to.be.true;
            expect(result.object.foo).to.equal(obj.foo + '');
        });

        it("should fail when optional field fails validation", function() {
            var v = sinon.stub().returns(false),
                schema = new Schema({
                    'foo?': v
                }),
                obj = {
                    'foo': 1
                };

            var result = schema.test(obj);

            sinon.assert.calledOnce(v);
            expect(result.valid).to.be.false;
        });

        it("should fail when required field is missing", function() {
            var v = sinon.stub().returns(true),
                schema = new Schema({
                    'foo': v
                }),
                obj = {
                    'bar': 2
                };

            var result = schema.test(obj);

            expect(result.valid).to.be.false;
        });

        it("should pass when testing schema on optional array", function() {
            var v = sinon.stub().returns(true),
                arrSch = new Schema({
                    'foo': v
                }),
                objSch = new Schema({
                    'bar?': {
                        validators: [arrSch]
                    }
                }),
                obj = {};

            var result = objSch.test(obj);

            expect(result.valid).to.be.true;
        });
    });
});
