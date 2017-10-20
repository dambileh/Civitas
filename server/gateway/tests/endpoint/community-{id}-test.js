'use strict';
var chai = require('chai');
var ZSchema = require('z-schema');
const assert = require('assert');
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

// describe('/community/{id}', function() {
//   describe('put', function() {
//     it('should respond with 200 Updated community', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "The name of the community"
//           },
//           "address": {
//             "type": "object",
//             "properties": {
//               "detail": {
//                 "type": "object",
//                 "required": [
//                   "line1",
//                   "city",
//                   "country",
//                   "postalCode",
//                   "type"
//                 ],
//                 "properties": {
//                   "line1": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The first line of address"
//                   },
//                   "line2": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The second line of address"
//                   },
//                   "city": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The city"
//                   },
//                   "state": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The state"
//                   },
//                   "province": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The province"
//                   },
//                   "country": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The country"
//                   },
//                   "postalCode": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The postal code"
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "physical",
//                       "postal"
//                     ],
//                     "description": "The type of the address"
//                   }
//                 }
//               },
//               "location": {
//                 "type": "object",
//                 "required": [
//                   "type",
//                   "coordinates"
//                 ],
//                 "properties": {
//                   "coordinates": {
//                     "type": "array",
//                     "items": {
//                       "type": "integer",
//                       "description": "The ids of the AR companies that service the user"
//                     }
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "Point"
//                     ],
//                     "description": "The longitude and latitude of the location"
//                   }
//                 }
//               },
//               "isPrimary": {
//                 "type": "boolean",
//                 "description": "Indicates if this is the primary address"
//               },
//               "createdAt": {
//                 "type": "string",
//                 "description": "The created date"
//               },
//               "updatedAt": {
//                 "type": "string",
//                 "description": "The updated date"
//               }
//             }
//           },
//           "entities": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the entity"
//                 },
//                 "branch": {
//                   "type": "string",
//                   "description": "The name of the branch"
//                 },
//                 "addresses": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "line1",
//                       "city",
//                       "country",
//                       "postalCode",
//                       "type"
//                     ],
//                     "properties": {
//                       "line1": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The first line of address"
//                       },
//                       "line2": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The second line of address"
//                       },
//                       "city": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The city"
//                       },
//                       "state": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The state"
//                       },
//                       "province": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The province"
//                       },
//                       "country": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The country"
//                       },
//                       "postalCode": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The postal code"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "physical",
//                           "postal"
//                         ],
//                         "description": "The type of the address"
//                       }
//                     }
//                   }
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "representatives": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "properties": {
//                       "name": {
//                         "type": "string",
//                         "description": "The name of the person"
//                       },
//                       "email": {
//                         "type": "string",
//                         "format": "email",
//                         "minLength": 6,
//                         "maxLength": 128
//                       },
//                       "phoneNumbers": {
//                         "type": "array",
//                         "items": {
//                           "type": "object",
//                           "required": [
//                             "type",
//                             "number"
//                           ],
//                           "properties": {
//                             "number": {
//                               "type": "string",
//                               "description": "The user's phone number"
//                             },
//                             "type": {
//                               "type": "string",
//                               "enum": [
//                                 "personal",
//                                 "business",
//                                 "home"
//                               ],
//                               "description": "The type of the landline number"
//                             },
//                             "isPrimary": {
//                               "type": "boolean",
//                               "description": "Indicates if this is the primary phone number"
//                             }
//                           }
//                         }
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary person"
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           "representatives": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the person"
//                 },
//                 "email": {
//                   "type": "string",
//                   "format": "email",
//                   "minLength": 6,
//                   "maxLength": 128
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "isPrimary": {
//                   "type": "boolean",
//                   "description": "Indicates if this is the primary person"
//                 }
//               }
//             }
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.put('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .send({
//         community: 'DATA GOES HERE'
//       })
//       .expect(200)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with 400 Validation Error. Usually...', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "errors": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "required": [
//                 "code",
//                 "message",
//                 "path"
//               ],
//               "properties": {
//                 "code": {
//                   "type": "string"
//                 },
//                 "message": {
//                   "type": "string"
//                 },
//                 "path": {
//                   "type": "array",
//                   "items": {
//                     "type": "string"
//                   }
//                 },
//                 "description": {
//                   "type": "string"
//                 }
//               }
//             }
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.put('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .send({
//         community: 'DATA GOES HERE'
//       })
//       .expect(400)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with 401 Unauthorized Access', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "name",
//           "message"
//         ],
//         "properties": {
//           "name": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.put('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .send({
//         community: 'DATA GOES HERE'
//       })
//       .expect(401)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with 405 Method not supported Error...', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.put('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .send({
//         community: 'DATA GOES HERE'
//       })
//       .expect(405)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with default unexpected error', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.put('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .send({
//         community: 'DATA GOES HERE'
//       })
//       .expect('DEFAULT RESPONSE CODE HERE')
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//   });
//
//   describe('delete', function() {
//     it('should respond with 200 Deleted community', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "The name of the community"
//           },
//           "address": {
//             "type": "object",
//             "properties": {
//               "detail": {
//                 "type": "object",
//                 "required": [
//                   "line1",
//                   "city",
//                   "country",
//                   "postalCode",
//                   "type"
//                 ],
//                 "properties": {
//                   "line1": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The first line of address"
//                   },
//                   "line2": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The second line of address"
//                   },
//                   "city": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The city"
//                   },
//                   "state": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The state"
//                   },
//                   "province": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The province"
//                   },
//                   "country": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The country"
//                   },
//                   "postalCode": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The postal code"
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "physical",
//                       "postal"
//                     ],
//                     "description": "The type of the address"
//                   }
//                 }
//               },
//               "location": {
//                 "type": "object",
//                 "required": [
//                   "type",
//                   "coordinates"
//                 ],
//                 "properties": {
//                   "coordinates": {
//                     "type": "array",
//                     "items": {
//                       "type": "integer",
//                       "description": "The ids of the AR companies that service the user"
//                     }
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "Point"
//                     ],
//                     "description": "The longitude and latitude of the location"
//                   }
//                 }
//               },
//               "isPrimary": {
//                 "type": "boolean",
//                 "description": "Indicates if this is the primary address"
//               },
//               "createdAt": {
//                 "type": "string",
//                 "description": "The created date"
//               },
//               "updatedAt": {
//                 "type": "string",
//                 "description": "The updated date"
//               }
//             }
//           },
//           "entities": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the entity"
//                 },
//                 "branch": {
//                   "type": "string",
//                   "description": "The name of the branch"
//                 },
//                 "addresses": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "line1",
//                       "city",
//                       "country",
//                       "postalCode",
//                       "type"
//                     ],
//                     "properties": {
//                       "line1": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The first line of address"
//                       },
//                       "line2": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The second line of address"
//                       },
//                       "city": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The city"
//                       },
//                       "state": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The state"
//                       },
//                       "province": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The province"
//                       },
//                       "country": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The country"
//                       },
//                       "postalCode": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The postal code"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "physical",
//                           "postal"
//                         ],
//                         "description": "The type of the address"
//                       }
//                     }
//                   }
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "representatives": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "properties": {
//                       "name": {
//                         "type": "string",
//                         "description": "The name of the person"
//                       },
//                       "email": {
//                         "type": "string",
//                         "format": "email",
//                         "minLength": 6,
//                         "maxLength": 128
//                       },
//                       "phoneNumbers": {
//                         "type": "array",
//                         "items": {
//                           "type": "object",
//                           "required": [
//                             "type",
//                             "number"
//                           ],
//                           "properties": {
//                             "number": {
//                               "type": "string",
//                               "description": "The user's phone number"
//                             },
//                             "type": {
//                               "type": "string",
//                               "enum": [
//                                 "personal",
//                                 "business",
//                                 "home"
//                               ],
//                               "description": "The type of the landline number"
//                             },
//                             "isPrimary": {
//                               "type": "boolean",
//                               "description": "Indicates if this is the primary phone number"
//                             }
//                           }
//                         }
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary person"
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           "representatives": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the person"
//                 },
//                 "email": {
//                   "type": "string",
//                   "format": "email",
//                   "minLength": 6,
//                   "maxLength": 128
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "isPrimary": {
//                   "type": "boolean",
//                   "description": "Indicates if this is the primary person"
//                 }
//               }
//             }
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.del('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//     it('should respond with 401 Unauthorized Access', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "name",
//           "message"
//         ],
//         "properties": {
//           "name": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.del('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .expect(401)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with 405 Method not supported Error...', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.del('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//     it('should respond with default unexpected error', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.del('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//   });
//
//   describe('get', function() {
//     it('should respond with 200 A single community', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "The name of the community"
//           },
//           "address": {
//             "type": "object",
//             "properties": {
//               "detail": {
//                 "type": "object",
//                 "required": [
//                   "line1",
//                   "city",
//                   "country",
//                   "postalCode",
//                   "type"
//                 ],
//                 "properties": {
//                   "line1": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The first line of address"
//                   },
//                   "line2": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The second line of address"
//                   },
//                   "city": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The city"
//                   },
//                   "state": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The state"
//                   },
//                   "province": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The province"
//                   },
//                   "country": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The country"
//                   },
//                   "postalCode": {
//                     "type": "string",
//                     "maxLength": 128,
//                     "description": "The postal code"
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "physical",
//                       "postal"
//                     ],
//                     "description": "The type of the address"
//                   }
//                 }
//               },
//               "location": {
//                 "type": "object",
//                 "required": [
//                   "type",
//                   "coordinates"
//                 ],
//                 "properties": {
//                   "coordinates": {
//                     "type": "array",
//                     "items": {
//                       "type": "integer",
//                       "description": "The ids of the AR companies that service the user"
//                     }
//                   },
//                   "type": {
//                     "type": "string",
//                     "enum": [
//                       "Point"
//                     ],
//                     "description": "The longitude and latitude of the location"
//                   }
//                 }
//               },
//               "isPrimary": {
//                 "type": "boolean",
//                 "description": "Indicates if this is the primary address"
//               },
//               "createdAt": {
//                 "type": "string",
//                 "description": "The created date"
//               },
//               "updatedAt": {
//                 "type": "string",
//                 "description": "The updated date"
//               }
//             }
//           },
//           "entities": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the entity"
//                 },
//                 "branch": {
//                   "type": "string",
//                   "description": "The name of the branch"
//                 },
//                 "addresses": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "line1",
//                       "city",
//                       "country",
//                       "postalCode",
//                       "type"
//                     ],
//                     "properties": {
//                       "line1": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The first line of address"
//                       },
//                       "line2": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The second line of address"
//                       },
//                       "city": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The city"
//                       },
//                       "state": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The state"
//                       },
//                       "province": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The province"
//                       },
//                       "country": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The country"
//                       },
//                       "postalCode": {
//                         "type": "string",
//                         "maxLength": 128,
//                         "description": "The postal code"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "physical",
//                           "postal"
//                         ],
//                         "description": "The type of the address"
//                       }
//                     }
//                   }
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "representatives": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "properties": {
//                       "name": {
//                         "type": "string",
//                         "description": "The name of the person"
//                       },
//                       "email": {
//                         "type": "string",
//                         "format": "email",
//                         "minLength": 6,
//                         "maxLength": 128
//                       },
//                       "phoneNumbers": {
//                         "type": "array",
//                         "items": {
//                           "type": "object",
//                           "required": [
//                             "type",
//                             "number"
//                           ],
//                           "properties": {
//                             "number": {
//                               "type": "string",
//                               "description": "The user's phone number"
//                             },
//                             "type": {
//                               "type": "string",
//                               "enum": [
//                                 "personal",
//                                 "business",
//                                 "home"
//                               ],
//                               "description": "The type of the landline number"
//                             },
//                             "isPrimary": {
//                               "type": "boolean",
//                               "description": "Indicates if this is the primary phone number"
//                             }
//                           }
//                         }
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary person"
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           "representatives": {
//             "type": "array",
//             "items": {
//               "type": "object",
//               "properties": {
//                 "name": {
//                   "type": "string",
//                   "description": "The name of the person"
//                 },
//                 "email": {
//                   "type": "string",
//                   "format": "email",
//                   "minLength": 6,
//                   "maxLength": 128
//                 },
//                 "phoneNumbers": {
//                   "type": "array",
//                   "items": {
//                     "type": "object",
//                     "required": [
//                       "type",
//                       "number"
//                     ],
//                     "properties": {
//                       "number": {
//                         "type": "string",
//                         "description": "The user's phone number"
//                       },
//                       "type": {
//                         "type": "string",
//                         "enum": [
//                           "personal",
//                           "business",
//                           "home"
//                         ],
//                         "description": "The type of the landline number"
//                       },
//                       "isPrimary": {
//                         "type": "boolean",
//                         "description": "Indicates if this is the primary phone number"
//                       }
//                     }
//                   }
//                 },
//                 "isPrimary": {
//                   "type": "boolean",
//                   "description": "Indicates if this is the primary person"
//                 }
//               }
//             }
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.get('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//     it('should respond with 401 Unauthorized Access', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "name",
//           "message"
//         ],
//         "properties": {
//           "name": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.get('/v1/community/{id PARAM GOES HERE}')
//       .set('Content-Type', 'application/json')
//       .set({
//         'context': 'DATA GOES HERE',
//         'context-id': 'DATA GOES HERE'
//       })
//       .expect(401)
//       .end(function(err, res) {
//         if (err) return done(err);
//
//         validator.validate(res.body, schema).should.be.true;
//         done();
//       });
//     });
//
//     it('should respond with 405 Method not supported Error...', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.get('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//     it('should respond with default unexpected error', function(done) {
//       /*eslint-disable*/
//       var schema = {
//         "type": "object",
//         "required": [
//           "code",
//           "message"
//         ],
//         "properties": {
//           "code": {
//             "type": "string"
//           },
//           "message": {
//             "type": "string"
//           },
//           "stack": {
//             "type": "string"
//           }
//         }
//       };
//
//       /*eslint-enable*/
//       api.get('/v1/community/{id PARAM GOES HERE}')
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
//     });
//
//   });
//
// });
