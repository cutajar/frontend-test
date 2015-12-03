var React = require("react");

var Spinner = React.createClass({
  propTypes: {
    spin: React.PropTypes.bool.isRequired,
  },  
  render: function() {    
    if (this.props.spin) {
      return (<img src="../../images/sp.gif"></img>);
    } else {
      return (<span></span>);
    }
  }
});

module.exports = Spinner;
