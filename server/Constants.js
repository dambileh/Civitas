module.exports = {
  pubSub: {
    messageType: {
      crud: "crud"
    },
    messageAction: {
      create: "create",
      update: "update",
      delete: "delete",
      getSingle: "getSingle",
      getAll: "getAll",
      requestRegistration: "requestRegistration"
    },
    recipients: {
      gateway: "gateway",
      user: "user"
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
  global: {
    error: {
      strictMode: "StrictModeError"
    }
  }
};
