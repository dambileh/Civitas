'use strict';

const chai = require('chai');
const ZSchema = require('z-schema');
const assert = require('assert');

const customFormats = function (zSchema) {

  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  const decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

  /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function (val) {
    return !decimalPattern.test(val.toString());
  });

  /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function (val) {
    // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val);
  });

  zSchema.registerFormat('int64', function (val) {
    return Number.isInteger(val);
  });

  zSchema.registerFormat('float', function (val) {
    // better parsing for custom "float" format
    if (Number.parseFloat(val)) {
      return true;
    } else {
      return false;
    }
  });

  const uuidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

  /** Validates uuid */
  zSchema.registerFormat('uuid', function (val) {
    return !uuidPattern.test(val.toString());
  });

  zSchema.registerFormat('date', function (val) {
    // should parse a a date
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('dateTime', function (val) {
    return !isNaN(Date.parse(val));
  });

  zSchema.registerFormat('password', function (val) {
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

describe('/user/{id}', function () {

  before(function(done){
    const postSuccessBody = {
      "msisdn": "27728120000",
      "firstName": "hossein",
      "lastName": "shayesteh",
      "email": "sdfsd@fsdfsdf.com",
      "addresses": [
        {
          "isPrimary": false,
          "detail": {
            "line1": "line1",
            "city": "city",
            "country": "country",
            "province": "country",


            "postalCode": "postalCode",
            "type": "postal"
          },
          "location": {
            "type": "Point",
            "coordinates": [-180, 90]
          }
        },
        {
          "isPrimary": true,
          "detail": {
            "line1": "line1",
            "city": "city",
            "country": "country",
            "province": "country",


            "postalCode": "postalCode",
            "type": "postal"
          },
          "location": {
            "type": "Point",
            "coordinates": [-180, 90]
          }
        }
      ]
    };

    api.post('/v1/user')
      .set('Content-Type', 'application/json')
      .send(postSuccessBody)
      .end(function (err, res) {
        if (err) return done(err);
        createdUser = res.body;
        done();
      });

  });

  describe('get single', function () {
    it('should respond with 200 - A single user', function (done) {
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
            "description": "The first name of the user"
          }
        }
      };

      /*eslint-enable*/
      api.get(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

    it('should respond with 404 - No user was found', function (done) {
      var schema = {
        "type": "object",
        "required": [
          "message"
        ],
        "properties": {
          "message": {
            "type": "string"
          },
          "stack": {
            "type": "string"
          }
        }
      };

      const randomId = '59cf6c819c9b352e239bd4fa';
      /*eslint-enable*/
      api.get(`/v1/user/${randomId}`)
        .set('Content-Type', 'application/json')
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ResourceNotFound",
            "message": "Resource not found.",
            "exceptionMessage": `No user with id [${randomId}] was found`,
            "status": 404
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

  });

  describe('put', function () {
    it('should respond with 200 success response that the...', function (done) {
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
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });
    
    it('should respond with 400 Validation Error. Exactly one primary address must be set', function (done) {
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
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",


                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [-180, 90]
                }
              },
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",


                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [-180, 90]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200005,
                "message": "Exactly one primary address must be set. [2] found instead.",
                "path": ["addresses"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Either address location or detail must be set', function (done) {
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
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true
              },
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [-180, 90]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200001,
                "message": "Either [detail] or [location] property needs to be set for all addresses.",
                "path": ["addresses"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Either address location or detail must be set', function (done) {
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
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true
              },
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [-180, 90]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200001,
                "message": "Either [detail] or [location] property needs to be set for all addresses.",
                "path": ["addresses"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Location longitude greater than 180', function (done) {
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

      const invalidLongitude = 181;

      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [invalidLongitude, 90]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          // Valid longitude values are between -180 and 180, both inclusive.
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200002,
                "message": `Incorrect coordinates format. Longitude [${invalidLongitude}] is not within allowed range`,
                "path": ["addresses", "location", "coordinates"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Location longitude less than -180', function (done) {
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

      const invalidLongitude = -181;

      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [invalidLongitude, 90]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          // Valid longitude values are between -180 and 180, both inclusive.
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200002,
                "message": `Incorrect coordinates format. Longitude [${invalidLongitude}] is not within allowed range`,
                "path": ["addresses", "location", "coordinates"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Location latitude greater than 90', function (done) {
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

      const invalidLatitude = 91;
      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [150, invalidLatitude]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          //  Valid latitude values are between -90 and 90 (both inclusive).
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200002,
                "message": `Incorrect coordinates format. Latitude [${invalidLatitude}] is not within allowed range`,
                "path": ["addresses", "location", "coordinates"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Location latitude less than -90', function (done) {
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

      const invalidLatitude = -95;
      /*eslint-enable*/
      api.put(`/v1/user/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "province": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                },
                "location": {
                  "type": "Point",
                  "coordinates": [150, invalidLatitude]
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          //  Valid latitude values are between -90 and 90 (both inclusive).
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200002,
                "message": `Incorrect coordinates format. Latitude [${invalidLatitude}] is not within allowed range`,
                "path": ["addresses", "location", "coordinates"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Address detail state or province needs to be set', function (done) {
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
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "postalCode": "postalCode",
                  "type": "postal"
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          //  Valid latitude values are between -90 and 90 (both inclusive).
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200003,
                "message": "Either [state] or [province] property needs to be set for all addresses.",
                "path": ["addresses", "detail"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. Only one of the state or province must to be set', function (done) {
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
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "state": "some state",
                  "province": "some province",
                  "postalCode": "postalCode",
                  "type": "postal"
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          //  Valid latitude values are between -90 and 90 (both inclusive).
          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 200004,
                "message": "Only one of the [state] or [province] property must be set for all addresses.",
                "path": ["addresses", "detail"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 400 Validation Error. User not found', function (done) {
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

      const randomId = '59cf6c819c9b352e239bd4fa';

      /*eslint-enable*/
      api.put(`/v1/user/${randomId}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "state": "some state",
                  "province": "some province",
                  "postalCode": "postalCode",
                  "type": "postal"
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 100002,
                "message": "No user with id [59cf6c819c9b352e239bd4fa] was found.",
                "path": ["id"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

  });

  describe('delete', function () {

    it('should respond with 400 Validation Error. User not found', function (done) {
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

      const randomId = '59cf6c819c9b352e239bd4fa';

      /*eslint-enable*/
      api.del(`/v1/user/${randomId}`)
        .set('Content-Type', 'application/json')
        .send({
            "firstName": "hossein",
            "lastName": "shayesteh",
            "email": "sdfsd@fsdfsdf.com",
            "addresses": [
              {
                "isPrimary": true,
                "detail": {
                  "line1": "line1",
                  "city": "city",
                  "country": "country",
                  "state": "some state",
                  "province": "some province",
                  "postalCode": "postalCode",
                  "type": "postal"
                }
              }
            ]
          }
        )
        .expect(400)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "ValidationError",
            "code": "MODEL_VALIDATION_FAILED",
            "message": "Some validation errors occurred.",
            "results": {
              "errors": [{
                "code": 100002,
                "message": "No user with id [59cf6c819c9b352e239bd4fa] was found.",
                "path": ["id"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });
    });

    it('should respond with 200', function (done) {
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
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

  });

});
