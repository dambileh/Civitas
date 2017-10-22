'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
var customFormats = module.exports = function(zSchema) {
  // Placeholder file for all custom-formats in known to swagger.json
  // as found on
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/;

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
let createdUserTwo = null;
let createdChat = null;
let createdChatTwo = null;

describe('/chat', function() {

  before(function (done) {
    const userOneBody = {
      "msisdn": "27721110001",
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
      "msisdn": "27733330001",
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
            done();
          });

      });

  });

  describe('post', function() {

    const chatBodyOne = {
      "name": "chat one",
      "description": "chat one description",
      "avatarId": "some id",
      "participants": [
        createdUser._id,
        createdUserTwo._id
      ],
      "type": "friend"
    };

    const chatBodyTwo = {
      "name": "chat two",
      "description": "chat two description",
      "avatarId": "some id",
      "participants": [
        createdUser._id,
        createdUserTwo._id
      ],
      "type": "group"
    };

    it('should respond with 201 success response that the...', function(done) {
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
              "type": "string",
              "format": "uuid"
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
      api.post('/v1/chat')
      .set('Content-Type', 'application/json')
      .set({
        'context': 'DATA GOES HERE',
        'context-id': 'DATA GOES HERE'
      })
      .send({
        chat: 'DATA GOES HERE'
      })
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);

        validator.validate(res.body, schema).should.be.true;
        done();
      });
    });

    // it('should respond with 400 Validation Error. Usually...', function(done) {
    //   /*eslint-disable*/
    //   var schema = {
    //     "type": "object",
    //     "required": [
    //       "code",
    //       "message"
    //     ],
    //     "properties": {
    //       "code": {
    //         "type": "string"
    //       },
    //       "message": {
    //         "type": "string"
    //       },
    //       "errors": {
    //         "type": "array",
    //         "items": {
    //           "type": "object",
    //           "required": [
    //             "code",
    //             "message",
    //             "path"
    //           ],
    //           "properties": {
    //             "code": {
    //               "type": "string"
    //             },
    //             "message": {
    //               "type": "string"
    //             },
    //             "path": {
    //               "type": "array",
    //               "items": {
    //                 "type": "string"
    //               }
    //             },
    //             "description": {
    //               "type": "string"
    //             }
    //           }
    //         }
    //       }
    //     }
    //   };
    //
    //   /*eslint-enable*/
    //   api.post('/v1/chat')
    //   .set('Content-Type', 'application/json')
    //   .set({
    //     'context': 'DATA GOES HERE',
    //     'context-id': 'DATA GOES HERE'
    //   })
    //   .send({
    //     chat: 'DATA GOES HERE'
    //   })
    //   .expect(400)
    //   .end(function(err, res) {
    //     if (err) return done(err);
    //
    //     validator.validate(res.body, schema).should.be.true;
    //     done();
    //   });
    // });

  });

  // describe('get', function() {
  //   it('should respond with 200 An array of chats', function(done) {
  //     /*eslint-disable*/
  //     var schema = {
  //       "type": "array",
  //       "items": {
  //         "type": "object",
  //         "properties": {
  //           "name": {
  //             "type": "string",
  //             "description": "The name of the chat"
  //           },
  //           "description": {
  //             "type": "string",
  //             "description": "The description of the chat"
  //           },
  //           "avatarId": {
  //             "type": "string",
  //             "description": "The id of the chat avatar stored on user's device"
  //           },
  //           "participants": {
  //             "type": "array",
  //             "items": {
  //               "type": "string",
  //               "format": "uuid"
  //             },
  //             "description": "The ids of the users that participate in the chat"
  //           },
  //           "type": {
  //             "type": "string",
  //             "enum": [
  //               "friend",
  //               "group"
  //             ],
  //             "description": "The type of the chat"
  //           },
  //           "messageLane": {
  //             "type": "array",
  //             "items": {
  //               "type": "object",
  //               "properties": {
  //                 "content": {
  //                   "type": "string",
  //                   "description": "The content of the message"
  //                 },
  //                 "contentType": {
  //                   "type": "string",
  //                   "enum": [
  //                     "text",
  //                     "image",
  //                     "audio",
  //                     "video"
  //                   ],
  //                   "description": "The type of the content"
  //                 },
  //                 "sender": {
  //                   "type": "object",
  //                   "properties": {
  //                     "item": {
  //                       "type": "string",
  //                       "format": "uuid",
  //                       "description": "The id of the sender"
  //                     },
  //                     "kind": {
  //                       "type": "string",
  //                       "enum": [
  //                         "user",
  //                         "community"
  //                       ],
  //                       "description": "The type of the sender"
  //                     }
  //                   }
  //                 },
  //                 "status": {
  //                   "type": "string",
  //                   "enum": [
  //                     "delivered",
  //                     "sent",
  //                     "read",
  //                     "acknowledged",
  //                     "failed"
  //                   ],
  //                   "description": "The status of the message"
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     };
  //
  //     /*eslint-enable*/
  //     api.get('/v1/chat')
  //       .set('Content-Type', 'application/json')
  //       .set({
  //         'context': 'DATA GOES HERE',
  //         'context-id': 'DATA GOES HERE'
  //       })
  //       .expect(200)
  //       .end(function(err, res) {
  //         if (err) return done(err);
  //
  //         validator.validate(res.body, schema).should.be.true;
  //         done();
  //       });
  //   });
  //
  //   it('should respond with 405 Method not supported Error...', function(done) {
  //     /*eslint-disable*/
  //     var schema = {
  //       "type": "object",
  //       "required": [
  //         "code",
  //         "message"
  //       ],
  //       "properties": {
  //         "code": {
  //           "type": "string"
  //         },
  //         "message": {
  //           "type": "string"
  //         },
  //         "stack": {
  //           "type": "string"
  //         }
  //       }
  //     };
  //
  //     /*eslint-enable*/
  //     api.get('/v1/chat')
  //       .set('Content-Type', 'application/json')
  //       .set({
  //         'context': 'DATA GOES HERE',
  //         'context-id': 'DATA GOES HERE'
  //       })
  //       .expect(405)
  //       .end(function(err, res) {
  //         if (err) return done(err);
  //
  //         validator.validate(res.body, schema).should.be.true;
  //         done();
  //       });
  //   });
  //
  //   it('should respond with default unexpected error', function(done) {
  //     /*eslint-disable*/
  //     var schema = {
  //       "type": "object",
  //       "required": [
  //         "code",
  //         "message"
  //       ],
  //       "properties": {
  //         "code": {
  //           "type": "string"
  //         },
  //         "message": {
  //           "type": "string"
  //         },
  //         "stack": {
  //           "type": "string"
  //         }
  //       }
  //     };
  //
  //     /*eslint-enable*/
  //     api.get('/v1/chat')
  //       .set('Content-Type', 'application/json')
  //       .set({
  //         'context': 'DATA GOES HERE',
  //         'context-id': 'DATA GOES HERE'
  //       })
  //       .expect('DEFAULT RESPONSE CODE HERE')
  //       .end(function(err, res) {
  //         if (err) return done(err);
  //
  //         validator.validate(res.body, schema).should.be.true;
  //         done();
  //       });
  //   });
  //
  // });

});
