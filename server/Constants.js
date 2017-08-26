module.exports = {
  pub_sub: {
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
    }
  },
  user: {
    status: {
      active: "active",
      inactive: "inactive"
    }
  }
};
