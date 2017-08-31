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
            "GetAllCompletedEvent": "UserGetAllCompletedEvent"
        }
    },
    "Contact": {
        "External": {
            "Event": "ContactEvent",
            "CompletedEvent": "ContactCompletedEvent"
        },
        "Internal": {
            "CreateEvent": "ContactCreateEvent",
            "CreateCompletedEvent": "ContactCreateCompletedEvent",
            "UpdateEvent": "ContactUpdateEvent",
            "UpdateCompletedEvent": "ContactUpdateCompletedEvent",
            "DeleteEvent": "ContactDeleteEvent",
            "DeleteCompletedEvent": "ContactDeleteCompletedEvent",
            "GetSingleEvent": "ContactGetSingleEvent",
            "GetSingleCompletedEvent": "ContactGetSingleCompletedEvent",
            "GetAllEvent": "ContactGetAllEvent",
            "GetAllCompletedEvent": "ContactGetAllCompletedEvent"
        }
    },
    "Registration": {
        "External": {
            "Event": "RegistrationEvent",
            "CompletedEvent": "RegistrationCompletedEvent"
        },
        "Internal": {
            "RequestRegistrationEvent": "RequestRegistrationEvent",
            "RequestRegistrationCompletedEvent": "RequestRegistrationCompletedEvent"
        }
    }
};