'use strict';

const Community = require('../models/Community');
const resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
const validationError = require('../../libs/error/ValidationError');
const appUtil = require('../../libs/AppUtil');
const logging = require('../utilities/Logging');
const config = require('config');
const internalEventEmitter = require('../../libs/InternalEventEmitter');
const addressManager = require('../managers/AddressManager');
const communityChannels = require('../../PubSubChannels').Community;
const errors = require('../../ErrorCodes');
const constants = require('../../Constants');
const ownerValidator = require('../validators/OwnerValidator');
const communityValidator = require('../validators/CommunityValidator');
const personValidator = require('../validators/PersonValidator');
const entityValidator = require('../validators/EntityValidator');

/**
 * The Community Service module
 */
module.exports = {

  /**
   * Creates a community
   *
   * @param {object} request - The request that was sent from the controller
   */
  createCommunity: async function createCommunity(request) {

    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    // Validate the request
    var communityValidationResult = await communityValidator.validateCreate(request);

    if (communityValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: communityValidationResult
        }
      );
    }
    
    //Validate the representatives
    let personValidationResult = await personValidator.validate(request.representatives);

    if (personValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: personValidationResult
        }
      );
    }

    // Validate the entities
    var entityValidationResult = await entityValidator.validate(request.entities);

    if (entityValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: entityValidationResult
        }
      );
    }

    // get address from the request and unset it so that we can create the Community model
    // Otherwise it will fail the Array of Ids schema validation

    // Set it to true since there is only one address
    request.address.isPrimary = true;
    let requestAddresses = [request.address];

    request.address = null;

    let communityModel = null;

    try {
      communityModel = new Community(request);
    } catch (error) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 500,
          body: error
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to save a new Community document'
    );

    await communityModel.save();

    let communityAddresses = null;

    try {
      communityAddresses = await addressManager.createAddresses(
        requestAddresses,
        communityModel.id,
        constants.address.ownerType.community
      );
    } catch (error) {

      let statusCode = 500;

      if (error.status === 400) {
        statusCode = 400;
      }

      // If there is an error creating the address, we should remove the community record as well
      await communityModel.remove();

      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: statusCode,
          body: error
        }
      );
    }

    // Now that we have created the address, we should set them on the user record
    // We only save the ids
    communityModel.address = communityAddresses.map((address) => {
      return address.id;
    })[0];

    await communityModel.save();

    // Set the address objects back on for display
    communityModel.address = communityAddresses[0];

    return internalEventEmitter.emit(
      communityChannels.Internal.CreateCompletedEvent,
      {
        statusCode: 201,
        body: communityModel
      }
    );
  },

  /**
   * Returns all communities
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  getAllCommunities: async function getAllCommunites(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);

    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to retrieve all communities'
    );

    let communities = null;

    try {
      communities = await Community
        .find({'owner.item': request.owner.item})
        .populate('address')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    let statusCode = 200;

    // If the array is empty we need to return a 204 response.
    if (appUtil.isArrayEmpty(communities)) {
      statusCode = 204;
    }

    return internalEventEmitter.emit(
      communityChannels.Internal.GetAllCompletedEvent,
      {
        statusCode: statusCode,
        header: {
          resultCount: communities.length
        },
        body: communities
      }
    );
  },

  /**
   * Returns a single community
   *
   * @param {object} request - The request that was sent from the controller
   */
  getSingleCommunity: async function getSingleCommunity(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to get a single community'
    );

    let community = null;

    try {
      community = await Community
        .findById(request.id)
        .populate('address')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(community)) {

      var notFoundError = new resourceNotFoundError(
        'Resource not found.',
        `No community with id [${request.id}] was found`
      );

      return internalEventEmitter.emit(
        communityChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 404,
          body: notFoundError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      community.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    return internalEventEmitter.emit(
      communityChannels.Internal.GetSingleCompletedEvent,
      {
        statusCode: 200,
        body: community
      }
    );
  },

  /**
   * Deletes a community
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteCommunity: async function deleteCommunity(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let community = null;
    try {
      community = await Community
        .findById(request.id)
        .populate('address')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(community)) {
      var modelValidationError = new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Community.COMMUNITY_NOT_FOUND,
            message: `No community with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );

      return internalEventEmitter.emit(
        communityChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 400,
          body: modelValidationError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      community.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to remove a community document'
    );

    try {
      await community.remove();
    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    return internalEventEmitter.emit(
      communityChannels.Internal.DeleteCompletedEvent,
      {
        statusCode: 200,
        body: community
      }
    );
  },

  /**
   * Updates a community
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  updateCommunity: async function updateCommunity(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);

    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let community = null;

    try {
      community = await Community
        .findById(request.id)
        .populate('address')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      community.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    var validationResult = await communityValidator.validateUpdate(community, request);

    if (validationResult) {
      return internalEventEmitter.emit(
        communityChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: validationResult
        }
      );
    }

    let communityAddresses = [community.address];

    if (request.entities) {
      // Validate the entities
      var entityValidationResult = await entityValidator.validate(request.entities);

      if (entityValidationResult) {
        return internalEventEmitter.emit(
          communityChannels.Internal.CreateCompletedEvent,
          {
            statusCode: 400,
            body: entityValidationResult
          }
        );
      }
      community.entities = request.entities;
    }

    if (request.representatives) {
      // Validate the representatives
      let personValidationResult = await personValidator.validate(request.representatives);
      if (personValidationResult) {
        return internalEventEmitter.emit(
          communityChannels.Internal.CreateCompletedEvent,
          {
            statusCode: 400,
            body: personValidationResult
          }
        );
      }
      community.representatives = request.representatives;
    }

    // First update the address
    if (request.address) {

      // Set it to true since there is only one address
      request.address.isPrimary = true;

      try {
        communityAddresses = await addressManager.updateAddresses(
          [request.address],
          [community.address],
          community.id,
          constants.address.ownerType.community
        );
      } catch (error) {

        let statusCode = 500;

        if (error.status === 400) {
          statusCode = 400;
        }

        return internalEventEmitter.emit(
          communityChannels.Internal.UpdateCompletedEvent,
          {
            statusCode: statusCode,
            body: error
          }
        );
      }

      community.address = communityAddresses.map((userAddress) => {
        return userAddress.id;
      })[0];
    }
    
    logging.logAction(
      logging.logLevels.INFO,
      `Attempting to update a community document with id [${community.id}]`
    );

    try {
      await community.save();
    } catch (err) {
      return internalEventEmitter.emit(
        communityChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    community.updatedAt = new Date();

    // set the address objects back on the display response
    community.address = communityAddresses[0];
    return internalEventEmitter.emit(
      communityChannels.Internal.UpdateCompletedEvent,
      {
        statusCode: 200,
        body: community
      }
    );
  }
};