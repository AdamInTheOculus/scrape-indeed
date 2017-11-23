/* 
    Author: Adam Sinclair
    Date: January 24th 2017
    Purpose: 
        This file serves as the custom utility library.
        For now, any "random" utility method will be stored
        in this object. If I notice there are common methods being
        stored, I will write a separate library with related methods.
*/

var https = require('https');
var utility = {

    // Makes an HTTPS call to whatever host/path is specified.
    // Uses promises to allow easy asynchronous control flow.
    // Returns a resolved object with received data.
    // Returns a reject object with error message.
    getHTTPS: function(host, queryString) {
        return new Promise(function(resolve, reject) {

            if(host === undefined || host === null) {
                reject(new Error('_util.getHTTPS() -- `host` is undefined or null.'));
                return;
            } else if(queryString === undefined || queryString === null) {
                queryString = '';
            }

            // Request options
            var get_options = {
                host: host,
                path: queryString,
                method: 'GET',
            };

            var req = https.get(get_options, function(res) {

                var dataChunk = '';

                // When data is received
                res.on('data', function(chunk) {
                    dataChunk += chunk;
                });

                // When there is an error
                res.on('error', function(err) {
                    reject(new Error('_util.getHTTPS() -- ' + err));
                });

                // When the response is completed
                res.on('end', function() {
                    resolve(dataChunk);
                });
            });

            // Submit the request
            req.end();
        });
    }
};

module.exports = utility;