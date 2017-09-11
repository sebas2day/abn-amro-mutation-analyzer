var prompt = require('prompt')
var API = require('./api');

/** init **/
var filename = 'db.json';
var account = '';
var api = new API(filename);
var retrievedMutations = [];

/** format prompt **/
prompt.message = '>';
prompt.delimiter = ':';

/** start **/
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
prompt.start();

/** get accountnr **/
if (!api.hasAccountNumber()) {
	prompt.get([{
		name: 'account',
		message: '',
		required: true
	}], function(err, result) {
		api.setAccountNumber(result.account);
		login();
	});
} else {
	login();
}

function login() {
	prompt.get(
		[{
			name: 'cookie',
			message: 'Give me the cookie',
			required: true
		}, {
			name: 'fiddler',
			message: 'Are you using fiddler? y/n (default: n)'
		}], 
		function(err, result) { 
			if (err) throw err;
			retrieveMutations(result.cookie, result.fiddler === 'y' || result.fiddler === 'Y');
		}
	);
}

function retrieveMutations(cookie, usingFiddler, lastMutationKey) {
	var requestPath = api.getRequestPath(lastMutationKey);
	console.log('Start retrieving mutations');

	api.requestData(cookie, usingFiddler, function(rawData) {
		var mutations = api.transformData(rawData);
		if (mutations.length > 0) {
			console.log(mutations.length + ' mutations retrieved!');
			
			if (api.doesMutationAlreadyExists(mutations[mutations.length - 1])) {
				console.log('Some of the retrieved mutations already exist within the database');
			}
			retrievedMutations = retrievedMutations.concat(mutations);
			
			prompt.get(
			[{
				name: 'getMore',
				message: 'Get more mutations? y/n (default: y)'
			}], 
			function(err, result) {
				if (err) throw err;
				
				lastMutationKey = api.getLastMutationKey(rawData);
				console.log('Last mutationkey is: ' + lastMutationKey);
				
				if (result.getMore !== 'n' && result.getMore !== 'N' && result.getMore !== 'no') {
					retrieveMutations(cookie, usingFiddler, lastMutationKey);
				} else {
					saveMutations();
				}
			});
		} else {
			console.log('There was no more mutations to retrieve');
			saveMutations();
		}
	}, requestPath);
}

function saveMutations() {
	if (retrievedMutations.length == 0) {
		console.log('There were no mutations retrieved, so we can\'t save any');
	} else {
		prompt.get(
		[{
			name: 'saveData',
			message: 'Save the new collected mutations? y/n'
		}],
		function(err, result) {
			if (err) throw err;
			
			if (result.saveData === 'y' || result.saveData === 'Y') {
				api.saveMutations(retrievedMutations);
				console.log('Successfully saved to: ' + filename);
			}
		});
	}
}