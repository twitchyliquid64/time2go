(function () {


	var logMsgs = [[0,"System started."]];
	var startTime = Date.now();

	angular.module('baseApp')
		.factory('logger', function() {
		return { 
			log: function(msg){
				logMsgs[logMsgs.length] = [Date.now() - startTime, msg];
				console.log(msg);
			},
			logMsgs: logMsgs
		};
	 });
 
 
 })();
