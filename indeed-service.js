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

                switch(options.country) {
                    case "Argentina": return _util.getHTTPS('ar.indeed.com', '/jobs'+queryString); break;
                    case "Australia": return _util.getHTTPS('au.indeed.com', '/jobs'+queryString); break;
                    case "Austria": return _util.getHTTPS('at.indeed.com', '/jobs'+queryString); break;
                    case "Bahrain": return _util.getHTTPS('bh.indeed.com', '/jobs'+queryString); break;
                    case "Belgium": return _util.getHTTPS('be.indeed.com', '/jobs'+queryString); break;
                    case "Brazil": return _util.getHTTPS('indeed.com.br', '/jobs'+queryString); break;
                    case "Canada": return _util.getHTTPS('ca.indeed.com', '/jobs'+queryString);  break;
                    case "Chile": return _util.getHTTPS('indeed.com.cl', '/jobs'+queryString); break;
                    case "China": return _util.getHTTPS('cn.indeed.com', '/jobs'+queryString); break;
                    case "Columbia": return _util.getHTTPS('co.indeed.com', '/jobs'+queryString); break;
                    case "Costa Rica": return _util.getHTTPS('cr.indeed.com', '/jobs'+queryString); break;
                    case "Czech Republic": return _util.getHTTPS('cz.indeed.com', '/jobs'+queryString); break;
                    case "Denmark": return _util.getHTTPS('dk.indeed.com', '/jobs'+queryString); break;
                    case "Ecuador": return _util.getHTTPS('ec.indeed.com', '/jobs'+queryString); break;
                    case "Egypt": return _util.getHTTPS('eg.indeed.com', '/jobs'+queryString); break;
                    case "Finland": return _util.getHTTPS('www.indeed.fi', '/jobs'+queryString); break;
                    case "France": return _util.getHTTPS('www.indeed.fr', '/jobs'+queryString); break;
                    case "Germany": return _util.getHTTPS('de.indeed.com', '/jobs'+queryString); break;
                    case "Romania": return _util.getHTTPS('ro.indeed.com', '/jobs'+queryString); break;
                    case "USA": return _util.getHTTPS('www.indeed.com', '/jobs'+queryString); break;
                    default: return _util.getHTTPS('www.indeed.com', '/jobs'+queryString);
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
                let currentErr = '[!] IndeedService.query()';
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

                console.log('Country: ' + options.country);
                switch(options.country) {
                    case "Argentina": return _util.getHTTPS('ar.indeed.com/jobs', queryString); break;
                    case "Australia": return _util.getHTTPS('au.indeed.com/jobs', queryString); break;
                    case "Austria": return _util.getHTTPS('at.indeed.com/jobs', queryString); break;
                    case "Bahrain": return _util.getHTTPS('bh.indeed.com/jobs', queryString); break;
                    case "Belgium": return _util.getHTTPS('be.indeed.com/jobs', queryString); break;
                    case "Brazil": return _util.getHTTPS('indeed.com.br/jobs', queryString); break;
                    case "Canada": return _util.getHTTPS('ca.indeed.com/jobs', queryString);  break;
                    case "Chile": return _util.getHTTPS('indeed.com.cl/jobs', queryString); break;
                    case "China": return _util.getHTTPS('cn.indeed.com/jobs', queryString); break;
                    case "Columbia": return _util.getHTTPS('co.indeed.com/jobs', queryString); break;
                    case "Costa Rica": return _util.getHTTPS('cr.indeed.com/jobs', queryString); break;
                    case "Czech Republic": return _util.getHTTPS('cz.indeed.com/jobs', queryString); break;
                    case "Denmark": return _util.getHTTPS('dk.indeed.com/jobs', queryString); break;
                    case "Ecuador": return _util.getHTTPS('ec.indeed.com/jobs', queryString); break;
                    case "Egypt": return _util.getHTTPS('eg.indeed.com/jobs', queryString); break;
                    case "Finland": return _util.getHTTPS('www.indeed.fi/jobs', queryString); break;
                    case "France": return _util.getHTTPS('www.indeed.fr/emplois', queryString); break;
                    case "Germany": return _util.getHTTPS('de.indeed.com/jobs', queryString); break;
                    case "Romania": return _util.getHTTPS('ro.indeed.com/jobs', queryString); break;
                    case "USA": console.log('Actually America ...\n');    return _util.getHTTPS('www.indeed.com/jobs', queryString); break;
                    default: return _util.getHTTPS('www.indeed.com/jobs', queryString);
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

            // Regular expresson to detect any whitespace character
            let ws_regex = /\s+/g;

            // For each property in the object, if it's defined then add to `queryString`.
            optionProperties.forEach(function(property) {

                itemsProcessed++;

                switch(property) {
                    case 'title': queryString += '?q='      + options[property].toString().replace(ws_regex, '+'); break;
                    case 'location': queryString += '&l='   + options[property].toString().replace(ws_regex, '+'); break;
                    case 'radius': queryString += '&r='     + options[property].toString().replace(ws_regex, '+'); break;
                    case 'jobType': queryString += '&jt='   + options[property].toString().replace(ws_regex, '+'); break;
                    case 'count': queryString += '&limit='  + options[property].toString().replace(ws_regex, '+'); break;
                    case 'country': break;

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
            // _this.data.salaryList = _getJobListByCriteria($, '#SALARY_rbo');
            // _this.data.jobTypeList = _getJobListByCriteria($, '#JOB_TYPE_rbo');
            // _this.data.locationList = _getJobListByCriteria($, '#LOCATION_rbo');
            // _this.data.companyList = _getJobListByCriteria($, '#COMPANY_rbo');
            // _this.data.titleList = _getJobListByCriteria($, '#TITLE_rbo');

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
                    // TODO: Could be a US job. Don't hard code `ca.indeed.com`
                    let aTag = $(element).find('a');
                    jobDetails.href = 'ca.indeed.com' + aTag.attr('href');
                    jobDetails.title = aTag.attr('title');

                    // Is ad sponsored?
                    let sponsor = $(element).find('span.sponsoredGray');
                    let isSponsored = false;
                    ((sponsor.text() === 'Sponsored') ? isSponsored = true : isSponsored = false);
                    jobDetails.isSponsored = isSponsored;

                    // Some ad details have different class names if they're sponsored.
                    // Why? I have no idea ... but it was a pain in the ass figuring it out.
                    let company, location, salary, summary, datePosted;
                    if(isSponsored) {

                        let sponsoredDiv = $(element).find('div.sjcl');

                        // Company name
                        company = sponsoredDiv.find('span.company').text();
                        jobDetails.company = ((company.length > 1) ? company.trim() : '');

                        // Job location
                        location = sponsoredDiv.find('div.location').text();
                        jobDetails.location = ((location.length > 1) ? location.trim() : '');

                        // Job salary
                        salary = $(element).find('span.salaryText').text();
                        jobDetails.salary = ((salary.length > 1) ? salary.trim() : '');

                        // Job summary
                        summary = $(element).find('div.summary ul li').text();
                        jobDetails.summary = ((summary.length > 1) ? summary.trim() : '');

                    } else {

                        // Company name
                        let company = $(element).find('span.company').text();
                        jobDetails.company = ((company.length > 1) ? company.trim() : '');

                        // Job location
                        location = $(element).find("span.location").text();
                        jobDetails.location = ((location.length > 1) ? location.trim() : '');

                        // Job salary
                        salary = $(element).find('span.salaryText').text();
                        jobDetails.salary = ((salary.length > 1) ? salary.trim() : '');

                        // Job summary
                        summary = $(element).find('div.summary ul li').text();
                        jobDetails.summary = ((summary.length > 1) ? summary.trim() : '');

                        // Job post date
                        datePosted = $(element).find('span.date ').text();
                        jobDetails.datePosted = ((datePosted.length > 1) ? datePosted.trim() : '');
                    }

                    list.push(jobDetails);
                });

                resolve(list);

            } // end of else
        }); // end of Promise
    }; // close _getFeaturedJobs()

    return this;
}; // close module.exports = function indeedService(options);
