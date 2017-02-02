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

var _util = require('./libs/_util.js'),
	cheerio = require('cheerio'),
	extend = require('extend')
;

exports = module.exports = function IndeedService(options) {

	var _this = this;

	this.parameters = {
		title: '',
		location: '',
		radius: '',
		adIndex: 0
	};

	this.data = {
		salaryList: [],
		jobTypeList: [],
		locationList: [],
		companyList: [],
		titleList: [],
		jobList: []
	}; // close data

	this.query = function(jobTitle, location, radius, startingAd) {

		// If `startingAd` is undefined, we'll get the first page of results.
		// Otherwise we specify our starting point.
		if(startingAd === undefined) {
			startString = '';
		} else {
			startString = '&start=' +startingAd;
		}

		return new Promise(function(resolve, reject) {
			_util.getHTTPS('ca.indeed.com', '/jobs?q=' +jobTitle+ '&l=' +location+ '&radius=' + radius + startString)
			.then(function(htmlResponse) {

				// Store parameter data.
				// This is needed if the user wants to view "Next Page"
				_this.parameters.title = jobTitle;
				_this.parameters.location = location;
				_this.parameters.radius = radius;
				_this.parameters.adIndex += 10;

				// Load out HTML into a jQuery-like variable
				var $ = cheerio.load(htmlResponse);

				// Get title/href of related jobs, sorted by criteria
				_this.data.featuredAdCount = _getFeaturedJobCount($);
				_this.data.salaryList = _getJobListByCriteria($, '#SALARY_rbo');
				_this.data.jobTypeList = _getJobListByCriteria($, '#JOB_TYPE_rbo');
				_this.data.locationList = _getJobListByCriteria($, '#LOCATION_rbo');
				_this.data.companyList = _getJobListByCriteria($, '#COMPANY_rbo');
				_this.data.titleList = _getJobListByCriteria($, '#TITLE_rbo');

				// Get featured & sponsored jobs from current page
				_getFeaturedJobs($)
				.then(function(list) {
					console.log('Successfully gathered up ads!');
					_this.data.jobList = list;
				})
				.catch(function(err) {
					console.log('No deal!' + err);
					var currentErr = 'Inside IndeedService.query() -- ';
					reject(new Error(currentErr + '\n' + err));
				})

				resolve(_this.data);

			}).catch(function(err) {
				var currentErr = 'Inside IndeedService.query() -- ';
				reject(new Error(currentErr + '\n' + err));
			});
		}); // close Promise()		
	}; // close this.query()

	this.nextPage = function() {
		return new Promise(function(resolve, reject) {
			_this.query(_this.parameters.title, _this.parameters.location, _this.parameters.radius, _this.parameters.adIndex)
			.then(function(data) {
				resolve(data);
			})
			.catch(function(err) {
				var currentErr = 'Inside IndeedService.nextPage() --';
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

// -----------------------------------------------------------
// ---------------- UTILITY FUNCTIONS FOR API ----------------
// -----------------------------------------------------------

	var _formattedPrint = function(itemToPrint, itemName) {
		console.log('----------------- '+itemName+' -----------------');
		console.log(itemToPrint);
		console.log('-------------------------------------------------');
	};

	var _getJobListByCriteria = function($, criteria) {
		// Iterate through all 'criteria' postings.
		// Gather up all <a> tag texts and hrefs.
		// This provides us with external links to other related jobs in close proximity.
		var list = [];
		$(criteria).find('a').each(function(index, element) {
			var jobDetails = {};
			jobDetails.text = $(element).attr('title');
			jobDetails.href = $(element).attr('href');
			list.push(jobDetails);
		});	
		return list;
	};

	var _getFeaturedJobCount = function($) {
		var searchCount = 0;
		var countString = $('#searchCount').text();

		// countString returns 'x jobs out of y'
		// x is the number shown on single page.
		// y is total number of jobs found from search.
		// +3 because 'of ' is three characters and we want the index of y.
		return (countString.slice(countString.lastIndexOf('of ') + 3));
	};

	var _getFeaturedJobs = function($) {

		return new Promise(function(resolve, reject) {

			if($ === undefined) {
				var currentErr = 'Inside _getFeaturedJobs() - '
				reject(new Error(currentErr + '`$` is undefined.'));
			} else {

				var list = [];

				$('div.row.result').each(function(i, element) {
					var jobDetails = {};

					// Get job title and href to ad details
					var aTag = $(element).find('a');
					jobDetails.href = 'ca.indeed.com' + aTag.attr('href');

					// Is ad sponsored?
					var sponsor = $(element).find('span.sdn');
					var isSponsored = false;
					((sponsor.text() === 'Sponsored') ? isSponsored = true : isSponsored = false);
					jobDetails.isSponsored = isSponsored;

					// Some ad details have different class names if they're sponsored.
					// Why? I have no idea ... but it was a pain in the ass figuring it out.
					var companyName, location, salary, summary;
					if(isSponsored) {

						var sponsoredDiv = $(element).find('div.sjcl');
						var tableData = $(element).find('table tr td span.summary');

						// Company name
						companyName = sponsoredDiv.find('span.company').text();
						jobDetails.companyName = ((companyName.length > 1) ? companyName.trim() : 'N/A');

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
						var companySpan = $(element).find('span.company');
						companyName = companySpan.find('span').text();
						jobDetails.companyName = ((companyName.length > 1) ? companyName.trim() : 'N/A');

						// Job location
						location = $(element).find('span span.location');
						jobDetails.location = ((location.length > 1) ? location.trim() : 'N/A/');

						var tableData = $(element).find('table tr td');

						// Job salary
						salary = $(tableData).find('nobr').text();
						jobDetails.salary = ((salary.length > 1) ? salary.trim() : 'N/A');

						// Job summary
						summary = $(tableData).find('span.summary').text();
						jobDetails.summary = ((summary.length > 1) ? summary.trim() : 'N/A');
					}

					list.push(jobDetails);
				});

				resolve(list);

			} // end of else
		});
	};

	return this;
}; // close module.exports = function indeedService(options);
