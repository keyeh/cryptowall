function sortBook(orderBook) {
	return orderBook.sort(function(a,b) {
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
 	while (orderBook[orderBook.length-1-asksBook.length][2] < 0) {
 		asksBook.push(orderBook[orderBook.length-1-asksBook.length]);
 	}
 	return sortBook(asksBook);
 }

function calculateCoinsTo(orderBook, price) {
	var asksBook = getAsks(orderBook);
	var bidsBook = getBids(orderBook);
	var sum = 0;
	if (price >= bidsBook[0][0] && price <= bidsBook[bidsBook.length-1][0]) {
		// Price is a bid
		for (var i = bidsBook.length - 1; bidsBook[i][0] >= price; i--) {
			sum += bidsBook[i][2]
		}
		return sum;
	}
	else if (price >= asksBook[0][0] && price <= asksBook[asksBook.length-1][0]) {
		// Price is an ask
		for (var i = 0; asksBook[i][0] <= price; i++) {
			sum += asksBook[i][2]
		}
		return sum;
	}
}


var WebSocket = require('ws');
var w = new WebSocket("wss://api2.bitfinex.com:3000/ws");

var subRequest = {
		"event": "subscribe",
		"channel": "book",
		"pair": "BTCUSD",
		"prec": "P2",
		"freq": "F0",
		"len":"25"
	}

var subInfo;
var localBook;

w.on('open', function open() {
	w.send(JSON.stringify(subRequest))
});

w.onmessage = function(msg) {
	receivedData = JSON.parse(msg.data);

	// Save subscription info
	if (receivedData.event == 'subscribed') {
		subInfo = receivedData;
	}
	// Save full book
	else if (typeof receivedData[1] == 'object' &&
		receivedData[1].length == parseInt(subRequest.len)*2) {

		localBook = receivedData[1];
		localBook = sortBook(localBook);
	}
	else if (typeof receivedData[1] == 'string' && receivedData[1] == 'hb') {
		// Heartbeat
	} else if(typeof receivedData[1] == 'number') {
		// Update order book

		// Find entry to update in local order book
		for (var i = localBook.length - 1; i >= 0; i--) {
			// If the price entry in local book matches the update's price
			if (localBook[i][0] == receivedData[1]) {
				// Update
				console.log("updating book");
				localBook[i][0] = receivedData[1];	//Price
				localBook[i][1] = receivedData[2];	//Count
				localBook[i][2] = receivedData[3];	//Amount
			}
		}
		localBook = sortBook(localBook);
		
		console.log(calculateCoinsTo(localBook, 670));
	}
};