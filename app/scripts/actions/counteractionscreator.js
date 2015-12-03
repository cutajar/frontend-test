/**
 * Defines the actions that can be performed on Counter resources.
 */
var Constants = require('../services/constants');

module.exports = {
  createCounter: function(dispatcher, title) {
    dispatcher.handleViewAction({
        title: title,
      },
      Constants.ActionTypes.CREATE_COUNTER
    );
  },
  removeCounter: function(dispatcher, id) {
    dispatcher.handleViewAction({
        id: id,
      },
      Constants.ActionTypes.REMOVE_COUNTER
    );
  },
  changeCount: function(dispatcher, isIncrement, counterID) {
    dispatcher.handleViewAction({
        increment: isIncrement,
        id: counterID,
      },
      Constants.ActionTypes.CHANGE_COUNT
    );
  },
  getCounters: function(dispatcher) {
    dispatcher.handleViewAction(
      undefined,
      Constants.ActionTypes.GET_COUNTERS
    );
  },
};
