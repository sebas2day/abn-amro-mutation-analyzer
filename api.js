var fs = require('fs');
var https = require('https');
var zlib = require('zlib');

var API = function(filename) {
	this.filename = filename;
	this.db = this.getStorageData();
	this.setAccountNumber(this.db.accountNumber);
}

API.prototype.hasAccountNumber = function() {
	return !(!this.accountNumber || this.accountNumber.length === 0);
}

/**
 * IBAN
 */
API.prototype.setAccountNumber = function(accountNumber) {
	this.accountNumber = accountNumber;
}

API.prototype.getRequestPath = function(lastMutationKey) {
	return 'https://www.abnamro.nl/mutations/' + this.accountNumber + '?accountNumber=' + this.accountNumber + '&includeActions=EXTENDED' +
		(lastMutationKey ? '&lastMutationKey=' + lastMutationKey : '');
}

API.prototype.requestData = function(cookie, fiddlerEnabled, onResponse, path) {
	
	var contractNr = this.accountNumber.substr(9);
	var request = https.request(
	{
		host: fiddlerEnabled ? '127.0.0.1' : '23.202.229.90',
		port: fiddlerEnabled ? 8888 : 443,
		path: path || this.getRequestPath(),
		method: 'GET',
		headers: {
			'Host': 'www.abnamro.nl',
			'Connection': 'keep-alive',
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache',
			'Accept': 'application/json, text/plain, */*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Accept-Language': 'nl',
			'Content-Type': 'application/json',
            'Cookie': cookie,
            'Pragma': 'no-cache',
            'Referer': 'https://www.abnamro.nl/portalserver/mijn-abnamro/betalen-en-sparen/bij-en-afschrijvingen/index.html',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
			'x-aab-serviceversion': 'v3',
			'X-Requested-With': 'XMLHttpRequest'
		}
	}, 
	function(response) {
		var body = '';
		var output;
		
		response.on('error', function(err){
			console.log('request error');
		});
		
		if (response.headers['content-encoding'] == 'gzip' ) {
			output = zlib.createGunzip();
			response.pipe(output);
		} else if (response.headers['content-encoding'] == 'deflate') {
			output = zlib.createInflate(); 
			response.pipe(output);
		} else {
			output = res;
		}

		output.on('data', function (chunk) {
		   chunk = chunk.toString('utf-8');
		   body += chunk;
		});
		
		output.on('end', function(){
			if (body) {
				onResponse(JSON.parse(body));
			} else {
				console.log('There was no data');
			}
		});
	});
	request.end();
}

API.prototype.getStorageData = function() {
	var fileExists = fs.existsSync(this.filename);
	if (fileExists){
		var data = fs.readFileSync(this.filename, { encoding: 'utf8' });
		if (data){
			return JSON.parse(data);
		}
	}
	return { mutations: [] }; // default format
}

API.prototype.saveMutations = function(mutations) {
	this.db = this.getStorageData();
	this.db.accountNumber = this.accountNumber;
	
	var filteredMutations = [];
	for(var i = 0; i < mutations.length; i++) {
		// To prevent duplicate entries we check each mutation
		if (this.doesMutationAlreadyExists(mutations[i])) {
			console.log('Mutation already exists, skipping: ' + mutations[i].transactionTimestamp + ' (index ' + i + ')');
		} else {
			filteredMutations.push(mutations[i]);
		}
	};
	this.db.mutations = filteredMutations.concat(this.db.mutations);
	this.db.mutations = this.db.mutations.sort(function(a, b) { return parseInt(a.transactionTimestamp) - parseInt(b.transactionTimestamp); });

	fs.writeFileSync(this.filename, JSON.stringify(this.db));
}

API.prototype.transformData = function(rawData) {
	if (rawData.mutationsList == undefined || 
		rawData.mutationsList.mutations == undefined) {
		// show the new format and throw error
		console.log(rawData);
		throw new Error('JSON output has changed: mutationsList');
	}
	
	var mutations = [];
	
	rawData.mutationsList.mutations.forEach(function(item, i){
		var rawMutation = item.mutation;
		
		if (rawMutation == undefined ||
			rawMutation.counterAccountName == undefined ||
			rawMutation.counterAccountNumber == undefined ||
			rawMutation.amount == undefined ||
			rawMutation.transactionTimestamp == undefined ||
			rawMutation.descriptionLines == undefined){
			// show the new format and throw error
			console.log(item);
			throw new Error('JSON output has changed: mutation properties');
		}
		
		var mutationDescription = rawMutation.descriptionLines.length > 4 
			? rawMutation.descriptionLines.slice(4).join('')
			: '';
			
		mutations.push({
			accountName: rawMutation.counterAccountName,
			accountNumber: rawMutation.counterAccountNumber,
			amount: rawMutation.amount,
			balance: rawMutation.balanceAfterMutation,
			transactionTimestamp: rawMutation.transactionTimestamp,
			description : mutationDescription
		});
	});
	
	return mutations;
}

API.prototype.getLastMutationKey = function(rawData) {
	if (!rawData.mutationsList.lastMutationKey) {
		throw new Error('JSON output has changed: lastMutationKey');
	}
	return rawData.mutationsList.lastMutationKey;
}

API.prototype.doesMutationAlreadyExists = function(mutation) {
	for(var i = 0; i < this.db.mutations.length; i++){
		if (mutation.transactionTimestamp == this.db.mutations[i].transactionTimestamp){
			return true;
		}
	}
	return false;
}

module.exports = API;