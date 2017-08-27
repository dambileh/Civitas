module.exports = {
  pubSub: {
    message_type: {
      crud: "crud"
    },
    message_action: {
      create: "create",
      update: "update",
      delete: "delete",
      getSingle: "getSingle",
      getAll: "getAll"
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
  }
};
