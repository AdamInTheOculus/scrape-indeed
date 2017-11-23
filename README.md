# Scrape Indeed

## What is it?
- Node.js package that allows flexible job searching of Indeed's job postings.
- HTTPS calls are made to `ca.indeed.com` (Currently only Canadian jobs, see [Backlog](#backlog)).
- Uses ES6 Promises to handle asynchronous control flow.

## Why use it?
- Allows your web app to get full job posting data from Indeed.
- You don't have to deal with Indeed's cluttered interface.

## How to use it?

#### Installation
Install from NPM registry:
```
npm install scrape-indeed
```

#### Basic usage.
```javascript
// Require our module.
const IndeedService = require('scrape-indeed')();

// Test with: >> node test.js 'Programmer' 'Vancouver' 25 50
let options = {
    title: process.argv[2],     // Programmer
    location: process.argv[3],  // Vancouver
    radius: process.argv[4],    // 25 kilometer radius
    count: process.argv[5]      // 50 job postings
};

IndeedService.query(options)
.then(function(data) {
    // Do something with data ...
    console.log(data.jobList);
})
.catch(function(err) {
    console.log('Error: ' + err);
});
```

#### That's great. But that only gives us `n` job postings.
- We can ask for the next `n` ads by using `IndeedService.nextPage()`
- We can see which ad index we're currently at by using `IndeedService.parameters.adIndex`
- Once we've performed a search, the returned `data` object has a property containing the total number of job postings: `data.featuredAdCount`

```javascript
// Require our module.
const IndeedService = require('scrape-indeed')();

// Get initial Indeed data using IndeedService.query().
IndeedService.query(options)
.then(function(data) {
    console.log(data.jobList);

    // Get next `n` job postings, depending on your options
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

#### IndeedService.query() returns an object containing ...
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

#### jobList object contains ...
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
- Allow all North American jobs to be searched, rather than only Canada.
~~- Allow a single `options` object to be passed into `IndeedService.query()`, rather than a separate parameter for each search token.~~ (0.4.0)
~~- Allow `n` number of job postings to be searched, rather than 10 per query.~~ (0.4.0)
~~- Create NPM registry to enable `npm install`.~~ (0.3.2)
