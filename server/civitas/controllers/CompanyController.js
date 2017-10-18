'use strict';

var companyService = require('../services/CompanyService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var companyChannels = require('../../PubSubChannels').Company;

/**
 * Calls the corresponding service layer method to create a company
 */
internalEventEmitter.on(companyChannels.Internal.CreateEvent, function(event){
  companyService.createCompany(event);
});

/**
 * Calls the corresponding service layer method to get all companies
 */
internalEventEmitter.on(companyChannels.Internal.GetAllEvent, function(event){
  companyService.getAllCompanies(event);
});

/**
 * Calls the corresponding service layer method to get a single company
 */
internalEventEmitter.on(companyChannels.Internal.GetSingleEvent, function(event){
  companyService.getSingleCompany(event);
});

/**
 * Calls the corresponding service layer method to delete a company
 */
internalEventEmitter.on(companyChannels.Internal.DeleteEvent, function(event){
  companyService.deleteCompany(event);
});

/**
 * Calls the corresponding service layer method to update a company
 */
internalEventEmitter.on(companyChannels.Internal.UpdateEvent, function(event){
  companyService.updateCompany(event);
});

