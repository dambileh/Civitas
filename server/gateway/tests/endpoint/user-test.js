'use strict';

const chai = require('chai');
const ZSchema = require('z-schema');
const assert = require('assert');

const customFormats = module.exports = function(zSchema) {

  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  const decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function(val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function(val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function(val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function(val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  const uuidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;;

  /** Validates uuid */
  zSchema.registerFormat('uuid', function(val) {
    return !uuidPattern.test(val.toString());
  });

  zSchema.registerFormat('date', function(val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function(val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function(val) {
    // should parse as a string
    return typeof val === 'string';
  });
};

customFormats(ZSchema);

var validator = new ZSchema({});
var supertest = require('supertest');
var api = supertest('http://localhost:4000'); // supertest init;

chai.should();

let createdUser = null;

describe('/user', function() {

  describe('post', function() {
    it('should respond with 201 success response that the...', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "firstName",
          "lastName",
          "msisdn"
        ],
        "properties": {
          "firstName": {
            "type": "string",
            "maxLength": 128,
            "description": "The firstname of the user"
          },
          "lastName": {
            "type": "string",
            "maxLength": 128,
            "description": "The lastname of the user"
          },
          "msisdn": {
            "type": "string",
            "pattern": "^27((60[3-9]|64[0-5])\\d{6}|(7[1-4689]|6[1-3]|8[1-4])\\d{7})$",
            "maxLength": 128,
            "description": "The user's contact number"
          },
          "email": {
            "type": "string",
            "format": "email",
            "minLength": 6,
            "maxLength": 128,
            "description": "The email of the user"
          },
          "address": {
            "type": "object",
            "required": [
              "line1",
              "city",
              "country",
              "postalCode"
            ],
            "properties": {
              "line1": {
                "type": "string",
                "maxLength": 128,
                "description": "The first line of address"
              },
              "line2": {
                "type": "string",
                "maxLength": 128,
                "description": "The second line of address"
              },
              "city": {
                "type": "string",
                "maxLength": 128,
                "description": "The city"
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "description": "The state"
              },
              "province": {
                "type": "string",
                "maxLength": 128,
                "description": "The province"
              },
              "country": {
                "type": "string",
                "maxLength": 128,
                "description": "The country"
              },
              "postalCode": {
                "type": "string",
                "maxLength": 128,
                "description": "The postal code"
              }
            }
          },
          "arCompanies": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the AR companies that service the user"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the images on user's phone that are linked to his or her profile"
          },
          "avatarId": {
            "type": "string",
            "format": "uuid",
            "description": "The id of user's avatar image"
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "inactive"
            ],
            "description": "The firstname of the user"
          }
        }
      };

      /*eslint-enable*/
      api.post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        "msisdn": "27728120127",
        "firstName" : "hossein",
        "lastName" : "shayesteh",
        "email" : "sdfsd@fsdfsdf.com",
        "addresses" : [
          {
            "isPrimary" : false,
            "detail" : {
              "line1" : "line1",
              "city" : "city",
              "country" : "country",
              "province" : "country",


              "postalCode" : "postalCode",
              "type" : "postal"
            },
            "location": {
              "type" : "Point",
              "coordinates" : [-180, 90]
            }
          },
          {
            "isPrimary" : true,
            "detail" : {
              "line1" : "line1",
              "city" : "city",
              "country" : "country",
              "province" : "country",


              "postalCode" : "postalCode",
              "type" : "postal"
            },
            "location": {
              "type" : "Point",
              "coordinates" : [-180, 90]
            }
          }
        ]
      })
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        validator.validate(res.body, schema).should.be.true;

        createdUser = res.body;

        done();
      });
    });

    it('should respond with 400 Validation Error. Usually...', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "code",
          "message"
        ],
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "code",
                "message",
                "path"
              ],
              "properties": {
                "code": {
                  "type": "string"
                },
                "message": {
                  "type": "string"
                },
                "path": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "description": {
                  "type": "string"
                }
              }
            }
          }
        }
      };

      /*eslint-enable*/
      api.post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        "msisdn": "27728120157",
        "firstName" : "hossein",
        "lastName" : "shayesteh",
        "email" : "some invalid email"
      })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);

        validator.validate(res.body, schema).should.be.true;
        done();
      });
    });

  });

  describe('get', function() {
    it('should respond with 200 An array of users', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "array",
        "items": {
          "type": "object",
          "required": [
            "firstName",
            "lastName",
            "msisdn"
          ],
          "properties": {
            "firstName": {
              "type": "string",
              "maxLength": 128,
              "description": "The firstname of the user"
            },
            "lastName": {
              "type": "string",
              "maxLength": 128,
              "description": "The lastname of the user"
            },
            "msisdn": {
              "type": "string",
              "pattern": "^27((60[3-9]|64[0-5])\\d{6}|(7[1-4689]|6[1-3]|8[1-4])\\d{7})$",
              "maxLength": 128,
              "description": "The user's contact number"
            },
            "email": {
              "type": "string",
              "format": "email",
              "minLength": 6,
              "maxLength": 128,
              "description": "The email of the user"
            },
            "address": {
              "type": "object",
              "required": [
                "line1",
                "city",
                "country",
                "postalCode"
              ],
              "properties": {
                "line1": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The first line of address"
                },
                "line2": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The second line of address"
                },
                "city": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The city"
                },
                "state": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The state"
                },
                "province": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The province"
                },
                "country": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The country"
                },
                "postalCode": {
                  "type": "string",
                  "maxLength": 128,
                  "description": "The postal code"
                }
              }
            },
            "arCompanies": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "The ids of the AR companies that service the user"
            },
            "images": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "uuid"
              },
              "description": "The ids of the images on user's phone that are linked to his or her profile"
            },
            "avatarId": {
              "type": "string",
              "format": "uuid",
              "description": "The id of user's avatar image"
            },
            "status": {
              "type": "string",
              "enum": [
                "active",
                "inactive"
              ],
              "description": "The first name of the user"
            }
          }
        }
      };

      /*eslint-enable*/
      api.get('/v1/user')
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        assert.ok(validator.validate(res.body, schema), 'The expected schema was not returned');
        validator.validate(res.body, schema);

        done();
      });
    });

    it('should respond with 405 Method not supported Error...', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "code",
          "message"
        ],
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "stack": {
            "type": "string"
          }
        }
      };

      // patch is not supported
      api.patch('/v1/user')
      .set('Content-Type', 'application/json')
      .expect(405)
      .end(function(err, res) {
        if (err) return done(err);
        assert.ok(validator.validate(res.body, schema), 'The expected schema was not returned');
        done();
      });
    });

  });

  describe('get single', function() {
    it('should respond with 200 An array of users', function(done) {
      var schema = {
        "type": "object",
        "required": [
          "firstName",
          "lastName",
          "msisdn"
        ],
        "properties": {
          "firstName": {
            "type": "string",
            "maxLength": 128,
            "description": "The firstname of the user"
          },
          "lastName": {
            "type": "string",
            "maxLength": 128,
            "description": "The lastname of the user"
          },
          "msisdn": {
            "type": "string",
            "pattern": "^27((60[3-9]|64[0-5])\\d{6}|(7[1-4689]|6[1-3]|8[1-4])\\d{7})$",
            "maxLength": 128,
            "description": "The user's contact number"
          },
          "email": {
            "type": "string",
            "format": "email",
            "minLength": 6,
            "maxLength": 128,
            "description": "The email of the user"
          },
          "address": {
            "type": "object",
            "required": [
              "line1",
              "city",
              "country",
              "postalCode"
            ],
            "properties": {
              "line1": {
                "type": "string",
                "maxLength": 128,
                "description": "The first line of address"
              },
              "line2": {
                "type": "string",
                "maxLength": 128,
                "description": "The second line of address"
              },
              "city": {
                "type": "string",
                "maxLength": 128,
                "description": "The city"
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "description": "The state"
              },
              "province": {
                "type": "string",
                "maxLength": 128,
                "description": "The province"
              },
              "country": {
                "type": "string",
                "maxLength": 128,
                "description": "The country"
              },
              "postalCode": {
                "type": "string",
                "maxLength": 128,
                "description": "The postal code"
              }
            }
          },
          "arCompanies": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the AR companies that service the user"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the images on user's phone that are linked to his or her profile"
          },
          "avatarId": {
            "type": "string",
            "format": "uuid",
            "description": "The id of user's avatar image"
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "inactive"
            ],
            "description": "The firstname of the user"
          }
        }
      };
      /*eslint-enable*/
      api.get(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

  });

  describe('put', function() {
    it('should respond with 200 success response that the...', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "firstName": {
            "type": "string",
            "maxLength": 128,
            "description": "The firstname of the user"
          },
          "lastName": {
            "type": "string",
            "maxLength": 128,
            "description": "The lastname of the user"
          },
          "msisdn": {
            "type": "string",
            "pattern": "^27((60[3-9]|64[0-5])\\d{6}|(7[1-4689]|6[1-3]|8[1-4])\\d{7})$",
            "maxLength": 128,
            "description": "The user's contact number"
          },
          "email": {
            "type": "string",
            "format": "email",
            "minLength": 6,
            "maxLength": 128,
            "description": "The email of the user"
          },
          "address": {
            "type": "object",
            "required": [
              "line1",
              "city",
              "country",
              "postalCode"
            ],
            "properties": {
              "line1": {
                "type": "string",
                "maxLength": 128,
                "description": "The first line of address"
              },
              "line2": {
                "type": "string",
                "maxLength": 128,
                "description": "The second line of address"
              },
              "city": {
                "type": "string",
                "maxLength": 128,
                "description": "The city"
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "description": "The state"
              },
              "province": {
                "type": "string",
                "maxLength": 128,
                "description": "The province"
              },
              "country": {
                "type": "string",
                "maxLength": 128,
                "description": "The country"
              },
              "postalCode": {
                "type": "string",
                "maxLength": 128,
                "description": "The postal code"
              }
            }
          },
          "arCompanies": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the AR companies that service the user"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the images on user's phone that are linked to his or her profile"
          },
          "avatarId": {
            "type": "string",
            "format": "uuid",
            "description": "The id of user's avatar image"
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "inactive"
            ],
            "description": "The firstname of the user"
          }
        }
      };

      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'some new name'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

    it('should respond with 400 Validation Error. Usually...', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "code",
          "message"
        ],
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "code",
                "message",
                "path"
              ],
              "properties": {
                "code": {
                  "type": "string"
                },
                "message": {
                  "type": "string"
                },
                "path": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "description": {
                  "type": "string"
                }
              }
            }
          }
        }
      };

      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
          email: 'some invalid email'
        })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

  });

  describe('delete', function() {
    it('should respond with 200', function(done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "firstName": {
            "type": "string",
            "maxLength": 128,
            "description": "The firstname of the user"
          },
          "lastName": {
            "type": "string",
            "maxLength": 128,
            "description": "The lastname of the user"
          },
          "msisdn": {
            "type": "string",
            "pattern": "^27((60[3-9]|64[0-5])\\d{6}|(7[1-4689]|6[1-3]|8[1-4])\\d{7})$",
            "maxLength": 128,
            "description": "The user's contact number"
          },
          "email": {
            "type": "string",
            "format": "email",
            "minLength": 6,
            "maxLength": 128,
            "description": "The email of the user"
          },
          "address": {
            "type": "object",
            "required": [
              "line1",
              "city",
              "country",
              "postalCode"
            ],
            "properties": {
              "line1": {
                "type": "string",
                "maxLength": 128,
                "description": "The first line of address"
              },
              "line2": {
                "type": "string",
                "maxLength": 128,
                "description": "The second line of address"
              },
              "city": {
                "type": "string",
                "maxLength": 128,
                "description": "The city"
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "description": "The state"
              },
              "province": {
                "type": "string",
                "maxLength": 128,
                "description": "The province"
              },
              "country": {
                "type": "string",
                "maxLength": 128,
                "description": "The country"
              },
              "postalCode": {
                "type": "string",
                "maxLength": 128,
                "description": "The postal code"
              }
            }
          },
          "arCompanies": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the AR companies that service the user"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "description": "The ids of the images on user's phone that are linked to his or her profile"
          },
          "avatarId": {
            "type": "string",
            "format": "uuid",
            "description": "The id of user's avatar image"
          },
          "status": {
            "type": "string",
            "enum": [
              "active",
              "inactive"
            ],
            "description": "The firstname of the user"
          }
        }
      };
      /*eslint-enable*/
      api.del(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

  });

});
