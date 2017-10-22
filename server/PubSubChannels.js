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
      "AddUserFriendsCompletedEvent": "AddUserFriendsCompletedEvent",
      "InviteFriendEvent": "InviteFriendEvent",
      "InviteFriendEventCompletedEvent": "InviteFriendEventCompletedEvent"
    }
  },
  "Company": {
    "External": {
      "Event": "CompanyEvent",
      "CompletedEvent": "CompanyCompletedEvent"
    },
    "Internal": {
      "CreateEvent": "CompanyCreateEvent",
      "CreateCompletedEvent": "CompanyCreateCompletedEvent",
      "UpdateEvent": "CompanyUpdateEvent",
      "UpdateCompletedEvent": "CompanyUpdateCompletedEvent",
      "DeleteEvent": "CompanyDeleteEvent",
      "DeleteCompletedEvent": "CompanyDeleteCompletedEvent",
      "GetSingleEvent": "CompanyGetSingleEvent",
      "GetSingleCompletedEvent": "CompanyGetSingleCompletedEvent",
      "GetAllEvent": "CompanyGetAllEvent"
    }
  },
  "Chat": {
    "External": {
      "Event": "ChatEvent",
      "CompletedEvent": "ChatCompletedEvent"
    },
    "Internal": {
      "CreateEvent": "ChatCreateEvent",
      "CreateCompletedEvent": "ChatCreateCompletedEvent",
      "UpdateEvent": "ChatUpdateEvent",
      "UpdateCompletedEvent": "ChatUpdateCompletedEvent",
      "DeleteEvent": "ChatDeleteEvent",
      "DeleteCompletedEvent": "ChatDeleteCompletedEvent",
      "GetSingleEvent": "ChatGetSingleEvent",
      "GetSingleCompletedEvent": "ChatGetSingleCompletedEvent",
      "GetAllEvent": "ChatGetAllEvent"
    }
  },
  "Community": {
    "External": {
      "Event": "CommunityEvent",
      "CompletedEvent": "CommunityCompletedEvent"
    },
    "Internal": {
      "CreateEvent": "CommunityCreateEvent",
      "CreateCompletedEvent": "CommunityCreateCompletedEvent",
      "UpdateEvent": "CommunityUpdateEvent",
      "UpdateCompletedEvent": "CommunityUpdateCompletedEvent",
      "DeleteEvent": "CommunityDeleteEvent",
      "DeleteCompletedEvent": "CommunityDeleteCompletedEvent",
      "GetSingleEvent": "CommunityGetSingleEvent",
      "GetSingleCompletedEvent": "CommunityGetSingleCompletedEvent",
      "GetAllEvent": "CommunityGetAllEvent"
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