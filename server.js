var WebSocket = require('ws');
var w = new WebSocket("wss://api2.bitfinex.com:3000/ws");

w.on('open', function open() {
	w.send(JSON.stringify({
		"event": "subscribe",
		"channel": "book",
		"pair": "BTCUSD",
		"prec": "P2",
		"freq": "F2",
		"len":"100"
	}))
});

w.onmessage = function(msg) {
	receivedData = JSON.parse(msg.data);
	console.log(receivedData);
};