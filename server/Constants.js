module.exports = {
  pubSub: {
    message_type: {
      crud: "crud",
      custom: "custom"
    },
    message_action: {
      create: "create",
      update: "update",
      delete: "delete",
      getSingle: "getSingle",
      getAll: "getAll",
      confirmRegistration: "confirmRegistration"
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
