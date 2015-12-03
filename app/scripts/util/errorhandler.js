var ErrorHandler = {
	handleAPIError: function(errXHR) {
		var fError = JSON.stringify(errXHR, null, 4);
	  console.log('!Error encountered: ' + fError);
	},
};

module.exports = ErrorHandler;
