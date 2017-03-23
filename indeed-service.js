/* 
    Author: Adam Sinclair
    Date: January 4th 2017
    Purpose: 
        HTTPS request to Indeed.com
        Returns HTML code from a specific search term.
        I want to see the HTML returned and if it'll be easy to scrape each job posting.
        I'll need to research each job posting and recognize a pattern to display results.
        Then I can write an app that enables users to search for jobs across Indeed and
        hopefully other job search-engines.
*/

const _util = require('./libs/_util.js'),
    cheerio = require('cheerio')
;

exports = module.exports = function IndeedService() {

    const _this = this;

    // In order for us to recursively call IndeedService.nextPage(), we need to 
    // keep track of the required parameters. 
    let previousQuery = '',
        jobIndex = 0,
        options = {}
    ;

    this.data = {
        salaryList: [],
        jobTypeList: [],
        locationList: [],
        companyList: [],
        titleList: [],
        jobList: []
    }; // close data

    this.query = function(options) {
        return new Promise(function(resolve, reject) {

            // Validate parameter before continuing.
            if(options === null || options === undefined) {
                reject(new Error('Inside IndeedService.query() -- `options` is ' +options+ '.'));
                return;
            }

            _this.options = options;
            console.log('[*] Starting search query ...');
            _buildQueryString(options).then(function(queryString) {

                // Are we using a new query from last time?
                // Reset current job index and previous query.
                // This helps with pagination and prevents users from seeing the same jobs.
                if(queryString !== _this.previousQuery) {
                    _this.jobIndex = 0;
                    _this.previousQuery = queryString;
                } else {
                    _this.jobIndex += 10;
                }

                // Determine if we're searching Canada or USA.
                // TODO: Add support for more countries
                if(options.searchCanada == 'true') {
                    return _util.getHTTPS('ca.indeed.com', '/jobs', queryString + '&start=' + _this.jobIndex);
                } else {
                    return _util.getHTTPS('www.indeed.com', '/jobs', queryString + '&start=' + _this.jobIndex);
                }
            })
            .then(function(htmlResponse) {
                return _scrapeHTML(htmlResponse);
            }).then(function($) {
                return _getFeaturedJobs($);
            })
            .then(function(list) {
                _this.data.jobList = list;
                resolve(_this.data);
            }).catch(function(err) {
                let currentErr = 'Inside IndeedService.query() -- ';
                reject(new Error(currentErr + '\n' + err));
            });

        }); // close Promise()      
    }; // close this.query()

    this.nextPage = function() {
        return new Promise(function(resolve, reject) {
            _this.query(_this.options).then(function(data) {
                resolve(data);
            })
            .catch(function(err) {
                let currentErr = 'Inside IndeedService.nextPage() --';
                reject(new Error(currentErr + '\n' + err));
            })
        });
    };

    this.printAllLists = function() {
        for(list in _this.data) {
            if(typeof(_this.data[list]) === 'object') {
                _formattedPrint(_this.data[list], list);
            }
        }
    }; // close printAllData

    this.getFullHTML = function(options) {
        return new Promise(function(resolve, reject) {

            // Validate parameter before continuing.
            if(options === null || options === undefined) {
                reject(new Error('Inside IndeedService.query() -- `options` is ' +options+ '.'));
                return;
            }

            _buildQueryString(options).then(function(queryString) {
                if(options.searchCanada) {
                    return _util.getHTTPS('ca.indeed.com', '/jobs', queryString);
                } else {
                    return _util.getHTTPS('www.indeed.com', '/jobs', queryString);
                }
            })
            .then(function(htmlResponse) {
                resolve(htmlResponse);
            })
            .catch(function(err) {
                let currentErr = 'Inside IndeedService.getFullHTML() --';
                reject(new Error(currentErr + '\n' + err));
            });
        }); // close Promise
    }; // close getFullHTML

// -----------------------------------------------------------
// ---------------- UTILITY FUNCTIONS FOR API ----------------
// -----------------------------------------------------------

    const _buildQueryString = function(options) {
        return new Promise(function(resolve, reject) {

            // If any options fail, reject with an error and return.
            if(options === null) {
                reject(new Error('_buildQueryString() - `options` parameter is null.')); return;
            } else if(typeof(options) !== 'object') {
                reject(new Error('_buildQueryString() - `options` parameter is null.')); return;
            } else if(options.title === null || options.title.length < 1) {
                reject(new Error('_buildQueryString() - `options.title` parameter is required.')); return;
            } else if(options.location === null || options.location.length < 1) {
                reject(new Error('_buildQueryString() - `options.location` parameter is required.')); return;
            }

            let queryString = '',
                itemsProcessed = 0,
                optionProperties = Object.keys(options)
            ;

            // For each property in the object, if it's defined then add to `queryString`.
            optionProperties.forEach(function(property) {

                itemsProcessed++;

                switch(property) {
                    case 'title': queryString += '?q='      + options[property]; break;
                    case 'location': queryString += '&l='   + options[property]; break;
                    case 'radius': queryString += '&r='     + options[property]; break;
                    case 'jobType': queryString += '&jt='   + options[property]; break;
                    case 'searchCanada': break; // 
                    default: console.log(`[!] Warning: Property [${property}] not supported.`);
                } // close switch

                if(itemsProcessed === optionProperties.length) {
                    resolve(queryString);
                    return;
                }
            }); // close Object.keys
        }); // close Promise
    }; // close _buildQueryString;

    const _scrapeHTML = function(htmlResponse) {
        return new Promise(function(resolve, reject) {

            // Load out HTML into a jQuery-like variable
            let $ = cheerio.load(htmlResponse);

            // Get title/href of related jobs, sorted by criteria
            _this.data.featuredAdCount = _getFeaturedJobCount($);
            _this.data.salaryList = _getJobListByCriteria($, '#SALARY_rbo');
            _this.data.jobTypeList = _getJobListByCriteria($, '#JOB_TYPE_rbo');
            _this.data.locationList = _getJobListByCriteria($, '#LOCATION_rbo');
            _this.data.companyList = _getJobListByCriteria($, '#COMPANY_rbo');
            _this.data.titleList = _getJobListByCriteria($, '#TITLE_rbo');

            resolve($);
        });
    };

    const _formattedPrint = function(itemToPrint, itemName) {
        console.log('----------------- '+itemName+' -----------------');
        console.log(itemToPrint);
        console.log('-------------------------------------------------');
    };

    const _getJobListByCriteria = function($, criteria) {
        // Iterate through all 'criteria' postings.
        // Gather up all <a> tag texts and hrefs.
        // This provides us with external links to other related jobs in close proximity.
        let list = [];
        $(criteria).find('a').each(function(index, element) {
            var jobDetails = {};
            jobDetails.text = $(element).attr('title');
            jobDetails.href = $(element).attr('href');
            list.push(jobDetails);
        }); 
        return list;
    };

    const _getFeaturedJobCount = function($) {
        let searchCount = 0;
        let countString = $('#searchCount').text();

        // countString returns 'x jobs out of y'
        // x is the number shown on single page.
        // y is total number of jobs found from search.
        // +3 because 'of ' is three characters and we want the index of y.
        return (countString.slice(countString.lastIndexOf('of ') + 3));
    };

    const _getFeaturedJobs = function($) {
        return new Promise(function(resolve, reject) {

            if($ === undefined) {
                let currentErr = 'Inside _getFeaturedJobs() - '
                reject(new Error(currentErr + '`$` is undefined.'));
            } else {

                let list = [];

                $('div.row.result').each(function(i, element) {
                    let jobDetails = {};

                    // Get job title and href to ad details
                    let aTag = $(element).find('a');
                    jobDetails.href = 'ca.indeed.com' + aTag.attr('href');
                    jobDetails.title = aTag.attr('title');

                    // Is ad sponsored?
                    let sponsor = $(element).find('span.sdn');
                    let isSponsored = false;
                    ((sponsor.text() === 'Sponsored') ? isSponsored = true : isSponsored = false);
                    jobDetails.isSponsored = isSponsored;

                    // Some ad details have different class names if they're sponsored.
                    // Why? I have no idea ... but it was a pain in the ass figuring it out.
                    let company, location, salary, summary, datePosted;
                    if(isSponsored) {

                        let sponsoredDiv = $(element).find('div.sjcl');
                        let tableData = $(element).find('table tr td span.summary');

                        // Company name
                        company = sponsoredDiv.find('span.company').text();
                        jobDetails.company = ((company.length > 1) ? company.trim() : 'N/A');

                        // Job location
                        location = sponsoredDiv.find('span.location').text();
                        jobDetails.location = ((location.length > 1) ? location.trim() : 'N/A/');

                        // Job salary
                        salary = $(sponsoredDiv).find('div').text();
                        jobDetails.salary = ((salary.length > 1) ? salary.trim() : 'N/A');

                        // Job summary
                        summary = tableData.text();
                        jobDetails.summary = ((summary.length > 1) ? summary.trim() : 'N/A');

                    } else {

                        // Company name
                        let companySpan = $(element).find('span.company');
                        company = companySpan.find('span').text();
                        jobDetails.company = ((company.length > 1) ? company.trim() : 'N/A');

                        // Job location
                        location = $(element).find("span[itemprop='addressLocality']").text();
                        jobDetails.location = ((location.length > 1) ? location.trim() : 'N/A');

                        let tableData = $(element).find('table tr td');

                        // Job salary
                        salary = $(tableData).find('nobr').text();
                        jobDetails.salary = ((salary.length > 1) ? salary.trim() : 'N/A');

                        // Job summary
                        summary = $(tableData).find('span.summary').text();
                        jobDetails.summary = ((summary.length > 1) ? summary.trim() : 'N/A');

                        // Job post date
                        datePosted = $(tableData).find('span.date').text();
                        jobDetails.datePosted = ((datePosted.length > 1) ? datePosted.trim() : 'N/A');
                    }

                    list.push(jobDetails);
                });

                resolve(list);

            } // end of else
        }); // end of Promise
    }; // close _getFeaturedJobs()

    return this;
}; // close module.exports = function indeedService(options);
