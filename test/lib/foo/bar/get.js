module.exports = function(expressa, app){
	return function(req, res, next){
		res.end("foo")
	}
}
