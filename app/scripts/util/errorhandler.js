// Not a react component, hence no in components or error.js in components folder
var ErrorHandler = {
	handleAPIError: function(errXHR) {
		var fError = JSON.stringify(errXHR, null, 4);
	  console.log('!Error encountered: ' + fError);
	},
};

module.exports = ErrorHandler;
