/**
 * New node file
 */

exports.mySqlException = function(err, res) {
	if (err !== undefined || err.errno !== undefined) {
		if (err.errno === 1062) {		
			res.send({					
				'error' : 'Unique key constraint Failed'
			});
		} else if (err.errno === 1452) {

			res.send({
				'error' : 'Invalid database query'
			});
		} else if (err.errno === 1292) {
			res.send({
				'error' : 'Invalid Date. Please enter a valid date'
			});
		} else if (err.errno === 1366) {
			res.send({
				'error' : 'User table primary key my=ust be integer'
			});
		} else if (err.errno === 1064) {
			console
			.log('SQl Syntax Error');
			res
			.send({
				'error' : 'Fatal Error Occured.'
			});
		} else if (err.errno === 1045) {
			res
			.send({
				'error' : 'invalid database login'
			});
		}else if (err.errno === 1054) {
			res
			.send({
				'error' : 'Unknown column in database query'
			});
		}

		else {
			res.send({
				'error' : err
			});
		}
	}
};


exports.throwException = function(err, res) {
	if (err !== undefined) {
		res.send({
			'error' : err
		});
	} else {
		res.send({
			'error' : 'Problem Encountered in Server'
		});
	}
};