'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
const assert = require('assert');

var customFormats = module.exports = function (zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

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
let createdUserTwo = null;
let createdCompany = null;

describe('/company/{id}', function () {
  before(function (done) {

    // Create a User
    const userOneBody = {
      "msisdn": "27728120222",
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

    const userTwoBody = {
      "msisdn": "27728120031",
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
      .send(userOneBody)
      .end(function (err, res) {
        if (err) return done(err);
        createdUser = res.body;

        const companySuccessBody = {
          "name": "adtsfsf",
          "branch": "durbanville",
          "type": "ar",
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
          ],
          "phoneNumbers": [
            {
              "number": "021456966",
              "type": "business",
              "isPrimary": true
            },
            {
              "number": "021456967",
              "type": "business",
              "isPrimary": false
            }
          ],
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                },
                {
                  "number": "07281200891",
                  "type": "personal",
                  "isPrimary": false
                }
              ]
            },
            {
              "name": "hossein shayesteh",
              "email": "hsh_856@yahoo.com",
              "isPrimary": false,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                },
                {
                  "number": "07281200891",
                  "type": "personal",
                  "isPrimary": false
                }
              ]
            }
          ]
        };

        // Create a new company
        /*eslint-enable*/
        api.post('/v1/company')
          .set('Content-Type', 'application/json')
          .set({
            'context': 'user',
            'context-id': createdUser._id
          })
          .send(companySuccessBody)
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err);
            createdCompany = res.body;


            api.post('/v1/user')
              .set('Content-Type', 'application/json')
              .send(userTwoBody)
              .end(function (err, res) {
                if (err) return done(err);
                createdUserTwo = res.body;
                done();
              });

          });

      });

  });

  describe('put', function () {
    it('should respond with 200 Updated company', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the company"
          },
          "branch": {
            "type": "string",
            "description": "The name of the branch"
          },
          "type": {
            "type": "string",
            "enum": [
              "ar"
            ],
            "description": "The type of the company"
          },
          "addresses": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "detail": {
                  "type": "object",
                  "required": [
                    "line1",
                    "city",
                    "country",
                    "postalCode",
                    "type"
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
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "physical",
                        "postal"
                      ],
                      "description": "The type of the address"
                    }
                  }
                },
                "location": {
                  "type": "object",
                  "required": [
                    "type",
                    "coordinates"
                  ],
                  "properties": {
                    "coordinates": {
                      "type": "array",
                      "items": {
                        "type": "integer",
                        "description": "The ids of the AR companies that service the user"
                      }
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "Point"
                      ],
                      "description": "The longitude and latitude of the location"
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary address"
                },
                "createdAt": {
                  "type": "string",
                  "description": "The created date"
                },
                "updatedAt": {
                  "type": "string",
                  "description": "The updated date"
                }
              }
            }
          },
          "phoneNumbers": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "type",
                "number"
              ],
              "properties": {
                "number": {
                  "type": "string",
                  "description": "The user's phone number"
                },
                "type": {
                  "type": "string",
                  "enum": [
                    "personal",
                    "business",
                    "home"
                  ],
                  "description": "The type of the landline number"
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary phone number"
                }
              }
            }
          },
          "representatives": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "The name of the person"
                },
                "email": {
                  "type": "string",
                  "format": "email",
                  "minLength": 6,
                  "maxLength": 128
                },
                "phoneNumbers": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "type",
                      "number"
                    ],
                    "properties": {
                      "number": {
                        "type": "string",
                        "description": "The user's phone number"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "personal",
                          "business",
                          "home"
                        ],
                        "description": "The type of the landline number"
                      },
                      "isPrimary": {
                        "type": "boolean",
                        "description": "Indicates if this is the primary phone number"
                      }
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary person"
                }
              }
            }
          }
        }
      };

      /*eslint-enable*/
      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "branch": "bellville"
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;

          assert.equal(res.body.branch, "bellville", 'the expected updated body was not returned');
          done();
        });
    });

    it('should respond with 400 Validation Error. Invalid Owner Type', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
        })
        .send({
          "branch": "bellville"
        })
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
                "code": 400000,
                "message": "The owner kind [community] is not valid for this entity."
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Owner not found', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdCompany._id
        })
        .send({
          "branch": "bellville"
        })
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
                "message": `An owner with id [${createdCompany._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 401 Validation Error. Owner has no access', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "name",
          "message"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        }
      };

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
        })
        .send({
          "branch": "bellville"
        })
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "AuthorizationError",
            "message": `The specified owner with id [${createdUserTwo._id}] does not have access to the entity.`,
            "status": 401
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Company not found', function (done) {
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

      api.put(`/v1/company/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "addresses": []
        })
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
                "code": 600001,
                "message": `No company with id [${createdUser._id}] was found.`,
                "path": ["id"]
              }]
            },
            "status": 400
          }

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Exactly one primary address must be set for company. No Address', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "addresses": []
        })
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
                "message": "Exactly one primary address must be set. [0] found instead.",
                "path": ["addresses"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Exactly one primary address must be set for company. Two Addresses', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
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
          ],
        })
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

    it('should respond with 400 Validation Error. Exactly one primary phone number must be set for company. No number', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "phoneNumbers": []
        })
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
                "code": 500000,
                "message": "Exactly one primary phone number must be set. [0] found instead",
                "path": ["phoneNumbers"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Exactly one primary phone number must be set for company. Two number', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "phoneNumbers": [
            {
              "number": "021456966",
              "type": "business",
              "isPrimary": true
            },
            {
              "number": "021456966",
              "type": "business",
              "isPrimary": true
            }
          ]
        })
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
                "code": 500000,
                "message": "Exactly one primary phone number must be set. [2] found instead",
                "path": ["phoneNumbers"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Exactly one primary phone number must be set for representative. Two numbers', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                },
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                }
              ]
            }
          ]
        })
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
                "code": 500000,
                "message": "Exactly one primary phone number must be set for person",
                "path": ["representatives", "phoneNumbers"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Exactly one primary phone number must be set for representative. No number', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": []
            }
          ]
        })
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
                "code": 500000,
                "message": "Exactly one primary phone number must be set for person",
                "path": ["representatives", "phoneNumbers"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Phone number must be unique for company', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "phoneNumbers": [
            {
              "number": "021456966",
              "type": "business",
              "isPrimary": true
            },
            {
              "number": "021456966",
              "type": "business",
              "isPrimary": false
            }
          ]
        })
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
                "code": 500001,
                "message": "Found duplicate phone numbers [021456966]",
                "path": ["phoneNumbers"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Phone number must be unique for representative', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                },
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": false
                }
              ]
            }
          ]
        })
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
                "code": 500001,
                "message": "Persons phone numbers must be unique",
                "path": ["representatives", "phoneNumbers", "number"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Exactly one primary person must be set for company. No person', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": []
        })
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
                "code": 700000,
                "message": "Exactly one primary representative must be set. [0] found instead",
                "path": ["representatives"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Exactly one primary person must be set for company. Two persons', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                }
              ]
            },
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                }
              ]
            }
          ]
        })
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
                "code": 700000,
                "message": "Exactly one primary representative must be set. [2] found instead",
                "path": ["representatives"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 400 Validation Error. Email address must be unique for representative', function (done) {
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

      api.put(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "representatives": [
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": true,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                }
              ]
            },
            {
              "name": "hossein shayesteh",
              "email": "hsh_85@yahoo.com",
              "isPrimary": false,
              "phoneNumbers": [
                {
                  "number": "07281200899",
                  "type": "personal",
                  "isPrimary": true
                }
              ]
            }
          ]
        })
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
                "code": 700001,
                "message": "Found duplicate persons email address [hsh_85@yahoo.com]",
                "path": ["representatives", "email"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

  });

  describe('get', function() {
    it('should respond with 400 Validation Error. Invalid Owner Type', function (done) {
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

      api.get(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
        })
        .send({
          "branch": "bellville"
        })
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
                "code": 400000,
                "message": "The owner kind [community] is not valid for this entity."
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Owner not found', function (done) {
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

      api.get(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdCompany._id
        })
        .send({
          "branch": "bellville"
        })
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
                "message": `An owner with id [${createdCompany._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 401 Authorization Error. Owner has no access', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "name",
          "message"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        }
      };

      api.get(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
        })
        .send({
          "branch": "bellville"
        })
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "AuthorizationError",
            "message": `The specified owner with id [${createdUserTwo._id}] does not have access to the entity.`,
            "status": 401
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 200 return single company', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the company"
          },
          "branch": {
            "type": "string",
            "description": "The name of the branch"
          },
          "type": {
            "type": "string",
            "enum": [
              "ar"
            ],
            "description": "The type of the company"
          },
          "addresses": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "detail": {
                  "type": "object",
                  "required": [
                    "line1",
                    "city",
                    "country",
                    "postalCode",
                    "type"
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
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "physical",
                        "postal"
                      ],
                      "description": "The type of the address"
                    }
                  }
                },
                "location": {
                  "type": "object",
                  "required": [
                    "type",
                    "coordinates"
                  ],
                  "properties": {
                    "coordinates": {
                      "type": "array",
                      "items": {
                        "type": "integer",
                        "description": "The ids of the AR companies that service the user"
                      }
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "Point"
                      ],
                      "description": "The longitude and latitude of the location"
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary address"
                },
                "createdAt": {
                  "type": "string",
                  "description": "The created date"
                },
                "updatedAt": {
                  "type": "string",
                  "description": "The updated date"
                }
              }
            }
          },
          "phoneNumbers": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "type",
                "number"
              ],
              "properties": {
                "number": {
                  "type": "string",
                  "description": "The user's phone number"
                },
                "type": {
                  "type": "string",
                  "enum": [
                    "personal",
                    "business",
                    "home"
                  ],
                  "description": "The type of the landline number"
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary phone number"
                }
              }
            }
          },
          "representatives": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "The name of the person"
                },
                "email": {
                  "type": "string",
                  "format": "email",
                  "minLength": 6,
                  "maxLength": 128
                },
                "phoneNumbers": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "type",
                      "number"
                    ],
                    "properties": {
                      "number": {
                        "type": "string",
                        "description": "The user's phone number"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "personal",
                          "business",
                          "home"
                        ],
                        "description": "The type of the landline number"
                      },
                      "isPrimary": {
                        "type": "boolean",
                        "description": "Indicates if this is the primary phone number"
                      }
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary person"
                }
              }
            }
          }
        }
      };

      api.get(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

    it('should respond with 404 Not Found', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "name",
          "message",
          "exceptionMessage"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "exceptionMessage": {
            "type": "string"
          }
        }
      };

      api.get(`/v1/company/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

            const expectedResponse = {
              "name": "ResourceNotFound",
              "message": "Resource not found.",
              "exceptionMessage": `No company with id [${createdUser._id}] was found`,
              "status": 404
            };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          
          done();
        });
    });

  });

  describe('delete', function () {
    it('should respond with 400 Validation Error. Invalid Owner Type', function (done) {
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

      api.del(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
        })
        .send({
          "branch": "bellville"
        })
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
                "code": 400000,
                "message": "The owner kind [community] is not valid for this entity."
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Owner not found', function (done) {
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

      api.del(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdCompany._id
        })
        .send({
          "branch": "bellville"
        })
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
                "message": `An owner with id [${createdCompany._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });
    it('should respond with 400 Validation Error. Company not found', function (done) {
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

      api.del(`/v1/company/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "branch": "bellville"
        })
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
                "code": 600001,
                "message": `No company with id [${createdUser._id}] was found.`,
                "path": ["id"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 401 Validation Error. Owner has no access', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "required": [
          "name",
          "message"
        ],
        "properties": {
          "name": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        }
      };

      api.del(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
        })
        .send({
          "branch": "bellville"
        })
        .expect(401)
        .end(function (err, res) {
          if (err) return done(err);
          validator.validate(res.body, schema).should.be.true;

          const expectedResponse = {
            "name": "AuthorizationError",
            "message": `The specified owner with id [${createdUserTwo._id}] does not have access to the entity.`,
            "status": 401
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');

          done();
        });

    });

    it('should respond with 200 Deleted company', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the company"
          },
          "branch": {
            "type": "string",
            "description": "The name of the branch"
          },
          "type": {
            "type": "string",
            "enum": [
              "ar"
            ],
            "description": "The type of the company"
          },
          "addresses": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "detail": {
                  "type": "object",
                  "required": [
                    "line1",
                    "city",
                    "country",
                    "postalCode",
                    "type"
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
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "physical",
                        "postal"
                      ],
                      "description": "The type of the address"
                    }
                  }
                },
                "location": {
                  "type": "object",
                  "required": [
                    "type",
                    "coordinates"
                  ],
                  "properties": {
                    "coordinates": {
                      "type": "array",
                      "items": {
                        "type": "integer",
                        "description": "The ids of the AR companies that service the user"
                      }
                    },
                    "type": {
                      "type": "string",
                      "enum": [
                        "Point"
                      ],
                      "description": "The longitude and latitude of the location"
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary address"
                },
                "createdAt": {
                  "type": "string",
                  "description": "The created date"
                },
                "updatedAt": {
                  "type": "string",
                  "description": "The updated date"
                }
              }
            }
          },
          "phoneNumbers": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "type",
                "number"
              ],
              "properties": {
                "number": {
                  "type": "string",
                  "description": "The user's phone number"
                },
                "type": {
                  "type": "string",
                  "enum": [
                    "personal",
                    "business",
                    "home"
                  ],
                  "description": "The type of the landline number"
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary phone number"
                }
              }
            }
          },
          "representatives": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "The name of the person"
                },
                "email": {
                  "type": "string",
                  "format": "email",
                  "minLength": 6,
                  "maxLength": 128
                },
                "phoneNumbers": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "type",
                      "number"
                    ],
                    "properties": {
                      "number": {
                        "type": "string",
                        "description": "The user's phone number"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "personal",
                          "business",
                          "home"
                        ],
                        "description": "The type of the landline number"
                      },
                      "isPrimary": {
                        "type": "boolean",
                        "description": "Indicates if this is the primary phone number"
                      }
                    }
                  }
                },
                "isPrimary": {
                  "type": "boolean",
                  "description": "Indicates if this is the primary person"
                }
              }
            }
          }
        }
      };

      api.del(`/v1/company/${createdCompany._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

    it('should respond with 405 Method not supported Error...', function (done) {
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

      /*eslint-enable*/
      api.patch('/v1/company/{id PARAM GOES HERE}')
        .set('Content-Type', 'application/json')
        .set({
          'context': 'DATA GOES HERE',
          'context-id': 'DATA GOES HERE'
        })
        .expect(405)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
          done();
        });
    });

  });
});
