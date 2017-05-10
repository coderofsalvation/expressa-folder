var fs = require('fs')
var  _ = require('lodash')
var debug = require('debug')('expressa-folder')

module.exports = (expressa, app) => {

	expressa.folderDir = false	

	var addFunctions = function(obj, functions){
		Object.assign(obj, functions)
		for( var i in functions ) obj[i] = functions[i].bind(obj)
	}

	var addExtendFunctionArray = function(functions, original, a, b, c, d, e, f, g){
		return new Promise( function(resolve, reject){
			original(a, b, c, d, e, f, g)
			.then( function(result) {
				if( result ) result.map( (r) => addFunctions(r, functions) )
				resolve(result)
			})
			.catch(reject)
		})
	}

	var addExtendFunctionObject = function(functions, original, id){
		return new Promise( function(resolve, reject){
			original(id)
			.then( function(r) {
				if( r ) addFunctions(r, functions)
				resolve(r)
			})
			.catch(reject)
		})
	}

	var initEndpoint = function(name){
		var files = ["get", "put", "post", "delete"]
		files.map( (method) => {
			var path = expressa.folderDir+'/'+name+"/"+method+'.js'
			var exists = fs.existsSync(path)
			if( exists ){
				debug("requiring express  REST-listener: "+name+"/"+method+".js")
				expressa[method]('/'+name, require(path)(expressa, app) )
			}
		})
	}

	expressa.initFolder = (name) =>  {
		if( !expressa.folderDir ) throw 'please set expressa.folderDir first, see docs of expressa-init-folder'
		if( expressa.db[name] ) expressa.initListeners(name)
		else initEndpoint(name)
	}

	expressa.initListeners = (name) => {	
		var files = ["functions", "get", "put", "post", "delete", "schema"]
		files.map( (file) => {
			var path = expressa.folderDir+'/'+name+"/"+file+'.js'
			var exists = fs.existsSync(path)
			if( exists ){
				switch( file ){
					case "get":
				  case "post":
				  case "delete":
					case "put":
					case "schema":
						var method = file == "schema" ?  "get" : file
					  var url = "/"+name
						if( file == "schema" ) url += "/schema"
						debug("requiring expressa REST-listener: "+name+"/"+file+".js")
						expressa.initListenerFile( method, url,  path )
						break;

					case "functions":
						debug("requiring expressa   db-extender: "+name+"/"+file+".js")
						// add database functions to objects retrieved from db
						var functions = require( path )(expressa, app)

						// wrap expressa's db functions in order to decorate db-objects with functions
						var dbfunction = expressa.db[name]
						if( dbfunction ){
							dbfunction.find = _.wrap( dbfunction.find, addExtendFunctionArray.bind(dbfunction, functions) )
							dbfunction.all  = _.wrap( dbfunction.all,  addExtendFunctionArray.bind(dbfunction, functions) )
							dbfunction.get  = _.wrap( dbfunction.get,  addExtendFunctionObject.bind(dbfunction, functions) )
							// make sure we remove functions from object before updating them in the db 
							_.wrap( dbfunction.update,  function(original, id, obj){
								obj = JSON.parse( JSON.stringify(obj) ) // strip functions
								return original(id, obj)
							})
						}
						break;

				}
			}
		})
	}

  expressa.initListenerFile = function(method, url,  file) {
		expressa.addListener( method, 101, function(req, collection, doc){
			var middleware = require( file )(expressa,app)
			return new Promise( function(resolve, reject){
				if( req.url.replace(/\?.*/, '') == url ){
					debug(file)	
					return middleware(req, collection, doc, resolve, reject)
				}
				resolve()
			})
		})
  }	

}
