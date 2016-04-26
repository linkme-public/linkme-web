# linkme-public
[![Build Status](https://travis-ci.org/linkme-public/linkme-web.svg?branch=master)](https://travis-ci.org/linkme-public/linkme-web)
[![Coverage Status](https://codecov.io/github/linkme-public/linkme-web/coverage.svg?precision=2)](https://codecov.io/github/linkme-public/linkme-web)

## Repo structure

This is the repository for the chat server.

## How to

### Run 
Make sure you have all dependencies by running `npm install` from the chatapp directory.

The run `npm start`.

### Run tests
Navigate to the chatapp folder and run `npm test`.  


## API

### How to ping the api

`GET /api`


### How to post a link

`POST /api/link`

with body 

```json
{
    "link": "blaaaah"
} 
```