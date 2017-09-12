module.exports = {
  pubSub: {
    messageType: {
        crud: "crud",
        custom: "custom"
    },
    messageAction: {
      create: "create",
      update: "update",
      delete: "delete",
      getSingle: "getSingle",
      getAll: "getAll",
      confirmRegistration: "confirmRegistration",
      requestRegistration: "requestRegistration",
      addFriends: "addFriends",
      inviteUser: "inviteUser"
    },
    recipients: {
      gateway: "gateway",
      user: "user",
      registration: "registration"
    },
    channelStore: {
      subscribers: "subscribers",
      messages: "messages"
    }
  },
  user: {
    status: {
      active: "active",
      inactive: "inactive"
    }
  },
  address: {
    ownerType: {
      company: "company",
      user: "user",
      person: "person"
    }
  },
  global: {
    error: {
      strictMode: "StrictModeError"
    }
  }
};
