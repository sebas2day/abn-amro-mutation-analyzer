import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from 'highcharts';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

interface Mutation {
  accountName: string,
  accountNumber: string,
  amount: number,
  balance: number,
  transactionTimestamp: string,
  description : string
}

function getDateOfTransaction(transactionTimestamp: string) {
	var year = parseInt(transactionTimestamp.slice(0, 4));
	var month = parseInt(transactionTimestamp.slice(4, 6)) - 1;
	var day = parseInt(transactionTimestamp.slice(6, 8));
	var hour = parseInt(transactionTimestamp.slice(8, 10));
	var minute = parseInt(transactionTimestamp.slice(10, 12));
	return Date.UTC(year, month, day, hour, minute);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dashboard';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
			zoomType: 'x'
    },
		xAxis: {
			type: 'datetime',
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
    series: [{
      data: [1, 2, 3],
      type: 'area'
    }],
  };
  // Datepicker takes `Moment` objects instead of `Date` objects.
  startdate = new FormControl(moment([2021, 9, 1]));

  enddate: number = Date.UTC(2022, 1, 0);

  constructor(private http: HttpClient) {
    const data = http.get<{ mutations: Mutation[] }>('/api/data');
    data.subscribe((records) => {
      this.chartOptions = {
        series: [{
          name: 'Amount',
          type: 'area',
          data: records.mutations.map(mutation => ({
            x: getDateOfTransaction(mutation.transactionTimestamp),
            y: mutation.balance,
            description: mutation.description || mutation.accountName
          })).filter(record => record.x > this.startdate.value && record.x < this.enddate),
        }]
      }
    })
  }
}
