# Indeed Scraper

### What is it?
- API that allows flexible job searching.
- Uses Node.js for server-side operations.
- Uses Promises to handle asynchronous control flow.

### Why use it?
- Allows your web app to get job posting data from Indeed.
- You don't have to deal with Indeed's cluttered interface.

### How to use it?
- Good question! I'll get to that once testing is done.
```javascript
var IndeedService = require('../indeed-service.js')();

IndeedService.query('Javascript', 'Toronto', '100')
.then(function(data) {
    // Do something with data ...
    console.log(data.jobList);

})
.catch(function(err) {
    console.log('Error: ' + err);
});
```