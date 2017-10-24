'use strict';
const chai = require('chai');
const ZSchema = require('z-schema');
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

  const uuidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

  /** Validates uuid */
  zSchema.registerFormat('uuid', function (val) {
    return !uuidPattern.test(val.toString());
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
let createdCommunity = null;
let createdChat = null;
let createdChatTwo = null;

describe('/chat/{id}', function () {

  before(function (done) {
    const userOneBody = {
      "msisdn": "27731112222",
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
      "msisdn": "27721139999",
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

        api.post('/v1/user')
          .set('Content-Type', 'application/json')
          .send(userTwoBody)
          .end(function (err, res) {
            if (err) return done(err);
            createdUserTwo = res.body;

            const communityBody = {
              "name": "durbanville community 2",
              "address": {
                "isPrimary": true,
                "detail": {
                  "line1": "line12323",
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
              ],
              "entities": [
                {
                  "name": "police station",
                  "branch": "Durbanville",
                  "addresses": [
                    {
                      "line1": "line1",
                      "city": "city",
                      "country": "country",
                      "province": "country",
                      "postalCode": "postalCode",
                      "type": "postal"
                    },
                    {
                      "line1": "line1",
                      "city": "city",
                      "country": "country",
                      "province": "country",
                      "postalCode": "postalCode",
                      "type": "postal"
                    }
                  ],
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
                }
              ]
            };

            api.post('/v1/community')
              .set('Content-Type', 'application/json')
              .set({
                'context': 'user',
                'context-id': createdUser._id
              })
              .send(communityBody)
              .end(function (err, res) {
                if (err) return done(err);

                createdCommunity = res.body;

                const chatBody = {
                  "name": "chat two",
                  "description": "chat two description",
                  "avatarId": "some id",
                  "participants": [
                    createdUser._id,
                    createdUserTwo._id
                  ],
                  "type": "friend"
                };

                const chatTwoBody = {
                  "name": "chat three",
                  "description": "chat three description",
                  "avatarId": "some id",
                  "participants": [
                    createdUser._id,
                    createdUserTwo._id
                  ],
                  "type": "friend"
                };

                /*eslint-enable*/
                api.post('/v1/chat')
                  .set('Content-Type', 'application/json')
                  .set({
                    'context': 'user',
                    'context-id': createdUser._id
                  })
                  .send(chatBody)
                  .end(function (err, res) {
                    if (err) return done(err);
                    createdChat = res.body;

                    api.post('/v1/chat')
                      .set('Content-Type', 'application/json')
                      .set({
                        'context': 'user',
                        'context-id': createdUser._id
                      })
                      .send(chatTwoBody)
                      .end(function (err, res) {
                        if (err) return done(err);
                        createdChatTwo = res.body;
                        done();

                      });
                  });

              });
          });

      });

  });

  describe('put', function () {
    it('should respond with 200 Updated chat', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the chat"
          },
          "description": {
            "type": "string",
            "description": "The description of the chat"
          },
          "avatarId": {
            "type": "string",
            "description": "The id of the chat avatar stored on user's device"
          },
          "participants": {
            "type": "array",
            "items": {
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
                  "description": "The first name of the user"
                }
              }
            },
            "description": "The ids of the users that participate in the chat"
          },
          "type": {
            "type": "string",
            "enum": [
              "friend",
              "group"
            ],
            "description": "The type of the chat"
          },
          "messageLane": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "content": {
                  "type": "string",
                  "description": "The content of the message"
                },
                "contentType": {
                  "type": "string",
                  "enum": [
                    "text",
                    "image",
                    "audio",
                    "video"
                  ],
                  "description": "The type of the content"
                },
                "sender": {
                  "type": "object",
                  "properties": {
                    "item": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The id of the sender"
                    },
                    "kind": {
                      "type": "string",
                      "enum": [
                        "user",
                        "community"
                      ],
                      "description": "The type of the sender"
                    }
                  }
                },
                "status": {
                  "type": "string",
                  "enum": [
                    "delivered",
                    "sent",
                    "read",
                    "acknowledged",
                    "failed"
                  ],
                  "description": "The status of the message"
                }
              }
            }
          }
        }
      };

      const newName = 'chat new name';
      const newDescription = 'chat new description';
      const newAvatarId = 'some new Id';

      /*eslint-enable*/
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          name: newName,
          avatarId: newAvatarId,
          description: newDescription

        })
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;

          assert.equal(res.body.name, newName, 'the expected updated [name] was not returned');
          assert.equal(res.body.avatarId, newAvatarId, 'the expected updated [avatarId] was not returned');
          assert.equal(res.body.description, newDescription, 'the expected updated [description] was not returned');

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

      /*eslint-enable*/
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'company',
          'context-id': createdUser._id
        })
        .send({})
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
                "message": "The owner kind [company] is not valid for this entity."
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

      /*eslint-enable*/
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
        })
        .send({})
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
                "message": `An owner with id [${createdUser._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 401 Error. Owner has no access', function (done) {
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
      /*eslint-enable*/
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
        })
        .send({})
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
    it('should respond with 400 Validation Error. Chat not found', function (done) {
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
      api.put(`/v1/chat/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({})
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
                "code": 1000002,
                "message": `No chat with id [${createdUser._id}] was found.`,
                "path": ["id"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 400 Validation Error. Chat already exists', function (done) {
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
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          name: "chat three"
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
                "code": 1000000,
                "message": `A chat with the same name [chat three] and owner [${createdUser._id}] already exists.`,
                "path": ["name"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 400 Validation Error. Minimum participants not reached', function (done) {
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
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "participants": []
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
                "code": 1000002,
                "message": "A chat must have at least [2] participants, found [0] instead",
                "path": ["participants"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 400 Validation Error. Participants not unique', function (done) {
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
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "participants": [
            createdUser._id,
            createdUser._id
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
                "code": 1000004,
                "message": "Duplicate participants found",
                "path": ["participants"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 400 Validation Error. Friend chat participants max reached', function (done) {
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
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "participants": [
            createdUser._id,
            createdUserTwo._id,
            createdCommunity._id
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
                "code": 1000003,
                "message": "A [friend] chat must have [2] participants, found [3] instead",
                "path": ["participants"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 400 Validation Error. Participants does not exist', function (done) {
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
      api.put(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .send({
          "participants": [
            createdUser._id,
            createdCommunity._id
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
                "code": 1000001,
                "message": `Chat participant [${createdCommunity._id}] could not be found or is not active`,
                "path": ["participants"]
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });

  });

  describe('get', function () {
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

      /*eslint-enable*/
      api.get(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'company',
          'context-id': createdUser._id
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
                "message": "The owner kind [company] is not valid for this entity."
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

      /*eslint-enable*/
      api.get(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
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
                "message": `An owner with id [${createdUser._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 401 Error. Owner has no access', function (done) {
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
      /*eslint-enable*/
      api.get(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
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

    it('should respond with 200 A single chat', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the chat"
          },
          "description": {
            "type": "string",
            "description": "The description of the chat"
          },
          "avatarId": {
            "type": "string",
            "description": "The id of the chat avatar stored on user's device"
          },
          "participants": {
            "type": "array",
            "items": {
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
                  "description": "The first name of the user"
                }
              }
            },
            "description": "The ids of the users that participate in the chat"
          },
          "type": {
            "type": "string",
            "enum": [
              "friend",
              "group"
            ],
            "description": "The type of the chat"
          },
          "messageLane": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "content": {
                  "type": "string",
                  "description": "The content of the message"
                },
                "contentType": {
                  "type": "string",
                  "enum": [
                    "text",
                    "image",
                    "audio",
                    "video"
                  ],
                  "description": "The type of the content"
                },
                "sender": {
                  "type": "object",
                  "properties": {
                    "item": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The id of the sender"
                    },
                    "kind": {
                      "type": "string",
                      "enum": [
                        "user",
                        "community"
                      ],
                      "description": "The type of the sender"
                    }
                  }
                },
                "status": {
                  "type": "string",
                  "enum": [
                    "delivered",
                    "sent",
                    "read",
                    "acknowledged",
                    "failed"
                  ],
                  "description": "The status of the message"
                }
              }
            }
          }
        }
      };

      /*eslint-enable*/
      api.get(`/v1/chat/${createdChat._id}`)
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

    it('should respond with 404 Resource Not Found', function (done) {
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

      /*eslint-enable*/
      api.get(`/v1/chat/${createdUser._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUser._id
        })
        .expect(404)
        .end(function (err, res) {
          if (err) return done(err);

          validator.validate(res.body, schema).should.be.true;
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

      /*eslint-enable*/
      api.del(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'company',
          'context-id': createdUser._id
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
                "message": "The owner kind [company] is not valid for this entity."
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

      /*eslint-enable*/
      api.del(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'community',
          'context-id': createdUser._id
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
                "message": `An owner with id [${createdUser._id}] could not be found`
              }]
            },
            "status": 400
          };

          assert.deepEqual(res.body, expectedResponse, 'the expected error body was not returned');
          done();
        });
    });
    it('should respond with 401 Error. Owner has no access', function (done) {
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
      /*eslint-enable*/
      api.del(`/v1/chat/${createdChat._id}`)
        .set('Content-Type', 'application/json')
        .set({
          'context': 'user',
          'context-id': createdUserTwo._id
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

    it('should respond with 200 Deleted chat', function (done) {
      /*eslint-disable*/
      var schema = {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the chat"
          },
          "description": {
            "type": "string",
            "description": "The description of the chat"
          },
          "avatarId": {
            "type": "string",
            "description": "The id of the chat avatar stored on user's device"
          },
          "participants": {
            "type": "array",
            "items": {
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
                  "description": "The first name of the user"
                }
              }
            },
            "description": "The ids of the users that participate in the chat"
          },
          "type": {
            "type": "string",
            "enum": [
              "friend",
              "group"
            ],
            "description": "The type of the chat"
          },
          "messageLane": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "content": {
                  "type": "string",
                  "description": "The content of the message"
                },
                "contentType": {
                  "type": "string",
                  "enum": [
                    "text",
                    "image",
                    "audio",
                    "video"
                  ],
                  "description": "The type of the content"
                },
                "sender": {
                  "type": "object",
                  "properties": {
                    "item": {
                      "type": "string",
                      "format": "uuid",
                      "description": "The id of the sender"
                    },
                    "kind": {
                      "type": "string",
                      "enum": [
                        "user",
                        "community"
                      ],
                      "description": "The type of the sender"
                    }
                  }
                },
                "status": {
                  "type": "string",
                  "enum": [
                    "delivered",
                    "sent",
                    "read",
                    "acknowledged",
                    "failed"
                  ],
                  "description": "The status of the message"
                }
              }
            }
          }
        }
      };

      /*eslint-enable*/
      api.del(`/v1/chat/${createdChat._id}`)
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
      api.patch('/v1/chat/{id PARAM GOES HERE}')
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
