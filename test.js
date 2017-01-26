
var IndeedService = require('./indeed-service.js')();

IndeedService.query('Javascript', 'Toronto', '50')
.then(function(data) {
	// Do something with data ...
	console.log('Initial query ad index: ' + IndeedService.parameters.adIndex);

	IndeedService.nextPage()
	.then(function(data) {
		// Do something with new data ...
		console.log('Second query ad index: ' + IndeedService.parameters.adIndex);

		IndeedService.nextPage()
		.then(function(data) {
			// Do something with new data ...
			console.log('Third query ad index: ' + IndeedService.parameters.adIndex);
		})
		.catch(function(err) {
			console.log('Error!' + '\n' + err);
		});
	})
	.catch(function(err) {
		console.log('Error!' + '\n' + err);
	});
})
.catch(function(err) {
	console.log('Error!' + '\n' + err);
});
