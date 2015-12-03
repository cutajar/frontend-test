var React = require("react");

var ErrorPanel = React.createClass({
   propTypes: {
    message: React.PropTypes.string.isRequired,
  },
  render: function() {
    window.scrollTo(0,0);
    if (this.props.message !== undefined) {
      return (        
        <div id="error" className="alert alert-danger">
          {this.props.message}
        </div>
      );    
    } else {
      return null;
    }    
  }
});
module.exports = ErrorPanel;