var lastTimestamp;

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongourl = 'mongodb://root:zqjLckEe6EnSy77GPy4TTphp@ds139655.mlab.com:39655/cryptowall';

var fs = require('fs');

const http = require('http')  
const port = 3000

var book = require('./book');
var processHistorical = require('./historical');

var WebSocket = require('ws');

var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({ port: 8080 });


MongoClient.connect(mongourl, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', mongourl);

    // Get the documents collection
    var collection = db.collection('everything');



    // HTTP Stuff
    const requestHandler = (request, response) => {  
    	if (request.url == '/historical') {
    		collection.find({}, {'_id': false}).toArray(function (err, result) {
    			if (err) {
    				console.log(err);
    			} else if (result.length) {
    				response.setHeader('Access-Control-Allow-Origin', '*');
    				response.end(JSON.stringify(processHistorical.process(result)));
    			} else {
    				console.log('No document(s) found with defined "find" criteria!');
    			}
    		});
    	} else if (request.url == '/') {
    		fs.readFile('./index.html', function(error, content) {
    			if (error) {
    				response.writeHead(500);
    				response.end('500');
    			}
    			else {
    				response.writeHead(200, { 'Content-Type': 'text/html' });
    				response.end(content);
    			}
    		});
    	} else if (request.url == '/client.js') {
    		fs.readFile('./client.js', function(error, content) {
    			if (error) {
    				response.writeHead(500);
    				response.end('500');
    			}
    			else {
    				response.writeHead(200, { 'Content-Type': 'text/html' });
    				response.end(content);
    			}
    		});
    	} else {
    		response.writeHead(404);
				response.end();
    	}
    }

    const server = http.createServer(requestHandler)

    server.listen(port, (err) => {  
    	if (err) {
    		return console.log('something bad happened', err)
    	}

    	console.log(`server is listening on ${port}`)
    })



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
    	"freq": "F2",
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
		if ((new Date().getTime() - lastTimestamp) < 1500) {
			return
		}
		lastTimestamp = new Date().getTime();

		// Update order book
		orderData = receivedData;
		orderData.shift();	// Remove channel ID

		book.updateLocalBook(localBook, orderData);

		var asksBook = book.getAsks(localBook);
		var currentPrice = asksBook[0][0];


		var transmitObj = {
			channel:'updates',
			timestamp:new Date().getTime(),
			pair:subRequest.pair,
			price: currentPrice,
			plus10: book.calculateCoinsTo(localBook, currentPrice+10),
			minus10: book.calculateCoinsTo(localBook, currentPrice-10)
			plus25: book.calculateCoinsTo(localBook, currentPrice+25),
			minus25: book.calculateCoinsTo(localBook, currentPrice-25)
			plus50: book.calculateCoinsTo(localBook, currentPrice+50),
			minus50: book.calculateCoinsTo(localBook, currentPrice-50)
		}


		collection.insert(transmitObj, function (err, result) {
			if (err) {
				console.log(err);
			}
		});

		wss.broadcast(transmitObj);

	}
};





}
});