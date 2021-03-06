'use strict';

var prompt = require('prompt');
var fs = require('fs');
var path = require('path');
var Promise = require('promise');

var absoluteCredinalsPath = path.join(process.cwd(), '/credinals.json');
var relativeCredinalsPath = path.relative(__dirname, absoluteCredinalsPath);

var credinals = fs.existsSync(absoluteCredinalsPath) ? require(relativeCredinalsPath) : null;

module.exports = {
	getCredinals: getAuthInfo
};

function createCredinalsFile(data) {
	fs.writeFile(absoluteCredinalsPath, data, function () {
		console.log("The file " + absoluteCredinalsPath.toString() + " was saved!");
	});
}
/**
 * Returns promise for getting user credinals
 * @param {Boolean=} needToSave – whether credinals should be saved into JSON
 * @return {Promise.<{user: String, pass: String}>}
 */
function getAuthInfo() {
	var needToSave = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	var properties = [{
		description: 'username',
		name: 'user'
	}, {
		description: 'password',
		name: 'pass',
		hidden: true
	}],
	    saveCredinals = {
		description: 'Save to crendinals.json? Y/N',
		name: 'needToSave',
		conform: function conform(res) {
			return res === 'Y' || res === 'N';
		}
	};
	if (needToSave) {
		properties.push(saveCredinals);
	}
	prompt.start();

	return new Promise(function (resolve, reject) {
		if (!credinals || !credinals.pass || !credinals.user) {
			prompt.get(properties, function (err, res) {
				if (err) {
					reject(err);
				} else {
					credinals = { user: res.user, pass: res.pass };
					if (res.needToSave === 'Y') {
						createCredinalsFile(JSON.stringify(credinals));
					}
					resolve(credinals);
				}
			});
		} else {
			resolve(credinals);
		}
	});
}