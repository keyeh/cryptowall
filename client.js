$(function() {

	$.getJSON('http://192.168.188.131:3000/historical', function (historicalData) {

		var ws = new WebSocket('ws://192.168.188.131:8080');
		Highcharts.setOptions({
			global: {
				useUTC: true
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
						var downUpSeries = this.series[3];
						ws.onmessage = function(event) {
							var wspacket = JSON.parse(event.data);

							if (wspacket.channel == 'updates') {
								priceSeries.addPoint([wspacket.timestamp, wspacket.price], true, true);
								minus50Series.addPoint([wspacket.timestamp, wspacket.minus50], true, true);
								plus50Series.addPoint([wspacket.timestamp, wspacket.plus50], true, true);
								downUpSeries.addPoint([wspacket.timestamp, wspacket.minus50/wspacket.plus50], true, true);
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


			yAxis: [
		        { // Primary yAxis
		        	labels: {
		        		format: '{value} BTC',
		        		align: 'left'
		        	},
		            // offset : 70
		        }, { // Secondary yAxis
		        	labels: {
		        		format: '{value} USD',
		        	},
		        	minRange: 100,
		        	opposite:false

		        }, { // 3rd yAxis
		        	opposite:false,
		        	min: 0,
		        	minRange: 4,
		        }
	        ],
	        legend: {
	        	enabled: true,
	        	align: 'center',
	        	verticalAlign: 'top',
	        	layout: 'horizontal',
	        	x: 0,
	        	y: 20
	        },

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
	        	color: 'gray',
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
	        },
	        {
	        	name: 'Down/Up Ratio',
	        	color: 'tan',
	        	yAxis: 2,
	        	data: (function () {
	                // generate an array of random data
	                var data = []
	                for (var i = 0; i < historicalData.minus50s.length; i++) {
	                	data.push([
	                		historicalData.minus50s[i][0],
	                		historicalData.minus50s[i][1]/historicalData.plus50s[i][1],
	                	])
	                }
	                return data;
	            }())
	        },
	        ]
	    });



	});
});