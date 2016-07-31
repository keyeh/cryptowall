var jsonfile = require('jsonfile')
var file = './data.json'
var bookHistorical = [];
jsonfile.readFile(file, function(err, obj) {
  if (typeof obj !== 'undefined') {
	  bookHistorical = obj;
  }
});

var book = require('./book');

var WebSocket = require('ws');

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });
	
	wss.broadcast = function broadcast(data) {
		wss.clients.forEach(function each(client) {
			client.send(JSON.stringify(data));
		});
	};

var w = new WebSocket("wss://api2.bitfinex.com:3000/ws");

var subRequest = {
		"event": "subscribe",
		"channel": "book",
		"pair": "BTCUSD",
		"prec": "P2",
		"freq": "F1",
		"len":"100"
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
	}
	else if (typeof receivedData[1] == 'string' && receivedData[1] == 'hb') {
		// Heartbeat
	} else if(typeof receivedData[1] == 'number') {
		// Update order book
		orderData = receivedData;
		orderData.shift();	// Remove channel ID

		book.updateLocalBook(localBook, orderData);
		// bookHistorical.push(localBook);
		// jsonfile.writeFile(file, bookHistorical, function (err) {
		// });

		// console.log(book.calculateCoinsTo(localBook, 670));
		wss.broadcast({
			channel:'book',
			timestamp:new Date().getTime(),
			pair:subRequest.pair,
			book:localBook,
		});

	}
};