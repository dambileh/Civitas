module.exports = {

  /**
   * Creates a batch of passed in entities
   *
   * @param {Array} entities - The entities that will be updated
   *
   * @returns {Promise}
   */
  entityBatchCreate: function entityBatchCreate(entities) {
    return new Promise(async function (resolve, reject) {

      let savedEntities = [];
      let entitySaveError = null;

      for (let entity of entities) {
        try {
          await entity.save();
          savedEntities.push(entity);
        } catch (err) {
          entitySaveError = err;
          break;
        }
      }

      if (entitySaveError) {
        // We need to rollback the saved entities
        for (let savedEntity of savedEntities) {
          try {
            await savedEntity.remove();
          } catch (err) {
            // ignore the result, if we get an error on rollback, it is very unfortunate :)
            // At least we tried
          }
        }

        return reject(entitySaveError);
      }

      return resolve(entities);

    });
  }
};



