(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../services/constants":6}],2:[function(require,module,exports){
//Component used to call view controller components based on local route (URL).

var director = require('director');
var Counter = require('./counter');
var React = require('react');

var Application = React.createClass({displayName: "Application",
  propTypes: {
    core: React.PropTypes.object.isRequired
  },
  getInitialState: function() {
    return {
      router: this.buildRouter(),
      page: undefined,
    };
  },
  setPage: function(page) {
    this.setState({page: page});
  },
  buildRouter: function() {
    // set up routing
    var self = this;
    var routes = {
      '/': function() {
        return self.setPage(Counter);
      },
    };
    
    var router = director.Router(routes).configure({
      notfound: function() {
        router.setRoute('/');        
        routes['/']();
      }
    });
    return router;
  },

  componentWillMount: function() {
    // only init the router now
    this.state.router.init();

    // send to default route if there isn't one already
    var route = this.state.router.getRoute();
    if (route[0] === "") {
      this.state.router.notfound();
    }
  },

  render: function() {
    var Page = this.state.page;

    if (Page === undefined) {
      return React.createElement("span", null);
    }
    return (
      React.createElement(Page, {core: this.props.core})
    );
  }
});

module.exports = Application;

},{"./counter":3,"director":"director","react":"react"}],3:[function(require,module,exports){
var React = require("react");
var lod = require("lodash");
var Spinner = require('./spinner');
var CounterActionCreator = require('../actions/counteractionscreator');

var Counter = React.createClass({displayName: "Counter",
	propTypes: {
		core: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return {
			counters: undefined,
			waiting: undefined,
			newTitle: "",
		};		
	},
	componentDidMount: function() {
    document.title = "Counter Test - Daniel Cutajar";
    this.props.core.counterStore.addChangeListener(this.getStoreState);
    //DC - Please read comments in counterstore.js in regards to  
  	//flux architecture and my decision here for async reads
    CounterActionCreator.getCounters(this.props.core.dispatcher);    
  },

  componentWillUnmount: function() {
    this.props.core.counterStore.removeChangeListener(this.getStoreState);
  },

  //DC - Please read comments in  counterstore.js in regards to  
  //flux architecture and my decision here for async reads
	getStoreState: function() {		
		cStore = this.props.core.counterStore;

		if (cStore.isSavePending()) {
			this.setState({waiting: true});

		} else {
			this.setState({
				counters: cStore.getCounters(),
				waiting: false,
			});
		}
	},
	getTotalCount: function() {
		//using the else statement for readability 
		//(aware that return will exit function)
		if (this.state.counters === undefined || 
			this.state.counters.length === 0) {
			return 0;
		} else {
			var counts = lod.map(this.state.counters, 'count');
			var totalCount = lod.reduce(counts, function(total, n) {
				return total + n;
			});		
			return totalCount;	
		}		
	},
	titleChange: function(e) {
		this.setState({newTitle: e.target.value});
	},
	handleAddCounter: function(e) {
		//e.preventDefault();
		this.setState({
			waiting: true,
			newTitle: "",
		});
		CounterActionCreator.createCounter(this.props.core.dispatcher, this.state.newTitle);
	},
	removeCounterClick: function(e) {
		var counterID = e.currentTarget.attributes['data-counter-id'].value;
		CounterActionCreator.removeCounter(this.props.core.dispatcher, counterID);
	},
	//can refactor /merge next two funcs to the one function with param for inc or dec later.
	incrementClick: function(e) {
		var counterID = e.currentTarget.attributes['data-counter-id'].value;
		CounterActionCreator.changeCount(this.props.core.dispatcher, true, counterID);
	},
	decrementClick: function(e) {
		var counterID = e.currentTarget.attributes['data-counter-id'].value;
		CounterActionCreator.changeCount(this.props.core.dispatcher, false, counterID);
	},
	render: function() {
		var countersStub = [
			{id:"beast", title:"beast", count:1},
			{id:"phil", title:"phil", count:2},
		];
		var countersComponent  = (React.createElement("span", null));
		if (this.state.counters !== undefined) {
			countersComponent = (
				React.createElement(Counters, {counters: this.state.counters, 
					incrementClick: this.incrementClick, 
					decrementClick: this.decrementClick, 
					removeCounterClick: this.removeCounterClick})
			);
		}

		return (
			React.createElement("div", {className: "container"}, 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col-xs-12 col-md-6 counter-background"}, 
						React.createElement("h2", null, "Counter Test - Daniel Cutajar"), 						
						countersComponent, 				
						React.createElement(CounterTotal, {count: this.getTotalCount()})
					)
				), 
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col-xs-12 col-md-6 counter-background last-spacer"}, 
						React.createElement(AddCounterForm, {disable: false, handleAddCounter: this.handleAddCounter, 
							titleChange: this.titleChange, title: this.state.newTitle})
					)
				)
			)
		);
	},
});

var Counters = React.createClass({displayName: "Counters",
	propTypes: {
    counters: React.PropTypes.array.isRequired,
    incrementClick: React.PropTypes.func.isRequired,
    decrementClick: React.PropTypes.func.isRequired,
    removeCounterClick: React.PropTypes.func.isRequired,
  },  
  render: function() {
  	var self = this;
  	var displayCounter = function(counter) {
  		return (
  			React.createElement("li", {className: "list-group-item", key: "key" + counter.id}, 
  				React.createElement("span", {className: "counter-change-container"}, 
  					React.createElement("button", {"data-counter-id": counter.id, className: "btn btn-info counter-change-btn", 
  						onClick: self.props.incrementClick, "aria-label": "Increment"}, 
  						React.createElement("span", {className: "glyphicon glyphicon-plus", "aria-hidden": "true"})
	  				), 
	  				React.createElement("button", {className: "btn btn-info left-margin", "data-counter-id": counter.id, 
	  					onClick: self.props.decrementClick, "aria-label": "Increment"}, 
	  					React.createElement("span", {className: "glyphicon glyphicon-minus", "aria-hidden": "true"})
	  				), 
	  				React.createElement("button", {className: "btn btn-info left-margin", "data-counter-id": counter.id, 
	  					onClick: self.props.removeCounterClick, "aria-label": "Increment"}, 
	  					React.createElement("span", {className: "glyphicon glyphicon-remove-circle icon-large", "aria-hidden": "true"})
	  				)
  				), 				
  				
  				React.createElement("h4", null, 
  					React.createElement("span", {className: "label label-default label-as-badge"}, counter.count), 
  					" ", 
  					counter.title
  				)
  			)
  		);
  	};

  	if (this.props.counters.length === 0) {
			return (
	  		React.createElement("h3", null, "Add a counter below.")
	  	);
  	} else {
  		return (
	  		React.createElement("ul", {className: "list-group"}, 
	  			lod.map(this.props.counters, displayCounter)
	  		)
	  	);	
  	}  	
  }, 
});

var CounterTotal = React.createClass({displayName: "CounterTotal",
	propTypes: {
    count: React.PropTypes.number.isRequired,
  },
  render: function() {
  	return (
  		React.createElement("h3", null, 
  			"Total: ", this.props.count
  		)
  	);
  },
});

