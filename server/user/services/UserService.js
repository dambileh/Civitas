'use strict';

var User = require('../models/User');
var ValidationError = require('../../libs/error/ValidationError');
var ResourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
var AppUtil = require('../../libs/AppUtil');
var Logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var SubscriptionManager = require('../managers/SubscriptionManager');
var UserChannels = require('../../PubSubChannels').User;
var Errors = require('../../ErrorCodes');

/**
 * The User Service module
 */
module.exports = {

  /**
   * Creates users
   *
   * @param {object} request - The request that was sent from the controller
   */
  createUser: function(request) {
    // Make sure that the no other user with the same name exist already

    User.findOne(
      {name: request.name},
      function userFindOneCallback(err, user) {
        if (err) {
          return _emitResponse({
            statusCode: 500,
            body: err
          });
        }

        if (!AppUtil.isNullOrUndefined(user)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: Errors.UserService.NAME_ALREADY_EXISTS,
                message: 'A user with name [' + request.name + '] already exists.',
                path: ['name']
              }
            ]
          );

          return _emitResponse({
            statusCode: 400,
            body: modelValidationError
          });
        }

        // noteRequest.status = 'new';

        var userEntity = new User(request);

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to save a new user document'
        );

        userEntity.save(
          function userSaveCallback(err) {
            if (err) {
              return _emitResponse({
                statusCode: 500,
                body: err
              });
            }

            return _emitResponse({
              statusCode: 201,
              body: userEntity
            });
          }
        );
      }
    );
  },

  // /**
  //  * Deletes note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // deleteUser: function(args, response, next) {
  //   // Make sure that the no other note with the same title exist already
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var modelValidationError = new ValidationError(
  //           'Some validation errors occurred.',
  //           [
  //             {
  //               code: ErrorCodes.NOTE_WAS_NOT_FOUND,
  //               message: 'A note with the id [' + args.id.value + '] could not be found.',
  //               path: ['id']
  //             }
  //           ]
  //         );
  //         return next(modelValidationError);
  //       }
  //
  //       Logging.logAction(
  //         Logging.logLevels.INFO,
  //         'Attempting to remove a note document'
  //       );
  //
  //       note.remove(
  //         function noteRemoveCallback(err) {
  //           if (err) {
  //             return next(err);
  //           }
  //
  //           // we do not want to return this prop
  //           response.statusCode = 200;
  //           response.setHeader('Content-Type', 'application/json');
  //           response.end(JSON.stringify(note));
  //         }
  //       );
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns a note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // getSingleUser: function(args, response, next) {
  //
  //   Logging.logAction(
  //     Logging.logLevels.INFO,
  //     'Attempting to get a note document'
  //   );
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var notFoundError = new ResourceNotFoundError(
  //           'Resource not found.',
  //           'No note with id [' + args.id.value + '] could be found'
  //         );
  //         return next(notFoundError);
  //       }
  //
  //       // we do not want to return this prop
  //       response.statusCode = 200;
  //       response.setHeader('Content-Type', 'application/json');
  //       response.end(JSON.stringify(note));
  //
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns a note
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} response - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // updateUser: function(args, response, next) {
  //
  //   var noteRequest = args.note.value;
  //
  //   Note.findById(args.id.value, function noteFindOneCallback(err, note) {
  //       if (err) {
  //         return next(err);
  //       }
  //
  //       if (AppUtil.isNullOrUndefined(note)) {
  //         var notFoundError = new ResourceNotFoundError(
  //           'Resource not found.',
  //           'No note with id [' + args.id.value + '] could be found'
  //         );
  //         return next(notFoundError);
  //       }
  //
  //       // TODO consider doing this in parallel
  //       Note.findOne({ title: noteRequest.title }, function noteFindOneCallback(err, noteTitleCheck) {
  //         if (err) {
  //           next(err);
  //           return;
  //         }
  //
  //         if (!AppUtil.isNullOrUndefined(noteTitleCheck) && (String(note._id) != String(noteTitleCheck._id))) {
  //           var modelValidationError = new ValidationError(
  //             'Some validation errors occurred.',
  //             [
  //               {
  //                 code: ErrorCodes.TITLE_ALREADY_EXISTS,
  //                 message: 'A note with the title [' + noteRequest.title + '] already exists.',
  //                 path: ['title']
  //               }
  //             ]
  //           );
  //           return next(modelValidationError);
  //         }
  //
  //         Logging.logAction(
  //           Logging.logLevels.INFO,
  //           'Attempting to update a note document'
  //         );
  //
  //         // set the updated properties, mongoose does not behave correctly if you pass a model directly
  //         var updatedProperties = {
  //           title: noteRequest.title,
  //           bgColor: noteRequest.bgColor,
  //           items: noteRequest.items
  //         };
  //
  //         Note.update( {_id : note._id}, updatedProperties, function noteUpdateCallback(err) {
  //             if (err) {
  //               return next(err);
  //             }
  //
  //             response.statusCode = 200;
  //             response.setHeader('Content-Type', 'application/json');
  //
  //             note.title = noteRequest.title;
  //             note.bgColor = noteRequest.bgColor;
  //             note.items = noteRequest.items;
  //             note.updatedAt = Date.Now;
  //
  //             return response.end(JSON.stringify(note));
  //           }
  //         );
  //       });
  //     }
  //   );
  // },
  //
  // /**
  //  * Returns all notes
  //  *
  //  * @param {object} args - The request arguments passed in from the controller
  //  * @param {IncomingMessage} res - The http response object
  //  * @param {function} next - The callback used to pass control to the next action/middleware
  //  */
  // getAllUsers: function(args, res, next) {
  //
  //   Logging.logAction(
  //     Logging.logLevels.INFO,
  //     'Attempting to retrieve all notes'
  //   );
  //
  //   Note.find(
  //     {},
  //     function noteFindCallback(err, notes) {
  //       if (err) {
  //         next(err);
  //         return;
  //       }
  //
  //       // If the array is empty we need to return a 204 response.
  //       if (AppUtil.isArrayEmpty(notes)) {
  //         res.statusCode = 204;
  //         res.setHeader('Content-Type', 'application/json');
  //         res.setHeader('X-Result-Count', 0);
  //         res.end(null);
  //       } else {
  //         res.statusCode = 200;
  //         res.setHeader('Content-Type', 'application/json');
  //         res.setHeader('X-Result-Count', notes.length);
  //         res.end(JSON.stringify(notes));
  //       }
  //     }
  //   );
  // }
};

function _emitResponse(response) {
  SubscriptionManager.internalEmitter.emit(
    UserChannels.Internal.CreateCompletedEvent,
    response
  );
}