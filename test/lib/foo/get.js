module.exports = function(expressa, app){

	return function(req, collection, doc, resolve, reject) {
		if (collection == 'foo') {
			resolve({foo:"bar"})
		}
	})
}
