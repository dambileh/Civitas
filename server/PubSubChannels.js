module.exports = {
  "User": {
    "External": {
      "Event": "UserEvent",
      "CompletedEvent": "UserCompletedEvent"
    },
    "Internal": {
      "CreateEvent": "UserCreateEvent",
      "CreateCompletedEvent": "UserCreateCompletedEvent",
      "UpdateEvent": "UserUpdateEvent",
      "UpdateCompletedEvent": "UserUpdateCompletedEvent",
      "DeleteEvent": "UserDeleteEvent",
      "DeleteCompletedEvent": "UserDeleteCompletedEvent",
      "GetSingleEvent": "UserGetSingleEvent",
      "GetSingleCompletedEvent": "UserGetSingleCompletedEvent",
      "GetAllEvent": "UserGetAllEvent",
      "GetAllCompletedEvent": "UserGetAllCompletedEvent",
      "AddUserFriendsEvent": "AddUserFriendsEvent",
      "AddUserFriendsCompletedEvent": "AddUserFriendsCompletedEvent"
    }
  },
  "Registration": {
    "External": {
      "Event": "RegistrationEvent",
      "CompletedEvent": "RegistrationCompletedEvent"
    },
    "Internal": {
      "RequestRegistrationEvent": "RequestRegistrationEvent",
      "RequestRegistrationCompletedEvent": "RequestRegistrationCompletedEvent",
      "ConfirmRegistrationEvent": "ConfirmRegistrationEvent",
      "ConfirmRegistrationCompletedEvent": "ConfirmRegistrationCompletedEvent"
    }
  }
};