file-based convention to decorate expressa REST/db-results with functions & middleware 

![Build Status](https://travis-ci.org/--repurl=git@github.com:coderofsalvation/expressa-init-collection..svg?branch=master)

## Usage

		require('expressa-init-collection')(expressa, app)
		expressa.collectionDir = __dirname+"/lib"
		expressa.initCollection('foo')

This will automatically fetch the following files if present:

| file | executed after database request | executed during REST request | note |
|-|-|-|-|
| lib/foo/get.js | no | yes | |
| lib/foo/put.js | no | yes | |
| lib/foo/delete.js | no | yes | |
| lib/foo/schema.js | no | yes | |
| lib/foo/functions.js | yes | yes | all db objects will inherit these functions | 

