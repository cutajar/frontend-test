var React = require("react");
var lod = require("lodash");
var Spinner = require('./spinner');
var CounterActionCreator = require('../actions/counteractionscreator');

var Counter = React.createClass({
	propTypes: {
		core: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return {
			counters: undefined,
			waiting: false,
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
		var countersComponent  = (<span/>);
		if (this.state.counters !== undefined) {
			countersComponent = (
				<Counters counters={this.state.counters} 
					incrementClick={this.incrementClick}
					decrementClick={this.decrementClick} 
					removeCounterClick={this.removeCounterClick}/>
			);
		}

		return (
			<div className="container">
				<div className="row">
					<div className="col-xs-12 col-md-6 counter-background">
						<h2>Counter Test - Daniel Cutajar</h2>						
						{countersComponent}				
						<CounterTotal count={this.getTotalCount()} />
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12 col-md-6 counter-background">
						<AddCounterForm disable={this.state.waiting} handleAddCounter={this.handleAddCounter} 
							titleChange={this.titleChange} title={this.state.newTitle}/>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-12 col-md-6 counter-change-container last-spacer">
						<Spinner spin={this.state.waiting}/>
					</div>
				</div>
			</div>
		);
	},
});

var Counters = React.createClass({
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
  			<li className="list-group-item" key={"key" + counter.id}>
  				<span className="counter-change-container">
  					<button data-counter-id={counter.id} className="btn btn-info counter-change-btn" 
  						onClick={self.props.incrementClick} aria-label="Increment">
  						<span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
	  				</button>
	  				<button className="btn btn-info left-margin" data-counter-id={counter.id}
	  					onClick={self.props.decrementClick} aria-label="Increment">
	  					<span className="glyphicon glyphicon-minus" aria-hidden="true"></span>
	  				</button>
	  				<button className="btn btn-info left-margin" data-counter-id={counter.id}
	  					onClick={self.props.removeCounterClick} aria-label="Increment">
	  					<span className="glyphicon glyphicon-remove-circle icon-large" aria-hidden="true"></span>
	  				</button>
  				</span>  				
  				
  				<h4>
  					<span className="label label-default label-as-badge">{counter.count}</span>
  					&nbsp;
  					{counter.title}
  				</h4>
  			</li>
  		);
  	};

  	if (this.props.counters.length === 0) {
			return (
	  		<h3>Add a counter below.</h3>
	  	);
  	} else {
  		return (
	  		<ul className="list-group">
	  			{lod.map(this.props.counters, displayCounter)}
	  		</ul>
	  	);	
  	}  	
  }, 
});

var CounterTotal = React.createClass({
	propTypes: {
    count: React.PropTypes.number.isRequired,
  },
  render: function() {
  	return (
  		<h3>
  			Total: {this.props.count}
  		</h3>
  	);
  },
});

var AddCounterForm = React.createClass({
	propTypes: {
    disable: React.PropTypes.bool.isRequired,
    handleAddCounter: React.PropTypes.func.isRequired,
    titleChange: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
  render: function() {
  	return (
  		<div className="counter-form-container">
	  		<form role="form" 
	  			className="form-inline" onSubmit={this.props.handleAddCounter}>
		  		<CounterNameInput onChange={this.props.titleChange} 
		  			title={this.props.title} 
		  			titleChange={this.props.titleChange}/>
		  		<AddCounterBtn  disable={this.props.disable}/>
	  		</form>	  		
	  	</div>
  	);
  },
});

var CounterNameInput = React.createClass({
	propTypes: {
    titleChange: React.PropTypes.func.isRequired,
    title: React.PropTypes.string.isRequired,
  },
	render: function() {
		return (
			<div className="form-group">
				<label htmlFor="addNewCounterInput">Add A Counter:&nbsp;
				</label>
				<input id="addNewCounterInput" 
					type="text" className="form-control" placeholder="Enter counter title" 
					onChange={this.props.titleChange} value={this.props.title}/>
			</div>
		);		
	},
});

var AddCounterBtn = React.createClass({
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
  			<button type="submit" className="btn btn-primary" disabled>Save
		  	</button>
	  	);  		
  	} else {
  		return (  		
  			<button type="submit" className="btn btn-primary">Save
		  	</button>
	  	);  		
  	}
  }
});

module.exports = Counter;