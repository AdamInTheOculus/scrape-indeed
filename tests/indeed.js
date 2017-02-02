var IndeedService = require('../indeed-service.js')();

IndeedService.query('Javascript', 'Toronto', '100')
.then(function(data) {
	// Do something with data ...
	console.log(data.adList);

})
.catch(function(err) {
	console.log('Error: ' + err);
});
