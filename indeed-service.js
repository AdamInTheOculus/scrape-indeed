/* 
	Author: Adam Sinclair
	Date: January 4th 2017
	Purpose: 
		HTTPS request to Indeed.com
		Returns HTML code from a specific search term.
		I want to see the HTML returned and if it'll be easy to scrape each job posting.
		I'll need to research each job posting and recognize a pattern to display results.
		Then I can write an app that enables users to search for jobs across multiple
		job banks.
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
		featuredCount: 0,
		salaryList: [],
		jobTypeList: [],
		locationList: [],
		companyList: [],
		titleList: [],
		featuredList: []
	}; // close data

	this.query = function(jobTitle, location, radius, startingAd) {

		// Indeed only places 10 featured job ads per page, so if we want to see ...
		// more results we need to specify a starting point.
		// If `startingAd` is undefined, we'll get the first page of results.
		// Otherwise we specify our starting point.
		if(startingAd === undefined) {
			startString = '';
		} else {
			startString = '&start=' +startingAd;
		}

		return new Promise(function(resolve, reject) {
			_util.getHTTPS('ca.indeed.com', '/jobs?q=' +jobTitle+ '&l=' +location+ '&radius=' +radius+ startString)
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
				_this.data.featuredCount = _getFeaturedJobCount($);
				_this.data.salaryList = _getJobListByCriteria($, '#SALARY_rbo');
				_this.data.jobTypeList = _getJobListByCriteria($, '#JOB_TYPE_rbo');
				_this.data.locationList = _getJobListByCriteria($, '#LOCATION_rbo');
				_this.data.companyList = _getJobListByCriteria($, '#COMPANY_rbo');
				_this.data.titleList = _getJobListByCriteria($, '#TITLE_rbo');

				// Get featured jobs from current page
				//_this.data.featuredList = getFeaturedJobList();

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

	this.getFeaturedCount = function() {
		return _this.data.featureCount;
	};

	this.printAllLists = function() {
		for(list in _this.data) {
			if(typeof(_this.data[list]) === 'object') {
				_formattedPrint(_this.data[list], list);
			}
		}
	}; // close printAllData

	// -------------------------------------------
	// -------- UTILITY FUNCTIONS FOR API --------
	// -------------------------------------------
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

	var _getFeaturedJobListings = function($) {
		var list = [];
		return null;
	};

	return this;
}; // close module.exports = function indeedService(options);
