#!/usr/bin/env node

var t = require('./../lib/util.js')

var returnArrayPromise = function(){
	return new Promise( function(resolve, reject){
		resolve( [{"foo":"bar"}] )
	})
}

var returnObjectPromise = function(){
	return new Promise( function(resolve, reject){
		resolve( {"foo":"bar"} )
	})
}

var expressa = {
	addListener: t.spy(function(){}), 
	db: {
		foo:{
			find: returnArrayPromise,  
			get: returnObjectPromise, 
			update: returnObjectPromise, 
			all: returnArrayPromise
		}
	}
}

t.test("init", function(next, error){
	var ec = require('./../../')(expressa, {})
	expressa.collectionDir = __dirname+"/../lib"
	expressa.initCollection('foo')
	next()
})

t.test("foo find", function(next, error){
	if( ! expressa.addListener.called ) error("addListener was not called")
	expressa.db.foo.find()
	.then( function(result){
		if( !result[0].addPropertyFoo ) error("addPropertyFoo not found")
		next()
	})

})

t.test("foo get", function(next, error){
	if( ! expressa.addListener.called ) error("addListener was not called")
	expressa.db.foo.get('sdfsd')
	.then( function(result){
		if( !result.addPropertyFoo ) error("addPropertyFoo not found")
		next()
	})

})

t.test("foo update", function(next, error){
	if( ! expressa.addListener.called ) error("addListener was not called")
	expressa.db.foo.update('sdfsd', {})
	.then( function(result){
		next()
	})

})

t.run()
