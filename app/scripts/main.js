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
	<Application core={CoreObjects} />, 
	document.getElementById('bodyContainer')
);

