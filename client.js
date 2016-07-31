function sortBook(orderBook) {
	return orderBook.sort(function(a, b) {
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		return 0;
	});
}


function getBids(orderBook) {
	var bidsBook = [];
	while (orderBook[bidsBook.length][2] > 0) {
		bidsBook.push(orderBook[bidsBook.length]);
	}
	return bidsBook;
}

function getAsks(orderBook) {
	var asksBook = [];
	while (orderBook[orderBook.length - 1 - asksBook.length][2] < 0) {
		asksBook.push(orderBook[orderBook.length - 1 - asksBook.length]);
	}
	return this.sortBook(asksBook);
}

function calculateCoinsTo(orderBook, price) {
	var asksBook = this.getAsks(orderBook);
	var bidsBook = this.getBids(orderBook);
	var sum = 0;
	if (price >= bidsBook[0][0] && price <= bidsBook[bidsBook.length - 1][0]) {
		// Price is a bid
		for (var i = bidsBook.length - 1; bidsBook[i][0] >= price; i--) {
			sum += bidsBook[i][2]
		}
		return Math.round(sum*Math.pow(10,4))/Math.pow(10,4);
	} else if (price >= asksBook[0][0] && price <= asksBook[asksBook.length - 1][0]) {
		// Price is an ask
		for (var i = 0; asksBook[i][0] <= price; i++) {
			sum += asksBook[i][2]
		}
		return Math.round(sum*Math.pow(10,4))/Math.pow(10,4) * -1;
	}
}


$(function() {
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

					var coinsToLowSeries = this.series[0];
					var coinsToHighSeries = this.series[1];
					ws.onmessage = function(event) {
						var wspacket = JSON.parse(event.data);
						var sortedBook = sortBook(wspacket.book);

						var asksBook = getAsks(sortedBook);

						var lowPrice = asksBook[0][0]-50;
						var highPrice = asksBook[0][0]+50;

						var x = wspacket.timestamp,
							y = calculateCoinsTo(sortedBook, lowPrice);
						
						coinsToLowSeries.addPoint([x, y], true, true);
						
						y = calculateCoinsTo(sortedBook, highPrice);
						coinsToHighSeries.addPoint([x, y], true, true);
					}

				}
			}
		},

		xAxis: {
			type: 'datetime',
			minTickInterval: 60 * 1000 * 1,
			maxZoom: 60 * 1000 //1 minute
		},
		rangeSelector: {
			buttons: [{
				count: 1,
				type: 'minute',
				text: '1M'
			}, {
				count: 5,
				type: 'minute',
				text: '5M'
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false,
			selected: 0
		},

		title: {
			text: 'Bitfinex coins to go down $50 & go up $50'
		},

		exporting: {
			enabled: false
		},

		series: [
			{
				name: 'Coins to go down $50',
				color: 'red',
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -999; i <= 0; i += 1) {
						data.push([
							time + i * 1000,
							0
						]);
					}
					return data;
				}())
			},
			{
				name: 'Coins to go up $50',
				color: 'green',
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -999; i <= 0; i += 1) {
						data.push([
							time + i * 1000,
							0
						]);
					}
					return data;
				}())
			}
		]
	});

});