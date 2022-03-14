import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from 'highcharts';
import { FormControl, FormGroup } from '@angular/forms';
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
	return moment([year, month, day, hour, minute]);
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

  range = new FormGroup({
    start: new FormControl(moment([2021, 11, 5])),
    end: new FormControl(moment([2021, 11, 23])),
  });

  private mutations: Mutation[] = [];

  constructor(http: HttpClient) {
    http.get<{ mutations: Mutation[] }>('/api/data').subscribe((records) => {
      this.mutations = records.mutations;
      this.dateRangeUpdate();
    });
  }

  dateRangeUpdate() {
    this.chartOptions = {
      series: [{
        name: 'Amount',
        type: 'area',
        data: this.mutations.map(mutation => ({
          mutation,
          timestamp: getDateOfTransaction(mutation.transactionTimestamp),
        }))
          .filter(({ timestamp }) =>
            timestamp.isAfter(this.range.controls['start'].value) &&
            timestamp.isBefore(this.range.controls['end'].value)
          )
          .map(({ mutation, timestamp }) => ({
            x: timestamp.valueOf(),
            y: mutation.balance,
            description: mutation.description || mutation.accountName
          }))
      }]
    }
  }
}
