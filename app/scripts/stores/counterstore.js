/**
*Note, in regards to whether to make async calls to APIs via stores,
* I would normally make actions responsible for API calls initiated by  
* view controller calls. Once data is retrieved the api or action logic would then 
* dispatch an event with the resulting data as a payload.
* This way any store can optionally listen to the event and this avoids chaining
* store dependencies if we called the API directly from the store.
* For this cut down, test exercise I am using this store to do an async request
* for two reasons a) it is a test exercise so scale is small and wont grow and 
* b) the api design returns data (all counters) on POST and DELETE anyway so we are 
* still maintaing data and receiving API data in store async calls either way (for now)
*/

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var resource = require('../services/resource');
var BProm = require('bluebird');
var util = require('../util/errorhandler');
var Constants = require('../services/constants');

var CHANGE_EVENT = 'change';
var RESOURCE_NAME = 'counter';

function NewCounterStore(dispatcher) {
  var CounterStore = assign({
    _counters: [],
    _savePending: false,

  }, EventEmitter.prototype, {
    emitChange: function() {
      this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
      this.on(CHANGE_EVENT, callback);
    },    
    removeChangeListener: function(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    },    
    
    isSavePending: function() {
      return this._savePending;
    },
    getCounters: function() {
      return this._counters;
    },
    _removeCounter: function(data) {
      var self = this;
      self._savePending = true;

      var p = resource.delete(RESOURCE_NAME, data)
        .then(function(counters) {
          self._counters = counters;          
        })
        .catch(function(errorXHR) {
          util.handleAPIError(errorXHR);
        })
        .finally(function() {
          self._savePending = false;
          CounterStore.emitChange();
        }); 
    },
    _getCounters: function() {
      var self = this;
      self._savePending = true;

      var p = resource.get("counters")
        .then(function(counters) {
          self._counters = counters;
        })
        .catch(function(errorXHR) {
          util.handleAPIError(errorXHR);
        })
        .finally(function() {
          self._savePending = false;
          CounterStore.emitChange();
        });      
    },
    _createCounter: function(data) {
      var self = this;
      self._savePending = true;

      var p = resource.create(RESOURCE_NAME, data)
        .then(function(counters) {
          self._counters = counters;
        })
        .catch(function(errorXHR) {
          util.handleAPIError(errorXHR);
        })
        .finally(function() {
          self._savePending = false;
          CounterStore.emitChange();
        });
    },
    _changeCount: function(data) {
      var self = this;
      self._savePending = true;
      var path = RESOURCE_NAME + '/dec';
      if (data.increment) {
        path = RESOURCE_NAME + '/inc';
      } 
      
      var p = resource.create(path, data)
        .then(function(counters) {
          self._counters = counters;
        })
        .catch(function(errorXHR) {
          util.handleAPIError(errorXHR);
        })
        .finally(function() {
          self._savePending = false;
          CounterStore.emitChange();
        });
    },
  }); 
  CounterStore.dispatchToken = dispatcher.register(function(payload) {    
    switch(payload.action) {
      //Add a named counter to a list of counters
      case Constants.ActionTypes.CREATE_COUNTER:
        return CounterStore._createCounter(payload.data);

      //Delete a counter
      case Constants.ActionTypes.REMOVE_COUNTER:
        return CounterStore._removeCounter(payload.data);

      //Increment any of the counters
      //Decrement any of the counters
      case Constants.ActionTypes.CHANGE_COUNT:
        return CounterStore._changeCount(payload.data);

      case Constants.ActionTypes.GET_COUNTERS:
        return CounterStore._getCounters();
      default:
        // do nothing
    }
  });
  return CounterStore;
}

module.exports = NewCounterStore;