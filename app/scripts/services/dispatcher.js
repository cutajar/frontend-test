/**
 * Defines the central dispatcher class.
 */
var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');
var Constants = require('./constants');

function NewDispatcher() {
  return assign(new Dispatcher(), {
    /**
     * @param {object} action The details of the action, including the action's
     * type and additional data coming from the view.
     */
    handleViewAction: function(data, action) {
      this.dispatch({
        source: Constants.PayloadSources.VIEW_ACTION,
        action: action,
        data: data
      });
    },
    handleAPIAction: function(data, action) {
      this.dispatch({
        source: Constants.PayloadSources.SERVER_ACTION,
        action: action,
        data: data
      });
    }

  });
}

module.exports = NewDispatcher;
