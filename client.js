$(function() {

    $.getJSON('http://192.168.188.131:3000/historical', function (historicalData) {

		var ws = new WebSocket('ws://192.168.188.131:8080');
		Highcharts.setOptions({
			global: {
				useUTC: false
			},
			lang: {
	        	thousandsSep: ','
	    	}
		});

		// Create the chart
		$('#container').highcharts('StockChart', {
			chart: {
				events: {
					load: function() {
						var priceSeries = this.series[0];
						var minus50Series = this.series[1];
						var plus50Series = this.series[2];
						ws.onmessage = function(event) {
							var wspacket = JSON.parse(event.data);

							if (wspacket.channel == 'updates') {
								priceSeries.addPoint([wspacket.timestamp, wspacket.price], true, true);
								minus50Series.addPoint([wspacket.timestamp, wspacket.minus50], true, true);
								plus50Series.addPoint([wspacket.timestamp, wspacket.plus50], true, true);
							}
						}

					}
				}
			},

			xAxis: {
				type: 'datetime',
				minTickInterval: 60 * 1000 * 1,
				maxZoom: 60 * 1000 //1 minute
			},


	        yAxis: [{ // Primary yAxis
	            labels: {
	                format: '{value} BTC',
	            },

	        }, { // Secondary yAxis
	            labels: {
	                format: '{value} USD',
	            }

	        }],

			rangeSelector: {
				buttons: [{
					count: 1,
					type: 'minute',
					text: '1M'
				}, {
					count: 3,
					type: 'minute',
					text: '3M'
				}, {
					count: 5,
					type: 'minute',
					text: '5M'
				}, {
					count: 15,
					type: 'minute',
					text: '15M'
				}, {
					count: 30,
					type: 'minute',
					text: '30M'
				}, {
					count: 1,
					type: 'hour',
					text: '1H'
				}, {
					count: 2,
					type: 'hour',
					text: '2H'
				}, {
					count: 4,
					type: 'hour',
					text: '4H'
				}, {
					count: 6,
					type: 'hour',
					text: '6H'
				}, {
					count: 12,
					type: 'hour',
					text: '12H'
				}, {
					count: 1,
					type: 'day',
					text: '1H'
				}, {
					count: 3,
					type: 'day',
					text: '3H'
				}, {
					count: 1,
					type: 'week',
					text: '1W'
				}, {
					type: 'all',
					text: 'All'
				}],
				inputEnabled: false,
				selected: 5
			},

			title: {
				text: 'Bitfinex BTC required to move price up/down $50'
			},

			exporting: {
				enabled: false
			},

			series: [
				{
					name: 'BTCUSD',
					color: 'black',
					yAxis: 1,
					data: historicalData.prices
				},
				{
					name: 'BTC needed to go down $50',
					color: 'red',
					yAxis: 0,
					data: historicalData.minus50s
				},
				{
					name: 'BTC needed to go up $50',
					color: 'green',
					yAxis: 0,
					data: historicalData.plus50s
				}
			]
		});



    });
});