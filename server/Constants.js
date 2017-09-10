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
      addFriends: "addFriends"
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
  }
};
