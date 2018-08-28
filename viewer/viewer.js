var $ = require('jquery');
var angular = require('angular');
var angularMaterial = require('angular-material');
var highcharts = require('highcharts');
var moment = require('moment');

var app = angular.module('app', ['ngMaterial']);

var excludedAccountNumbers = [];

app.controller('MainController', function($scope){
	var main = this;
	$scope['main'] = main;
	
	main.maxdate = new Date();
	main.startdate = new Date();
	main.startdate.setMonth(new Date().getMonth() - 1);
	main.enddate = new Date();
	main.highscore = scoreBankAccounts(main.startdate, main.enddate);
	main.accountName = '';
	main.description = '';
	
	$scope.$watch('main.startdate', function(){
		main.chart.series[0] = updateSeries();
		main.highscore = scoreBankAccounts(main.startdate, main.enddate);
		updateList();
	});
	$scope.$watch('main.enddate', function(){
		main.chart.series[0] = updateSeries();
		main.highscore = scoreBankAccounts(main.startdate, main.enddate);
		updateList();
	});
	$scope.$watch('main.accountName', function(){
		updateList();
	});
	$scope.$watch('main.description', function(){
		updateList();
	});
	
	var amount = null;
	var serieAmount = updateSeries();
	
	updateList();

	main.chart = {		
		chart: {
			type: 'area',
			zoomType: 'x'
		},
		xAxis: {
			type: 'datetime',
			// dateTimeLabelFormats: { // don't display the dummy year
				// month: '%e. %b',
				// year: '%b'
			// },
			title: {
				text: 'Date'
			}
		},
		yAxis: {
			title: {
				text: 'Euro'
			},
			min: 0
		},
		tooltip: {
			headerFormat: '<b>{series.name}</b><br>',
			pointFormat: '{point.x:%e. %b}: {point.y:.2f} Euro<br>{point.description}'
		},
		series: [ serieAmount ]
	};
	
	main.transformDate = (transactionTimestamp) => {
		return moment(getDateOfTransaction(transactionTimestamp)).format('DD/MM/YY HH:MM');
	}

	function updateSeries(){
		var serie = createSeries('Amount', function(mutation){
			if (amount == null){
				amount = mutation.balance;
			} else if (excludedAccountNumbers.indexOf(mutation.accountNumber) == -1) {
				amount += mutation.amount;
			}
			
			var mutationTime = getDateOfTransaction(mutation.transactionTimestamp);
			if (mutationTime < main.startdate || mutationTime > main.enddate) {
				return null;
			}
			
			return {
				x: getDateOfTransaction(mutation.transactionTimestamp), 
				y: mutation.balance,
				description: mutation.description || mutation.accountName
			}
		});
		return serie;
	}

	function updateList(){
		var lastIndex = jsonData.mutations.length - 1;
		main.mutations = [];

		for (var i = lastIndex; i > 0; i--) {
			var mutation = jsonData.mutations[i];
			var mutationTime = getDateOfTransaction(mutation.transactionTimestamp);
			if (mutationTime < main.startdate || mutationTime > main.enddate ||
				mutation.accountName.toLowerCase().indexOf(main.accountName.toLowerCase()) == -1 ||
				mutation.description.toLowerCase().indexOf(main.description.toLowerCase()) == -1) {
				continue;
			}
			main.mutations.push(mutation);
		}
	}
});

app.directive('highchart', function(){
	return {
		scope: {
			'config': '=config'
		},
		link: function(scope, element, attrs){
			var chart = null;
			scope.$watch('config', function(config){
				$(element).highcharts(config);
				chart = $(element).highcharts();
			});
			scope.$watchCollection('config.series', function(series){
				if (!chart) return;
				
				angular.forEach(chart.series, function(serie, index) {
					serie.update(series[index]);
				});
			});
		}
	}
})

angular.bootstrap(document, ['app']);

/**
 * JSON Data format:
 * {
 *   accountName : string
 *   accountNumber : string
 * 	 amount : number
 *   balance : number
 *   transactionTimestamp : number
 *   description : string
 * }
 */

function getDateOfTransaction(transactionTimestamp){
	var year = parseInt(transactionTimestamp.slice(0, 4));
	var month = parseInt(transactionTimestamp.slice(4, 6)) - 1;
	var day = parseInt(transactionTimestamp.slice(6, 8));
	var hour = parseInt(transactionTimestamp.slice(8, 10));
	var minute = parseInt(transactionTimestamp.slice(10, 12));
	return Date.UTC(year, month, day, hour, minute);
}

function createSeries(name, projection){
	var lastIndex = jsonData.mutations.length - 1;
	var records = [];
	for (var i = lastIndex; i > 0; i--) {
		var mutation = jsonData.mutations[i];
		var record = projection(mutation);
		if (record != null){
			records.push(record);
		}
	}
	return { name: name, data: records };
}

function scoreBankAccounts(startdate, enddate){
	var bankaccounts = {};
	var bankaccountNames = {};
	for (var i = 0; i < jsonData.mutations.length; i++) {
		var mutation = jsonData.mutations[i];
		
		var mutationTime = getDateOfTransaction(mutation.transactionTimestamp);
		if (mutationTime < startdate || mutationTime > enddate || mutation.amount > 0) {
			continue;
		}
		
		if (!bankaccounts[mutation.accountNumber]){
			bankaccounts[mutation.accountNumber] = 0;
		}
		bankaccounts[mutation.accountNumber] += -mutation.amount;
		bankaccountNames[mutation.accountNumber] = mutation.accountName;
	}
	
	var sortable = [];
	for (var bankaccount in bankaccounts) {
		sortable.push([bankaccount, bankaccountNames[bankaccount], bankaccounts[bankaccount]]);
	}

	sortable.sort(function(a, b) {
		return b[2] - a[2];
	});
	
	return sortable;
}