//Component used to call view controller components based on local route (URL).

var director = require('director');
var Counter = require('./counter');
var React = require('react');

var Application = React.createClass({
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
      return <span/>;
    }
    return (
      <Page core={this.props.core}/>
    );
  }
});

module.exports = Application;
