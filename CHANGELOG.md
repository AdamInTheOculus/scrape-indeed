Changelog
=========

### v0.5.0
- add support for multiple countries

### v0.4.3
- change empty result from 'N/A' to 'Not specified'

#### v0.4.2
- supress console logs
- disable scraping of Indeed aside links for better performance 

#### v0.4.1
- fix "replace is not a function" by converting toString()

#### v0.4.0
- update web scraping elements
- add search limit of range [5-50] jobs per search
- user must now pass in single object when calling `IndeedService.query()`

#### v0.3.3
- remove unnecessary modules 

#### v0.3.2
- add project to NPM registry as `scrape-indeed`

#### v0.3.1
- rename `jobList.companyName` to `jobList.company`
- update README.md to show other available functions
- update package.json
- rename Git Repo to `scrape-indeed`

#### v0.3.0
- add job location
- add posted date for non-sponsored listings
- replace `var` with `let` and `const` -- more ES6-like

#### v0.2.0
- develop scraper to get all job postings
- sort posting data into single object
- return list of all job posting objects

#### v0.1.0
- setup indeed scraper as an API
- develop scraper to get single job posting

#### v0.0.0
- init
