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
      inviteFriend: "inviteFriend",
      sendMessage: "sendMessage"
    },
    recipients: {
      gateway: "gateway",
      user: "user",
      registration: "registration",
      messageHub: "messageHub"
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
    },
    processExit: "process-exit"
  }
};
