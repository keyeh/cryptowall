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
		return sum;
	} else if (price >= asksBook[0][0] && price <= asksBook[asksBook.length - 1][0]) {
		// Price is an ask
		for (var i = 0; asksBook[i][0] <= price; i++) {
			sum += asksBook[i][2]
		}
		return sum * -1;
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

					var series = this.series[0];
					ws.onmessage = function(event) {
					var wspacket = JSON.parse(event.data);
						var sortedBook = sortBook(wspacket.book);
						var x = wspacket.timestamp,
							y = calculateCoinsTo(sortedBook, 640);
						series.addPoint([x, y], true, true);
					}

				}
			}
		},
		xAxis: {
			type: 'datetime',
			minTickInterval: 60 * 1000 * 1,
			maxZoom: 60 * 1000 //1 minute
		},
		yAxis: {
			min: 2000,
			max: 3000
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
			text: 'Live random data'
		},

		exporting: {
			enabled: false
		},

		series: [
			{
				name: 'Coins to $640',
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -999; i <= 0; i += 1) {
						data.push([
							time + i * 1000,
							Math.round(Math.random() * 200 + 2000)
						]);
					}
					return data;
				}())
			}
		]
	});

});