var AddCounterForm = React.createClass({displayName: "AddCounterForm",
	propTypes: {
    disable: React.PropTypes.bool.isRequired,
    handleAddCounter: React.PropTypes.func.isRequired,
    titleChange: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  render: function() {
  	return (
  		React.createElement("div", {className: "counter-form-container"}, 
	  		React.createElement("form", {role: "form", 
	  			className: "form-inline", onSubmit: this.props.handleAddCounter}, 
		  		React.createElement(CounterNameInput, {onChange: this.props.titleChange, 
		  			title: this.props.title, 
		  			titleChange: this.props.titleChange}), 
		  		React.createElement(AddCounterBtn, {disable: this.props.disable}), 
		  		React.createElement(Spinner, {spin: this.props.disable})
	  		)
	  	)
  	);
  },
});

var CounterNameInput = React.createClass({displayName: "CounterNameInput",
	propTypes: {
    titleChange: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
	render: function() {
		return (
			React.createElement("div", {className: "form-group"}, 
				React.createElement("label", {htmlFor: "addNewCounterInput"}, "Add A Counter: "
				), 
				React.createElement("input", {id: "addNewCounterInput", 
					type: "text", className: "form-control", placeholder: "Enter counter title", 
					onChange: this.props.titleChange, value: this.props.title})
			)
		);		
	},
});

var AddCounterBtn = React.createClass({displayName: "AddCounterBtn",
	//We dont need to lock callers of reusable components 
	//into specifying disable all the time.
	propTypes: {
    disable: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      disabled: false
    };
  },
  render: function() {
  	if (this.props.disabled) {
  		return (
  			React.createElement("button", {type: "submit", className: "btn btn-primary", disabled: true}, "Save"
		  	)
	  	);  		
  	} else {
  		return (  		
  			React.createElement("button", {type: "submit", className: "btn btn-primary"}, "Save"
		  	)
	  	);  		
  	}
  }
});

module.exports = Counter;

},{"../actions/counteractionscreator":1,"./spinner":4,"lodash":"lodash","react":"react"}],4:[function(require,module,exports){
var React = require("react");

var Spinner = React.createClass({displayName: "Spinner",
  propTypes: {
    spin: React.PropTypes.bool.isRequired,
  },  
  render: function() {    
    if (this.props.spin) {
      return (React.createElement("img", {src: "../../images/sp.gif"}));
    } else {
      return (React.createElement("span", null));
    }
  }
});

module.exports = Spinner;

},{"react":"react"}],5:[function(require,module,exports){
var Application = require('./components/application');
var ReactDOM = require('react-dom');
var React = require('react');

var Dispatcher = require('./services/dispatcher');
var CounterStore = require('./stores/counterstore');

var d = new Dispatcher();
var CoreObjects = {
  dispatcher: d,  
  counterStore: new CounterStore(d),
};

ReactDOM.render(
	React.createElement(Application, {core: CoreObjects}), 
	document.getElementById('bodyContainer')
);

},{"./components/application":2,"./services/dispatcher":7,"./stores/counterstore":9,"react":"react","react-dom":"react-dom"}],6:[function(require,module,exports){
var keyMirror = require('keymirror');
module.exports = {  
  ActionTypes: keyMirror({
    CREATE_COUNTER: null,
    REMOVE_COUNTER: null,
    CHANGE_COUNT: null,
    GET_COUNTERS: null,
  }),
  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  }),
 };

},{"keymirror":"keymirror"}],7:[function(require,module,exports){
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

},{"./constants":6,"flux":"flux","object-assign":"object-assign"}],8:[function(require,module,exports){
//This module deals with API calls on behalf of stores.
var BProm = require('bluebird');
var JSON_MIMETYPE_FULL = 'application/json; charset=UTF-8';
var JSON_MIMETYPE_TYPE = 'application/json';
var API_VERSION = 'v1';
var API_URL_BASE ='http://127.0.0.1:3000/api';

function http(url, method, body) {
  if (method === undefined) {
    method = 'GET';
  }

  return new BProm(function(resolve, reject) {
    // make basic object
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('error', reject);
    xhr.addEventListener('load', resolve);
    // open it up, ready to start writing headers
    xhr.open(method, url);

    // if body, set mimetype
    if (body !== undefined) {
      // default to JSON mimetype      
      xhr.setRequestHeader('Content-Type', JSON_MIMETYPE_FULL);
    }

    // send off the request
    xhr.send(body);
  });
}
function parseIfJSON(xhr) {
  try {
    var ct = xhr.getResponseHeader('Content-Type');
    if (ct !== undefined && ct !== null && ct.indexOf(JSON_MIMETYPE_TYPE) === 0){
      var returnObj = JSON.parse(xhr.responseText);
      returnObj.status = xhr.status;
      return returnObj;
    }
    else {
      return xhr;
    }
  }
  catch(err) {
    console.log('Error received' + err.message);
  }
}
function pathJoin(a, b) {
  if (a[a.length-1] !== '/') {
    a += '/';
  }
  if (b[0] === '/') {
    b = b.slice(1);
  }
  return a+b;
}
function getJoinedPath(path) {
  return pathJoin(
    pathJoin(API_URL_BASE, API_VERSION),
    path
  );
}

var Resource = {    
  get: function(path) {
    var url = getJoinedPath(path);
     
    //http(url, method, body)
    var p = http(url, 'GET', undefined)
      .then(function(e) {
        return parseIfJSON(e.target);
      });

    return p;
  },

  create: function(path, data) {
    var url = getJoinedPath(path);

    var jd = JSON.stringify(data);

    var p = http(url, 'POST', jd)
      .then(function(e) {
        var xhr = e.target;

        // there was an error
        if (xhr.status < 200 || xhr.status > 299) {
          throw xhr;
        } else {
          return parseIfJSON(xhr);          
        }
      });
    return p;
  },  
  delete: function(path, data) {
    var url = getJoinedPath(path);

    var jd = JSON.stringify(data);

    var p = http(url, 'DELETE', jd)
      .then(function(e) {
        var xhr = e.target;
        // there was an error
        if (xhr.status < 200 || xhr.status > 299) {
          throw xhr;
        } else {
          return parseIfJSON(xhr);
        }
      });
    return p;
  },  

};
module.exports = Resource;

},{"bluebird":"bluebird"}],9:[function(require,module,exports){
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

},{"../services/constants":6,"../services/resource":8,"../util/errorhandler":10,"bluebird":"bluebird","events":11,"object-assign":"object-assign"}],10:[function(require,module,exports){
var ErrorHandler = {
	handleAPIError: function(errXHR) {
		var fError = JSON.stringify(errXHR, null, 4);
	  console.log('!Error encountered: ' + fError);
	},
};

module.exports = ErrorHandler;

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvZ290cmFpbi9zcmMvdGVzdC9mcm9udGVuZC10ZXN0L2FwcC9zY3JpcHRzL2FjdGlvbnMvY291bnRlcmFjdGlvbnNjcmVhdG9yLmpzIiwiL2hvbWUvZGFuaWVsL2dvdHJhaW4vc3JjL3Rlc3QvZnJvbnRlbmQtdGVzdC9hcHAvc2NyaXB0cy9jb21wb25lbnRzL2FwcGxpY2F0aW9uLmpzIiwiL2hvbWUvZGFuaWVsL2dvdHJhaW4vc3JjL3Rlc3QvZnJvbnRlbmQtdGVzdC9hcHAvc2NyaXB0cy9jb21wb25lbnRzL2NvdW50ZXIuanMiLCIvaG9tZS9kYW5pZWwvZ290cmFpbi9zcmMvdGVzdC9mcm9udGVuZC10ZXN0L2FwcC9zY3JpcHRzL2NvbXBvbmVudHMvc3Bpbm5lci5qcyIsIi9ob21lL2RhbmllbC9nb3RyYWluL3NyYy90ZXN0L2Zyb250ZW5kLXRlc3QvYXBwL3NjcmlwdHMvbWFpbi5qcyIsIi9ob21lL2RhbmllbC9nb3RyYWluL3NyYy90ZXN0L2Zyb250ZW5kLXRlc3QvYXBwL3NjcmlwdHMvc2VydmljZXMvY29uc3RhbnRzLmpzIiwiL2hvbWUvZGFuaWVsL2dvdHJhaW4vc3JjL3Rlc3QvZnJvbnRlbmQtdGVzdC9hcHAvc2NyaXB0cy9zZXJ2aWNlcy9kaXNwYXRjaGVyLmpzIiwiL2hvbWUvZGFuaWVsL2dvdHJhaW4vc3JjL3Rlc3QvZnJvbnRlbmQtdGVzdC9hcHAvc2NyaXB0cy9zZXJ2aWNlcy9yZXNvdXJjZS5qcyIsIi9ob21lL2RhbmllbC9nb3RyYWluL3NyYy90ZXN0L2Zyb250ZW5kLXRlc3QvYXBwL3NjcmlwdHMvc3RvcmVzL2NvdW50ZXJzdG9yZS5qcyIsIi9ob21lL2RhbmllbC9nb3RyYWluL3NyYy90ZXN0L2Zyb250ZW5kLXRlc3QvYXBwL3NjcmlwdHMvdXRpbC9lcnJvcmhhbmRsZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztHQUVHO0FBQ0gsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7O0FBRWpELE1BQU0sQ0FBQyxPQUFPLEdBQUc7RUFDZixhQUFhLEVBQUUsU0FBUyxVQUFVLEVBQUUsS0FBSyxFQUFFO0lBQ3pDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUN4QixLQUFLLEVBQUUsS0FBSztPQUNiO01BQ0QsU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjO0tBQ3JDLENBQUM7R0FDSDtFQUNELGFBQWEsRUFBRSxTQUFTLFVBQVUsRUFBRSxFQUFFLEVBQUU7SUFDdEMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3hCLEVBQUUsRUFBRSxFQUFFO09BQ1A7TUFDRCxTQUFTLENBQUMsV0FBVyxDQUFDLGNBQWM7S0FDckMsQ0FBQztHQUNIO0VBQ0QsV0FBVyxFQUFFLFNBQVMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUU7SUFDeEQsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3hCLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLEVBQUUsRUFBRSxTQUFTO09BQ2Q7TUFDRCxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVk7S0FDbkMsQ0FBQztHQUNIO0VBQ0QsV0FBVyxFQUFFLFNBQVMsVUFBVSxFQUFFO0lBQ2hDLFVBQVUsQ0FBQyxnQkFBZ0I7TUFDekIsU0FBUztNQUNULFNBQVMsQ0FBQyxXQUFXLENBQUMsWUFBWTtLQUNuQyxDQUFDO0dBQ0g7Q0FDRixDQUFDOzs7QUNsQ0YsK0VBQStFOztBQUUvRSxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0IsSUFBSSxpQ0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBEZWZpbmVzIHRoZSBhY3Rpb25zIHRoYXQgY2FuIGJlIHBlcmZvcm1lZCBvbiBDb3VudGVyIHJlc291cmNlcy5cbiAqL1xudmFyIENvbnN0YW50cyA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2NvbnN0YW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlQ291bnRlcjogZnVuY3Rpb24oZGlzcGF0Y2hlciwgdGl0bGUpIHtcbiAgICBkaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICB9LFxuICAgICAgQ29uc3RhbnRzLkFjdGlvblR5cGVzLkNSRUFURV9DT1VOVEVSXG4gICAgKTtcbiAgfSxcbiAgcmVtb3ZlQ291bnRlcjogZnVuY3Rpb24oZGlzcGF0Y2hlciwgaWQpIHtcbiAgICBkaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBpZDogaWQsXG4gICAgICB9LFxuICAgICAgQ29uc3RhbnRzLkFjdGlvblR5cGVzLlJFTU9WRV9DT1VOVEVSXG4gICAgKTtcbiAgfSxcbiAgY2hhbmdlQ291bnQ6IGZ1bmN0aW9uKGRpc3BhdGNoZXIsIGlzSW5jcmVtZW50LCBjb3VudGVySUQpIHtcbiAgICBkaXNwYXRjaGVyLmhhbmRsZVZpZXdBY3Rpb24oe1xuICAgICAgICBpbmNyZW1lbnQ6IGlzSW5jcmVtZW50LFxuICAgICAgICBpZDogY291bnRlcklELFxuICAgICAgfSxcbiAgICAgIENvbnN0YW50cy5BY3Rpb25UeXBlcy5DSEFOR0VfQ09VTlRcbiAgICApO1xuICB9LFxuICBnZXRDb3VudGVyczogZnVuY3Rpb24oZGlzcGF0Y2hlcikge1xuICAgIGRpc3BhdGNoZXIuaGFuZGxlVmlld0FjdGlvbihcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIENvbnN0YW50cy5BY3Rpb25UeXBlcy5HRVRfQ09VTlRFUlNcbiAgICApO1xuICB9LFxufTtcbiIsIi8vQ29tcG9uZW50IHVzZWQgdG8gY2FsbCB2aWV3IGNvbnRyb2xsZXIgY29tcG9uZW50cyBiYXNlZCBvbiBsb2NhbCByb3V0ZSAoVVJMKS5cblxudmFyIGRpcmVjdG9yID0gcmVxdWlyZSgnZGlyZWN0b3InKTtcbnZhciBDb3VudGVyID0gcmVxdWlyZSgnLi9jb3VudGVyJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQXBwbGljYXRpb24gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIGNvcmU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3V0ZXI6IHRoaXMuYnVpbGRSb3V0ZXIoKSxcbiAgICAgIHBhZ2U6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9LFxuICBzZXRQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7cGFnZTogcGFnZX0pO1xuICB9LFxuICBidWlsZFJvdXRlcjogZnVuY3Rpb24oKSB7XG4gICAgLy8gc2V0IHVwIHJvdXRpbmdcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJvdXRlcyA9IHtcbiAgICAgICcvJzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnNldFBhZ2UoQ291bnRlcik7XG4gICAgICB9LFxuICAgIH07XG4gICAgXG4gICAgdmFyIHJvdXRlciA9IGRpcmVjdG9yLlJvdXRlcihyb3V0ZXMpLmNvbmZpZ3VyZSh7XG4gICAgICBub3Rmb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJvdXRlci5zZXRSb3V0ZSgnLycpOyAgICAgICAgXG4gICAgICAgIHJvdXRlc1snLyddKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJvdXRlcjtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIG9ubHkgaW5pdCB0aGUgcm91dGVyIG5vd1xuICAgIHRoaXMuc3RhdGUucm91dGVyLmluaXQoKTtcblxuICAgIC8vIHNlbmQgdG8gZGVmYXVsdCByb3V0ZSBpZiB0aGVyZSBpc24ndCBvbmUgYWxyZWFkeVxuICAgIHZhciByb3V0ZSA9IHRoaXMuc3RhdGUucm91dGVyLmdldFJvdXRlKCk7XG4gICAgaWYgKHJvdXRlWzBdID09PSBcIlwiKSB7XG4gICAgICB0aGlzLnN0YXRlLnJvdXRlci5ub3Rmb3VuZCgpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBQYWdlID0gdGhpcy5zdGF0ZS5wYWdlO1xuXG4gICAgaWYgKFBhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIDxzcGFuLz47XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8UGFnZSBjb3JlPXt0aGlzLnByb3BzLmNvcmV9Lz5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBsb2QgPSByZXF1aXJlKFwibG9kYXNoXCIpO1xudmFyIFNwaW5uZXIgPSByZXF1aXJlKCcuL3NwaW5uZXInKTtcbnZhciBDb3VudGVyQWN0aW9uQ3JlYXRvciA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvY291bnRlcmFjdGlvbnNjcmVhdG9yJyk7XG5cbnZhciBDb3VudGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRjb3JlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjb3VudGVyczogdW5kZWZpbmVkLFxuXHRcdFx0d2FpdGluZzogdW5kZWZpbmVkLFxuXHRcdFx0bmV3VGl0bGU6IFwiXCIsXG5cdFx0fTtcdFx0XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IFwiQ291bnRlciBUZXN0IC0gRGFuaWVsIEN1dGFqYXJcIjtcbiAgICB0aGlzLnByb3BzLmNvcmUuY291bnRlclN0b3JlLmFkZENoYW5nZUxpc3RlbmVyKHRoaXMuZ2V0U3RvcmVTdGF0ZSk7XG4gICAgLy9EQyAtIFBsZWFzZSByZWFkIGNvbW1lbnRzIGluIGNvdW50ZXJzdG9yZS5qcyBpbiByZWdhcmRzIHRvICBcbiAgXHQvL2ZsdXggYXJjaGl0ZWN0dXJlIGFuZCBteSBkZWNpc2lvbiBoZXJlIGZvciBhc3luYyByZWFkc1xuICAgIENvdW50ZXJBY3Rpb25DcmVhdG9yLmdldENvdW50ZXJzKHRoaXMucHJvcHMuY29yZS5kaXNwYXRjaGVyKTsgICAgXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJvcHMuY29yZS5jb3VudGVyU3RvcmUucmVtb3ZlQ2hhbmdlTGlzdGVuZXIodGhpcy5nZXRTdG9yZVN0YXRlKTtcbiAgfSxcblxuICAvL0RDIC0gUGxlYXNlIHJlYWQgY29tbWVudHMgaW4gIGNvdW50ZXJzdG9yZS5qcyBpbiByZWdhcmRzIHRvICBcbiAgLy9mbHV4IGFyY2hpdGVjdHVyZSBhbmQgbXkgZGVjaXNpb24gaGVyZSBmb3IgYXN5bmMgcmVhZHNcblx0Z2V0U3RvcmVTdGF0ZTogZnVuY3Rpb24oKSB7XHRcdFxuXHRcdGNTdG9yZSA9IHRoaXMucHJvcHMuY29yZS5jb3VudGVyU3RvcmU7XG5cblx0XHRpZiAoY1N0b3JlLmlzU2F2ZVBlbmRpbmcoKSkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7d2FpdGluZzogdHJ1ZX0pO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRjb3VudGVyczogY1N0b3JlLmdldENvdW50ZXJzKCksXG5cdFx0XHRcdHdhaXRpbmc6IGZhbHNlLFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRnZXRUb3RhbENvdW50OiBmdW5jdGlvbigpIHtcblx0XHQvL3VzaW5nIHRoZSBlbHNlIHN0YXRlbWVudCBmb3IgcmVhZGFiaWxpdHkgXG5cdFx0Ly8oYXdhcmUgdGhhdCByZXR1cm4gd2lsbCBleGl0IGZ1bmN0aW9uKVxuXHRcdGlmICh0aGlzLnN0YXRlLmNvdW50ZXJzID09PSB1bmRlZmluZWQgfHwgXG5cdFx0XHR0aGlzLnN0YXRlLmNvdW50ZXJzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBjb3VudHMgPSBsb2QubWFwKHRoaXMuc3RhdGUuY291bnRlcnMsICdjb3VudCcpO1xuXHRcdFx0dmFyIHRvdGFsQ291bnQgPSBsb2QucmVkdWNlKGNvdW50cywgZnVuY3Rpb24odG90YWwsIG4pIHtcblx0XHRcdFx0cmV0dXJuIHRvdGFsICsgbjtcblx0XHRcdH0pO1x0XHRcblx0XHRcdHJldHVybiB0b3RhbENvdW50O1x0XG5cdFx0fVx0XHRcblx0fSxcblx0dGl0bGVDaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtuZXdUaXRsZTogZS50YXJnZXQudmFsdWV9KTtcblx0fSxcblx0aGFuZGxlQWRkQ291bnRlcjogZnVuY3Rpb24oZSkge1xuXHRcdC8vZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0d2FpdGluZzogdHJ1ZSxcblx0XHRcdG5ld1RpdGxlOiBcIlwiLFxuXHRcdH0pO1xuXHRcdENvdW50ZXJBY3Rpb25DcmVhdG9yLmNyZWF0ZUNvdW50ZXIodGhpcy5wcm9wcy5jb3JlLmRpc3BhdGNoZXIsIHRoaXMuc3RhdGUubmV3VGl0bGUpO1xuXHR9LFxuXHRyZW1vdmVDb3VudGVyQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgY291bnRlcklEID0gZS5jdXJyZW50VGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtY291bnRlci1pZCddLnZhbHVlO1xuXHRcdENvdW50ZXJBY3Rpb25DcmVhdG9yLnJlbW92ZUNvdW50ZXIodGhpcy5wcm9wcy5jb3JlLmRpc3BhdGNoZXIsIGNvdW50ZXJJRCk7XG5cdH0sXG5cdC8vY2FuIHJlZmFjdG9yIC9tZXJnZSBuZXh0IHR3byBmdW5jcyB0byB0aGUgb25lIGZ1bmN0aW9uIHdpdGggcGFyYW0gZm9yIGluYyBvciBkZWMgbGF0ZXIuXG5cdGluY3JlbWVudENsaWNrOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIGNvdW50ZXJJRCA9IGUuY3VycmVudFRhcmdldC5hdHRyaWJ1dGVzWydkYXRhLWNvdW50ZXItaWQnXS52YWx1ZTtcblx0XHRDb3VudGVyQWN0aW9uQ3JlYXRvci5jaGFuZ2VDb3VudCh0aGlzLnByb3BzLmNvcmUuZGlzcGF0Y2hlciwgdHJ1ZSwgY291bnRlcklEKTtcblx0fSxcblx0ZGVjcmVtZW50Q2xpY2s6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgY291bnRlcklEID0gZS5jdXJyZW50VGFyZ2V0LmF0dHJpYnV0ZXNbJ2RhdGEtY291bnRlci1pZCddLnZhbHVlO1xuXHRcdENvdW50ZXJBY3Rpb25DcmVhdG9yLmNoYW5nZUNvdW50KHRoaXMucHJvcHMuY29yZS5kaXNwYXRjaGVyLCBmYWxzZSwgY291bnRlcklEKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY291bnRlcnNTdHViID0gW1xuXHRcdFx0e2lkOlwiYmVhc3RcIiwgdGl0bGU6XCJiZWFzdFwiLCBjb3VudDoxfSxcblx0XHRcdHtpZDpcInBoaWxcIiwgdGl0bGU6XCJwaGlsXCIsIGNvdW50OjJ9LFxuXHRcdF07XG5cdFx0dmFyIGNvdW50ZXJzQ29tcG9uZW50ICA9ICg8c3Bhbi8+KTtcblx0XHRpZiAodGhpcy5zdGF0ZS5jb3VudGVycyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb3VudGVyc0NvbXBvbmVudCA9IChcblx0XHRcdFx0PENvdW50ZXJzIGNvdW50ZXJzPXt0aGlzLnN0YXRlLmNvdW50ZXJzfSBcblx0XHRcdFx0XHRpbmNyZW1lbnRDbGljaz17dGhpcy5pbmNyZW1lbnRDbGlja31cblx0XHRcdFx0XHRkZWNyZW1lbnRDbGljaz17dGhpcy5kZWNyZW1lbnRDbGlja30gXG5cdFx0XHRcdFx0cmVtb3ZlQ291bnRlckNsaWNrPXt0aGlzLnJlbW92ZUNvdW50ZXJDbGlja30vPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMiBjb2wtbWQtNiBjb3VudGVyLWJhY2tncm91bmRcIj5cblx0XHRcdFx0XHRcdDxoMj5Db3VudGVyIFRlc3QgLSBEYW5pZWwgQ3V0YWphcjwvaDI+XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR7Y291bnRlcnNDb21wb25lbnR9XHRcdFx0XHRcblx0XHRcdFx0XHRcdDxDb3VudGVyVG90YWwgY291bnQ9e3RoaXMuZ2V0VG90YWxDb3VudCgpfSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMiBjb2wtbWQtNiBjb3VudGVyLWJhY2tncm91bmQgbGFzdC1zcGFjZXJcIj5cblx0XHRcdFx0XHRcdDxBZGRDb3VudGVyRm9ybSBkaXNhYmxlPXtmYWxzZX0gaGFuZGxlQWRkQ291bnRlcj17dGhpcy5oYW5kbGVBZGRDb3VudGVyfSBcblx0XHRcdFx0XHRcdFx0dGl0bGVDaGFuZ2U9e3RoaXMudGl0bGVDaGFuZ2V9IHRpdGxlPXt0aGlzLnN0YXRlLm5ld1RpdGxlfS8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fSxcbn0pO1xuXG52YXIgQ291bnRlcnMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuICAgIGNvdW50ZXJzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBpbmNyZW1lbnRDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBkZWNyZW1lbnRDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByZW1vdmVDb3VudGVyQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH0sICBcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgXHR2YXIgc2VsZiA9IHRoaXM7XG4gIFx0dmFyIGRpc3BsYXlDb3VudGVyID0gZnVuY3Rpb24oY291bnRlcikge1xuICBcdFx0cmV0dXJuIChcbiAgXHRcdFx0PGxpIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAtaXRlbVwiIGtleT17XCJrZXlcIiArIGNvdW50ZXIuaWR9PlxuICBcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImNvdW50ZXItY2hhbmdlLWNvbnRhaW5lclwiPlxuICBcdFx0XHRcdFx0PGJ1dHRvbiBkYXRhLWNvdW50ZXItaWQ9e2NvdW50ZXIuaWR9IGNsYXNzTmFtZT1cImJ0biBidG4taW5mbyBjb3VudGVyLWNoYW5nZS1idG5cIiBcbiAgXHRcdFx0XHRcdFx0b25DbGljaz17c2VsZi5wcm9wcy5pbmNyZW1lbnRDbGlja30gYXJpYS1sYWJlbD1cIkluY3JlbWVudFwiPlxuICBcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJnbHlwaGljb24gZ2x5cGhpY29uLXBsdXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+XG5cdCAgXHRcdFx0XHQ8L2J1dHRvbj5cblx0ICBcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1pbmZvIGxlZnQtbWFyZ2luXCIgZGF0YS1jb3VudGVyLWlkPXtjb3VudGVyLmlkfVxuXHQgIFx0XHRcdFx0XHRvbkNsaWNrPXtzZWxmLnByb3BzLmRlY3JlbWVudENsaWNrfSBhcmlhLWxhYmVsPVwiSW5jcmVtZW50XCI+XG5cdCAgXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImdseXBoaWNvbiBnbHlwaGljb24tbWludXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+XG5cdCAgXHRcdFx0XHQ8L2J1dHRvbj5cblx0ICBcdFx0XHRcdDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1pbmZvIGxlZnQtbWFyZ2luXCIgZGF0YS1jb3VudGVyLWlkPXtjb3VudGVyLmlkfVxuXHQgIFx0XHRcdFx0XHRvbkNsaWNrPXtzZWxmLnByb3BzLnJlbW92ZUNvdW50ZXJDbGlja30gYXJpYS1sYWJlbD1cIkluY3JlbWVudFwiPlxuXHQgIFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZS1jaXJjbGUgaWNvbi1sYXJnZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj5cblx0ICBcdFx0XHRcdDwvYnV0dG9uPlxuICBcdFx0XHRcdDwvc3Bhbj4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0XG4gIFx0XHRcdFx0PGg0PlxuICBcdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwibGFiZWwgbGFiZWwtZGVmYXVsdCBsYWJlbC1hcy1iYWRnZVwiPntjb3VudGVyLmNvdW50fTwvc3Bhbj5cbiAgXHRcdFx0XHRcdCZuYnNwO1xuICBcdFx0XHRcdFx0e2NvdW50ZXIudGl0bGV9XG4gIFx0XHRcdFx0PC9oND5cbiAgXHRcdFx0PC9saT5cbiAgXHRcdCk7XG4gIFx0fTtcblxuICBcdGlmICh0aGlzLnByb3BzLmNvdW50ZXJzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIChcblx0ICBcdFx0PGgzPkFkZCBhIGNvdW50ZXIgYmVsb3cuPC9oMz5cblx0ICBcdCk7XG4gIFx0fSBlbHNlIHtcbiAgXHRcdHJldHVybiAoXG5cdCAgXHRcdDx1bCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG5cdCAgXHRcdFx0e2xvZC5tYXAodGhpcy5wcm9wcy5jb3VudGVycywgZGlzcGxheUNvdW50ZXIpfVxuXHQgIFx0XHQ8L3VsPlxuXHQgIFx0KTtcdFxuICBcdH0gIFx0XG4gIH0sIFxufSk7XG5cbnZhciBDb3VudGVyVG90YWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuICAgIGNvdW50OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gIFx0cmV0dXJuIChcbiAgXHRcdDxoMz5cbiAgXHRcdFx0VG90YWw6IHt0aGlzLnByb3BzLmNvdW50fVxuICBcdFx0PC9oMz5cbiAgXHQpO1xuICB9LFxufSk7XG5cbnZhciBBZGRDb3VudGVyRm9ybSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG4gICAgZGlzYWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBoYW5kbGVBZGRDb3VudGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHRpdGxlQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHRpdGxlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gIFx0cmV0dXJuIChcbiAgXHRcdDxkaXYgY2xhc3NOYW1lPVwiY291bnRlci1mb3JtLWNvbnRhaW5lclwiPlxuXHQgIFx0XHQ8Zm9ybSByb2xlPVwiZm9ybVwiIFxuXHQgIFx0XHRcdGNsYXNzTmFtZT1cImZvcm0taW5saW5lXCIgb25TdWJtaXQ9e3RoaXMucHJvcHMuaGFuZGxlQWRkQ291bnRlcn0+XG5cdFx0ICBcdFx0PENvdW50ZXJOYW1lSW5wdXQgb25DaGFuZ2U9e3RoaXMucHJvcHMudGl0bGVDaGFuZ2V9IFxuXHRcdCAgXHRcdFx0dGl0bGU9e3RoaXMucHJvcHMudGl0bGV9IFxuXHRcdCAgXHRcdFx0dGl0bGVDaGFuZ2U9e3RoaXMucHJvcHMudGl0bGVDaGFuZ2V9Lz5cblx0XHQgIFx0XHQ8QWRkQ291bnRlckJ0biAgZGlzYWJsZSA9IHt0aGlzLnByb3BzLmRpc2FibGV9Lz5cblx0XHQgIFx0XHQ8U3Bpbm5lciBzcGluPXt0aGlzLnByb3BzLmRpc2FibGV9Lz5cblx0ICBcdFx0PC9mb3JtPlxuXHQgIFx0PC9kaXY+XG4gIFx0KTtcbiAgfSxcbn0pO1xuXG52YXIgQ291bnRlck5hbWVJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG4gICAgdGl0bGVDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgdGl0bGU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG5cdFx0XHRcdDxsYWJlbCBodG1sRm9yPVwiYWRkTmV3Q291bnRlcklucHV0XCI+QWRkIEEgQ291bnRlcjombmJzcDtcblx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0PGlucHV0IGlkPVwiYWRkTmV3Q291bnRlcklucHV0XCIgXG5cdFx0XHRcdFx0dHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cIkVudGVyIGNvdW50ZXIgdGl0bGVcIiBcblx0XHRcdFx0XHRvbkNoYW5nZT17dGhpcy5wcm9wcy50aXRsZUNoYW5nZX0gdmFsdWU9e3RoaXMucHJvcHMudGl0bGV9Lz5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XHRcdFxuXHR9LFxufSk7XG5cbnZhciBBZGRDb3VudGVyQnRuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHQvL1dlIGRvbnQgbmVlZCB0byBsb2NrIGNhbGxlcnMgb2YgcmV1c2FibGUgY29tcG9uZW50cyBcblx0Ly9pbnRvIHNwZWNpZnlpbmcgZGlzYWJsZSBhbGwgdGhlIHRpbWUuXG5cdHByb3BUeXBlczoge1xuICAgIGRpc2FibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc2FibGVkOiBmYWxzZVxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gIFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgXHRcdHJldHVybiAoXG4gIFx0XHRcdDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIGRpc2FibGVkPlNhdmVcblx0XHQgIFx0PC9idXR0b24+XG5cdCAgXHQpOyAgXHRcdFxuICBcdH0gZWxzZSB7XG4gIFx0XHRyZXR1cm4gKCAgXHRcdFxuICBcdFx0XHQ8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5TYXZlXG5cdFx0ICBcdDwvYnV0dG9uPlxuXHQgIFx0KTsgIFx0XHRcbiAgXHR9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvdW50ZXI7IiwidmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgU3Bpbm5lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgc3BpbjogUmVhY3QuUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgfSwgIFxuICByZW5kZXI6IGZ1bmN0aW9uKCkgeyAgICBcbiAgICBpZiAodGhpcy5wcm9wcy5zcGluKSB7XG4gICAgICByZXR1cm4gKDxpbWcgc3JjPVwiLi4vLi4vaW1hZ2VzL3NwLmdpZlwiPjwvaW1nPik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgfVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGlubmVyO1xuIiwidmFyIEFwcGxpY2F0aW9uID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL2FwcGxpY2F0aW9uJyk7XG52YXIgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9zZXJ2aWNlcy9kaXNwYXRjaGVyJyk7XG52YXIgQ291bnRlclN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvY291bnRlcnN0b3JlJyk7XG5cbnZhciBkID0gbmV3IERpc3BhdGNoZXIoKTtcbnZhciBDb3JlT2JqZWN0cyA9IHtcbiAgZGlzcGF0Y2hlcjogZCwgIFxuICBjb3VudGVyU3RvcmU6IG5ldyBDb3VudGVyU3RvcmUoZCksXG59O1xuXG5SZWFjdERPTS5yZW5kZXIoXG5cdDxBcHBsaWNhdGlvbiBjb3JlPXtDb3JlT2JqZWN0c30gLz4sIFxuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9keUNvbnRhaW5lcicpXG4pO1xuXG4iLCJ2YXIga2V5TWlycm9yID0gcmVxdWlyZSgna2V5bWlycm9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHsgIFxuICBBY3Rpb25UeXBlczoga2V5TWlycm9yKHtcbiAgICBDUkVBVEVfQ09VTlRFUjogbnVsbCxcbiAgICBSRU1PVkVfQ09VTlRFUjogbnVsbCxcbiAgICBDSEFOR0VfQ09VTlQ6IG51bGwsXG4gICAgR0VUX0NPVU5URVJTOiBudWxsLFxuICB9KSxcbiAgUGF5bG9hZFNvdXJjZXM6IGtleU1pcnJvcih7XG4gICAgU0VSVkVSX0FDVElPTjogbnVsbCxcbiAgICBWSUVXX0FDVElPTjogbnVsbFxuICB9KSxcbiB9OyIsIi8qKlxuICogRGVmaW5lcyB0aGUgY2VudHJhbCBkaXNwYXRjaGVyIGNsYXNzLlxuICovXG52YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJ2ZsdXgnKS5EaXNwYXRjaGVyO1xudmFyIGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbnZhciBDb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBOZXdEaXNwYXRjaGVyKCkge1xuICByZXR1cm4gYXNzaWduKG5ldyBEaXNwYXRjaGVyKCksIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gYWN0aW9uIFRoZSBkZXRhaWxzIG9mIHRoZSBhY3Rpb24sIGluY2x1ZGluZyB0aGUgYWN0aW9uJ3NcbiAgICAgKiB0eXBlIGFuZCBhZGRpdGlvbmFsIGRhdGEgY29taW5nIGZyb20gdGhlIHZpZXcuXG4gICAgICovXG4gICAgaGFuZGxlVmlld0FjdGlvbjogZnVuY3Rpb24oZGF0YSwgYWN0aW9uKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoKHtcbiAgICAgICAgc291cmNlOiBDb25zdGFudHMuUGF5bG9hZFNvdXJjZXMuVklFV19BQ1RJT04sXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGhhbmRsZUFQSUFjdGlvbjogZnVuY3Rpb24oZGF0YSwgYWN0aW9uKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoKHtcbiAgICAgICAgc291cmNlOiBDb25zdGFudHMuUGF5bG9hZFNvdXJjZXMuU0VSVkVSX0FDVElPTixcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOZXdEaXNwYXRjaGVyO1xuIiwiLy9UaGlzIG1vZHVsZSBkZWFscyB3aXRoIEFQSSBjYWxscyBvbiBiZWhhbGYgb2Ygc3RvcmVzLlxudmFyIEJQcm9tID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbnZhciBKU09OX01JTUVUWVBFX0ZVTEwgPSAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCc7XG52YXIgSlNPTl9NSU1FVFlQRV9UWVBFID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xudmFyIEFQSV9WRVJTSU9OID0gJ3YxJztcbnZhciBBUElfVVJMX0JBU0UgPSdodHRwOi8vMTI3LjAuMC4xOjMwMDAvYXBpJztcblxuZnVuY3Rpb24gaHR0cCh1cmwsIG1ldGhvZCwgYm9keSkge1xuICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICBtZXRob2QgPSAnR0VUJztcbiAgfVxuXG4gIHJldHVybiBuZXcgQlByb20oZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gbWFrZSBiYXNpYyBvYmplY3RcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KTtcbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUpO1xuICAgIC8vIG9wZW4gaXQgdXAsIHJlYWR5IHRvIHN0YXJ0IHdyaXRpbmcgaGVhZGVyc1xuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsKTtcblxuICAgIC8vIGlmIGJvZHksIHNldCBtaW1ldHlwZVxuICAgIGlmIChib2R5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGRlZmF1bHQgdG8gSlNPTiBtaW1ldHlwZSAgICAgIFxuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsIEpTT05fTUlNRVRZUEVfRlVMTCk7XG4gICAgfVxuXG4gICAgLy8gc2VuZCBvZmYgdGhlIHJlcXVlc3RcbiAgICB4aHIuc2VuZChib2R5KTtcbiAgfSk7XG59XG5mdW5jdGlvbiBwYXJzZUlmSlNPTih4aHIpIHtcbiAgdHJ5IHtcbiAgICB2YXIgY3QgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmIChjdCAhPT0gdW5kZWZpbmVkICYmIGN0ICE9PSBudWxsICYmIGN0LmluZGV4T2YoSlNPTl9NSU1FVFlQRV9UWVBFKSA9PT0gMCl7XG4gICAgICB2YXIgcmV0dXJuT2JqID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgIHJldHVybk9iai5zdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgICAgcmV0dXJuIHJldHVybk9iajtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH1cbiAgfVxuICBjYXRjaChlcnIpIHtcbiAgICBjb25zb2xlLmxvZygnRXJyb3IgcmVjZWl2ZWQnICsgZXJyLm1lc3NhZ2UpO1xuICB9XG59XG5mdW5jdGlvbiBwYXRoSm9pbihhLCBiKSB7XG4gIGlmIChhW2EubGVuZ3RoLTFdICE9PSAnLycpIHtcbiAgICBhICs9ICcvJztcbiAgfVxuICBpZiAoYlswXSA9PT0gJy8nKSB7XG4gICAgYiA9IGIuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGErYjtcbn1cbmZ1bmN0aW9uIGdldEpvaW5lZFBhdGgocGF0aCkge1xuICByZXR1cm4gcGF0aEpvaW4oXG4gICAgcGF0aEpvaW4oQVBJX1VSTF9CQVNFLCBBUElfVkVSU0lPTiksXG4gICAgcGF0aFxuICApO1xufVxuXG52YXIgUmVzb3VyY2UgPSB7ICAgIFxuICBnZXQ6IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgdXJsID0gZ2V0Sm9pbmVkUGF0aChwYXRoKTtcbiAgICAgXG4gICAgLy9odHRwKHVybCwgbWV0aG9kLCBib2R5KVxuICAgIHZhciBwID0gaHR0cCh1cmwsICdHRVQnLCB1bmRlZmluZWQpXG4gICAgICAudGhlbihmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUlmSlNPTihlLnRhcmdldCk7XG4gICAgICB9KTtcblxuICAgIHJldHVybiBwO1xuICB9LFxuXG4gIGNyZWF0ZTogZnVuY3Rpb24ocGF0aCwgZGF0YSkge1xuICAgIHZhciB1cmwgPSBnZXRKb2luZWRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIGpkID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgICB2YXIgcCA9IGh0dHAodXJsLCAnUE9TVCcsIGpkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgeGhyID0gZS50YXJnZXQ7XG5cbiAgICAgICAgLy8gdGhlcmUgd2FzIGFuIGVycm9yXG4gICAgICAgIGlmICh4aHIuc3RhdHVzIDwgMjAwIHx8IHhoci5zdGF0dXMgPiAyOTkpIHtcbiAgICAgICAgICB0aHJvdyB4aHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlSWZKU09OKHhocik7ICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gcDtcbiAgfSwgIFxuICBkZWxldGU6IGZ1bmN0aW9uKHBhdGgsIGRhdGEpIHtcbiAgICB2YXIgdXJsID0gZ2V0Sm9pbmVkUGF0aChwYXRoKTtcblxuICAgIHZhciBqZCA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuXG4gICAgdmFyIHAgPSBodHRwKHVybCwgJ0RFTEVURScsIGpkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgeGhyID0gZS50YXJnZXQ7XG4gICAgICAgIC8vIHRoZXJlIHdhcyBhbiBlcnJvclxuICAgICAgICBpZiAoeGhyLnN0YXR1cyA8IDIwMCB8fCB4aHIuc3RhdHVzID4gMjk5KSB7XG4gICAgICAgICAgdGhyb3cgeGhyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBwYXJzZUlmSlNPTih4aHIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gcDtcbiAgfSwgIFxuXG59O1xubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZTsiLCIvKipcbipOb3RlLCBpbiByZWdhcmRzIHRvIHdoZXRoZXIgdG8gbWFrZSBhc3luYyBjYWxscyB0byBBUElzIHZpYSBzdG9yZXMsXG4qIEkgd291bGQgbm9ybWFsbHkgbWFrZSBhY3Rpb25zIHJlc3BvbnNpYmxlIGZvciBBUEkgY2FsbHMgaW5pdGlhdGVkIGJ5ICBcbiogdmlldyBjb250cm9sbGVyIGNhbGxzLiBPbmNlIGRhdGEgaXMgcmV0cmlldmVkIHRoZSBhcGkgb3IgYWN0aW9uIGxvZ2ljIHdvdWxkIHRoZW4gXG4qIGRpc3BhdGNoIGFuIGV2ZW50IHdpdGggdGhlIHJlc3VsdGluZyBkYXRhIGFzIGEgcGF5bG9hZC5cbiogVGhpcyB3YXkgYW55IHN0b3JlIGNhbiBvcHRpb25hbGx5IGxpc3RlbiB0byB0aGUgZXZlbnQgYW5kIHRoaXMgYXZvaWRzIGNoYWluaW5nXG4qIHN0b3JlIGRlcGVuZGVuY2llcyBpZiB3ZSBjYWxsZWQgdGhlIEFQSSBkaXJlY3RseSBmcm9tIHRoZSBzdG9yZS5cbiogRm9yIHRoaXMgY3V0IGRvd24sIHRlc3QgZXhlcmNpc2UgSSBhbSB1c2luZyB0aGlzIHN0b3JlIHRvIGRvIGFuIGFzeW5jIHJlcXVlc3RcbiogZm9yIHR3byByZWFzb25zIGEpIGl0IGlzIGEgdGVzdCBleGVyY2lzZSBzbyBzY2FsZSBpcyBzbWFsbCBhbmQgd29udCBncm93IGFuZCBcbiogYikgdGhlIGFwaSBkZXNpZ24gcmV0dXJucyBkYXRhIChhbGwgY291bnRlcnMpIG9uIFBPU1QgYW5kIERFTEVURSBhbnl3YXkgc28gd2UgYXJlIFxuKiBzdGlsbCBtYWludGFpbmcgZGF0YSBhbmQgcmVjZWl2aW5nIEFQSSBkYXRhIGluIHN0b3JlIGFzeW5jIGNhbGxzIGVpdGhlciB3YXkgKGZvciBub3cpXG4qL1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbnZhciByZXNvdXJjZSA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL3Jlc291cmNlJyk7XG52YXIgQlByb20gPSByZXF1aXJlKCdibHVlYmlyZCcpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsL2Vycm9yaGFuZGxlcicpO1xudmFyIENvbnN0YW50cyA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2NvbnN0YW50cycpO1xuXG52YXIgQ0hBTkdFX0VWRU5UID0gJ2NoYW5nZSc7XG52YXIgUkVTT1VSQ0VfTkFNRSA9ICdjb3VudGVyJztcblxuZnVuY3Rpb24gTmV3Q291bnRlclN0b3JlKGRpc3BhdGNoZXIpIHtcbiAgdmFyIENvdW50ZXJTdG9yZSA9IGFzc2lnbih7XG4gICAgX2NvdW50ZXJzOiBbXSxcbiAgICBfc2F2ZVBlbmRpbmc6IGZhbHNlLFxuXG4gIH0sIEV2ZW50RW1pdHRlci5wcm90b3R5cGUsIHtcbiAgICBlbWl0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZW1pdChDSEFOR0VfRVZFTlQpO1xuICAgIH0sXG4gICAgYWRkQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICAgIH0sICAgIFxuICAgIHJlbW92ZUNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgICB9LCAgICBcbiAgICBcbiAgICBpc1NhdmVQZW5kaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zYXZlUGVuZGluZztcbiAgICB9LFxuICAgIGdldENvdW50ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb3VudGVycztcbiAgICB9LFxuICAgIF9yZW1vdmVDb3VudGVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLl9zYXZlUGVuZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBwID0gcmVzb3VyY2UuZGVsZXRlKFJFU09VUkNFX05BTUUsIGRhdGEpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNvdW50ZXJzKSB7XG4gICAgICAgICAgc2VsZi5fY291bnRlcnMgPSBjb3VudGVyczsgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvclhIUikge1xuICAgICAgICAgIHV0aWwuaGFuZGxlQVBJRXJyb3IoZXJyb3JYSFIpO1xuICAgICAgICB9KVxuICAgICAgICAuZmluYWxseShmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLl9zYXZlUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgIENvdW50ZXJTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICAgIH0pOyBcbiAgICB9LFxuICAgIF9nZXRDb3VudGVyczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLl9zYXZlUGVuZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBwID0gcmVzb3VyY2UuZ2V0KFwiY291bnRlcnNcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY291bnRlcnMpIHtcbiAgICAgICAgICBzZWxmLl9jb3VudGVycyA9IGNvdW50ZXJzO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3JYSFIpIHtcbiAgICAgICAgICB1dGlsLmhhbmRsZUFQSUVycm9yKGVycm9yWEhSKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5fc2F2ZVBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBDb3VudGVyU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgICB9KTsgICAgICBcbiAgICB9LFxuICAgIF9jcmVhdGVDb3VudGVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLl9zYXZlUGVuZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBwID0gcmVzb3VyY2UuY3JlYXRlKFJFU09VUkNFX05BTUUsIGRhdGEpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNvdW50ZXJzKSB7XG4gICAgICAgICAgc2VsZi5fY291bnRlcnMgPSBjb3VudGVycztcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yWEhSKSB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVBUElFcnJvcihlcnJvclhIUik7XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX3NhdmVQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgQ291bnRlclN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBfY2hhbmdlQ291bnQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuX3NhdmVQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBwYXRoID0gUkVTT1VSQ0VfTkFNRSArICcvZGVjJztcbiAgICAgIGlmIChkYXRhLmluY3JlbWVudCkge1xuICAgICAgICBwYXRoID0gUkVTT1VSQ0VfTkFNRSArICcvaW5jJztcbiAgICAgIH0gXG4gICAgICBcbiAgICAgIHZhciBwID0gcmVzb3VyY2UuY3JlYXRlKHBhdGgsIGRhdGEpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNvdW50ZXJzKSB7XG4gICAgICAgICAgc2VsZi5fY291bnRlcnMgPSBjb3VudGVycztcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yWEhSKSB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVBUElFcnJvcihlcnJvclhIUik7XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX3NhdmVQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgQ291bnRlclN0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgfSk7IFxuICBDb3VudGVyU3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkgeyAgICBcbiAgICBzd2l0Y2gocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgIC8vQWRkIGEgbmFtZWQgY291bnRlciB0byBhIGxpc3Qgb2YgY291bnRlcnNcbiAgICAgIGNhc2UgQ29uc3RhbnRzLkFjdGlvblR5cGVzLkNSRUFURV9DT1VOVEVSOlxuICAgICAgICByZXR1cm4gQ291bnRlclN0b3JlLl9jcmVhdGVDb3VudGVyKHBheWxvYWQuZGF0YSk7XG5cbiAgICAgIC8vRGVsZXRlIGEgY291bnRlclxuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9uVHlwZXMuUkVNT1ZFX0NPVU5URVI6XG4gICAgICAgIHJldHVybiBDb3VudGVyU3RvcmUuX3JlbW92ZUNvdW50ZXIocGF5bG9hZC5kYXRhKTtcblxuICAgICAgLy9JbmNyZW1lbnQgYW55IG9mIHRoZSBjb3VudGVyc1xuICAgICAgLy9EZWNyZW1lbnQgYW55IG9mIHRoZSBjb3VudGVyc1xuICAgICAgY2FzZSBDb25zdGFudHMuQWN0aW9uVHlwZXMuQ0hBTkdFX0NPVU5UOlxuICAgICAgICByZXR1cm4gQ291bnRlclN0b3JlLl9jaGFuZ2VDb3VudChwYXlsb2FkLmRhdGEpO1xuXG4gICAgICBjYXNlIENvbnN0YW50cy5BY3Rpb25UeXBlcy5HRVRfQ09VTlRFUlM6XG4gICAgICAgIHJldHVybiBDb3VudGVyU3RvcmUuX2dldENvdW50ZXJzKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIENvdW50ZXJTdG9yZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOZXdDb3VudGVyU3RvcmU7IiwidmFyIEVycm9ySGFuZGxlciA9IHtcblx0aGFuZGxlQVBJRXJyb3I6IGZ1bmN0aW9uKGVyclhIUikge1xuXHRcdHZhciBmRXJyb3IgPSBKU09OLnN0cmluZ2lmeShlcnJYSFIsIG51bGwsIDQpO1xuXHQgIGNvbnNvbGUubG9nKCchRXJyb3IgZW5jb3VudGVyZWQ6ICcgKyBmRXJyb3IpO1xuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFcnJvckhhbmRsZXI7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
