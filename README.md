file-based convention to decorate expressa REST/db-results with functions & middleware 

![Build Status](https://travis-ci.org/--repurl=git@github.com:coderofsalvation/expressa-init-collection..svg?branch=master)

## Usage

		require('expressa-init-collection')(expressa, app)
		expressa.collectionDir = __dirname+"/lib"
		expressa.initCollection('foo')

This will automatically fetch the following files if present:

| file                 | executed after database request | executed during REST request | expressa listener | creates express endpoint | note                                        |
| -                    | -                               | -                            | -                 | -                        | -                                           |
| lib/foo/get.js       | no                              | yes                          | yes               | no                       |                                             |
| lib/foo/put.js       | no                              | yes                          | yes               | no                       |                                             |
| lib/foo/delete.js    | no                              | yes                          | yes               | no                       |                                             |
| lib/foo/schema.js    | no                              | yes                          | yes               | no                       |                                             |
| lib/foo/functions.js | yes                             | yes                          | no                | no                       | all db objects will inherit these functions |
| lib/foo/bar/get.js   | no                              | yes                          | no                | yes                      | |

## Example: lib/foo/get.js


		module.exports = function(expressa, app){

			return function(req, collection, doc, resolve, reject) {
				// do stuff with the response data (doc)
				resolve(doc)
			})
		}

## Example: lib/foo/functions.js

		module.exports = function(expressa, app){

			return {
				addPropertyFoo: () => {
					this.foo = "bar"
				}
			}

		}

Now you can easily access helper functions on the server:

    expressa.db.foo.find({})
		.then( function(items){
			items.map( (i) => i.addPropertyFoo() )
		})
