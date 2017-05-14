file-based design-pattern to organize expressa & express REST/db middleware 

![Build Status](https://travis-ci.org/--repurl=git@github.com:coderofsalvation/expressa-init-collection..svg?branch=master)

## Usage

    require('expressa-folder')(expressa, app)
    expressa.addListener('ready', 100, >(){
      expressa.folderDir = __dirname+"/lib"
      expressa.initFolder('foo')      // will require expressa db/REST-listener code if collection 'foo' exist
      expressa.initFolder('foo/bar')  // will setup custom express point
    })

This will automatically fetch the following files if present:

| file                 | expressa listener | creates express endpoint | note                                        |
| -                    | -                 | -                        | -                                           |
| lib/foo/get.js       | yes               | no                       | requires data/collection/foo.js to exist    |
| lib/foo/post.js      | yes               | no                       | requires data/collection/foo.js to exist    |
| lib/foo/put.js       | yes               | no                       | requires data/collection/foo.js to exist    |
| lib/foo/delete.js    | yes               | no                       | requires data/collection/foo.js to exist    |
| lib/foo/schema.js    | yes               | no                       | requires data/collection/foo.js to exist    |
| lib/foo/functions.js | no                | no                       | all db objects will inherit these functions |
| lib/foo/swagger.js   | no                | no                       | only when [expressa-swagger](https://npmjs.org/package/expressa-swagger) is installed |
| lib/foo/bar/get.js   | no                | yes                      | bare express endpoint without expressa schema-validation|
| lib/foo/bar/swagger.js   | no                | no                       | only when [expressa-swagger](https://npmjs.org/package/expressa-swagger) is installed |

## Example: lib/foo/get.js

G
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

## Example: lib/foo/bar/get.js (bare express)

    module.exports = function(expressa,app){
      return function(req, res, next){
				res.writeHeader(200, {"Content-Type":"application/json"})
				res.end( JSON.stringify({"foo":"bar"}) )
      }
    }

Voila..this will automatically setup a 'foo/bar' express-endpoint

## Example: robust custom endpoint

> NOTE: The non-expressa endpoint above, is a simple express endpoint.
> Unfortunately express endpoints have zero input validation (unlike expressa endpoints).

Here's how to do it for express as well..let assume we want the user to submit to a mailinglist:

    // lets add the endpoint
    expressa.initFolder('users/mailinglist')

And now lets write `lib/users/mailinglist/post.js`:

    var typeshave = require('typeshave') // json schema validator
    var typesafe  = typeshave.typesafe

    var schema = require('./../../../../data/collection/users.json').schema
    schema.required = ["firstname", "email"] // overrule required properties

    module.exports = function(expressa, app ){

      return function(req, res, next){

        res.writeHeader(200, {"Content-Type":"application/json"})

        try{ 

          typesafe(schema, function(){

            expressa.db.users.find({email:req.body.email})
            .then( function(user){
              if(user.length != 0) throw "user "+req.body.email+" already exist"
              return expressa.db.users.create( req.body )
            })
            .then(function(id){
              res.end( JSON.stringify({code:0, id:id}) )
            })
            .catch(function(err){
              res.end( JSON.stringify({"code":1, error:err}) )
            })

          })(req.body) 

        }catch(e){
          return res.end( JSON.stringify({"code":2, error:e}) )
        }

      }
    }

Boom...if we would now post `{}` to our endpoint:

    $ curl -X POST 'http://localhost:3001/api/users/mailinglist' --data '{}'

Then the server will reply:

    { data: {},
      errors:
       { message: 'Missing required property: email',
         dataPath: '',
         schemaPath: '/required/0',
         subErrors: null },
      schema:
       { type: 'object',
         additionalProperties: false,
         properties:
          { meta: [Object],
            email: [Object],
            password: [Object],
            firstname: [Object],
            lastname: [Object],
            roles: [Object] }
         required: [ 'email', 'firstname' ],


## Example: lib/foo/swagger.js

This will add (or overwrite) swagger documentation, generated at url `/api/doc` using [expressa-admin](https://npmjs.org/package/expressa-swagger):

    module.exports = {
      "/foo":{
        "get":{
          "parameters": [
            {
              "in": "body",
              "name": "payload",
              "description": "", 
              "required": true,
              "schema": {
                "type": "object",
                "required":["id_user"],                  // see swagger
                "properties": {                          // documentation
                  "id_user":{
                    "required":true, 
                    "type":"string",
                    "default":"lLK34LK" 
                  }
                }
              }
            }    
          ],
          "responses": { },
          "tags": [ "users" ],
          "summary": "Lorem ipsum"
        }
      }
    }
