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
                headers: {
                    'Content-Security-Policy': 'default-src *; connect-src \'self\' static.licdn.com media.licdn.com static-exp1.licdn.com static-exp2.licdn.com media-exp1.licdn.com media-exp2.licdn.com https://media-src.linkedin.com/media/ www.linkedin.com s.c.lnkd.licdn.com m.c.lnkd.licdn.com s.c.exp1.licdn.com s.c.exp2.licdn.com m.c.exp1.licdn.com m.c.exp2.licdn.com wss://*.linkedin.com dms.licdn.com; img-src data: blob: *; font-src data: *; style-src \'unsafe-inline\' \'self\' static-src.linkedin.com *.licdn.com; script-src \'report-sample\' \'unsafe-inline\' \'unsafe-eval\' \'self\' platform.linkedin.com spdy.linkedin.com static-src.linkedin.com *.ads.linkedin.com *.licdn.com static.chartbeat.com www.google-analytics.com ssl.google-analytics.com bcvipva02.rightnowtech.com www.bizographics.com sjs.bizographics.com js.bizographics.com d.la4-c1-was.salesforceliveagent.com slideshare.www.linkedin.com; object-src \'none\'; media-src blob: *; child-src blob: lnkd-communities: voyager: *; frame-ancestors \'self\'; report-uri https://www.linkedin.com/lite/contentsecurity?f=l',
                    'Content-Type': 'text/html; charset=utf-8',
                    'Transfer-Encoding': 'chunked'
                }
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
