# Scrape Indeed

## What is it?
- Node.js library that allows flexible job searching.
- HTTPS calls are made to `ca.indeed.com` (Canadian jobs, see [Backlog](#backlog))
- Uses ES6 Promises to handle asynchronous control flow.

## Why use it?
- Allows your web app to get job posting data from Indeed.
- You don't have to deal with Indeed's cluttered interface.

## How to use it?

#### Basic usage.
```javascript
// Require our module.
const IndeedService = require('./indeed-service.js')();

// Get initial Indeed data using IndeedService.query().
// 1st argument: Keyword
// 2nd argument: Location
// 3rd argument: Radius of search, in KM
IndeedService.query('Javascript', 'Toronto', '100')
.then(function(data) {
    // Do something with data ...
    console.log(data.jobList);
})
.catch(function(err) {
    console.log('Error: ' + err);
});
```

#### That's great. But that only gives us 10 job postings.
- We can ask for the next 10 ads by using `IndeedService.nextPage()`
- We can see which ad index we're currently at by using `IndeedService.parameters.adIndex`
- Once we've performed a search, the returned `data` object has a property containing the total number of job postings: `data.featuredAdCount`

```javascript
// Require our module.
const IndeedService = require('./indeed-service.js')();

// Get initial Indeed data using IndeedService.query().
IndeedService.query('Javascript', 'Toronto', '100')
.then(function(data) {
    console.log(data.jobList);

    // Get next 10 job postings
    // NOTE: This will overwrite the current data ...
    return IndeedService.nextPage();
})
.then(function(data) {
    // Do something with next 10 job postings
    console.log(data.jobList);

    // View the current jobs index and total jobs
    console.log(`You've viewed [${IndeedService.parameters.adIndex}] jobs out of [${data.featuredAdCount}] total jobs.`);
})
.catch(function(err) {
    console.log('Error: ' + err);
});
```

## What does the data look like?
Look at the table to see the different kinds of data available.

#### * IndeedService.query() returns an object containing ...
| name | datatype | description |
|------|----------|-------------|
| salaryList | array | List of links to job searches sorted by salary ($50000+, $70000+, etc.) |
| jobTypeList | array | ... sorted by job type (SALARY, CONTRACT, HOURLY, etc.)|
| locationList | array | ... sorted by location (Toronto, Newmarket, Richmond Hill, etc.) |
| companyList | array | ... sorted by company |
| titleList | array | ... sorted by job title (Senior Web Developer, Junior Dev, C Developer, etc.) |
| jobList | array | List of all main job postings [JSON format] |

--------

Below is an example of what a main job posting is. `jobList` contains a list of these main postings.
![indeed-disection](https://cloud.githubusercontent.com/assets/15149835/24163965/8d73e850-0e42-11e7-8b97-501545b128e0.png)

--------

#### * jobList object
| name | datatype | description |
|------|----------|-------------|
| href | string | A complete URL to the Canadian job posting |
| title | string | Job title of posting |
| isSponsored | boolean | Indicates whether the posting is Sponsored. Sponsored ads are seen first/last |
| company | string | Company name of job posting |
| location | string | Geographical location of job |
| salary | string | Indicates salary/hourly wage |
| summary | string | Short summary of the job posting |

## Known issues?
- Only works with ca.indeed.com (Canadian site)
    - US site feature will be added in future
- Some main job postings will be missing data ('N/A')
    - This is because job posters don't provide all information

## Backlog
- Allow `n` number of job postings to be searched, rather than 10 per query.
- Allow all North American jobs to be searched, rather than only Canada.
- Create NPM registry to enable `npm install`.
