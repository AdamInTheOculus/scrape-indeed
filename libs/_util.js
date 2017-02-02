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
    getHTTPS: function(host, path) {
        return new Promise(function(resolve, reject) {
            // Request options
            var get_options = {
                host: host,
                path: path,
                method: 'GET',
            };

            console.log('Full URL: ' + host + path);

            var req = https.get(get_options, function(res) {

                var dataChunk = '';

                // When data is received
                res.on('data', function(chunk) {
                    dataChunk += chunk;
                });

                // When there is an error
                res.on('error', function(err) {
                    console.log('CRITICAL -- getHTTPS error: ' + err);
                    reject(new Error(err));
                });

                // When the response is completed
                res.on('end', function() {
                    console.log('<!-- =============== Attempting HTTPS call! =============== -->');
                    console.log('<!-- Got response: ' + res.statusCode + '-->');
                    console.log('<!-- Data size: ' + dataChunk.length + '-->');
                    console.log('<!-- =============== Successful HTTPS call! =============== -->');
                    resolve(dataChunk);
                });
            });

            // Submit the request
            req.end();
        });
    }
};

module.exports = utility;