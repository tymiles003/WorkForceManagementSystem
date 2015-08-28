var HashMap = require('hashmap');
var map = null;

var isSQLCacheEnabled = true;


exports.SQLCacheInit = function()
{
	if(isSQLCacheEnabled === true)
	{
	    map = new HashMap();
	}
};

exports.SQLCacheAddData = function(key, value)
{
	if(isSQLCacheEnabled === true)
	{
		console.log("SQL cache add data " + key + " " +value);
		map.set(key, value);
	}
};

exports.SQLCacheGetData = function(key)
{
	if(isSQLCacheEnabled === true)
	{
		var value = map.get(key);
		console.log("SQL cache get data " + key + " " +value);
		if(value === undefined ||
			value === null)
		{
			return null;
		}
		else
		{
			return value;
		}
	}
	return null;
};


exports.SQLCacheRemoveData = function(key)
{
	if(isSQLCacheEnabled === true)
	{
		map.remove(key);
	}
};