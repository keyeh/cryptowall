module.exports = {

	sortBook: function (orderBook) {
		return orderBook.sort(function(a,b) {
		   if (a[0] < b[0]) return -1;
		   if (a[0] > b[0]) return 1;
		   return 0;
		});
	},

	getBids: function (orderBook) {
	 	var bidsBook = [];
	 	while (orderBook[bidsBook.length][2] > 0) {
	 		bidsBook.push(orderBook[bidsBook.length]);
	 	}
	 	return bidsBook;
	 },

	 getAsks: function (orderBook) {
	 	var asksBook = [];
	 	while (orderBook[orderBook.length-1-asksBook.length][2] < 0) {
	 		asksBook.push(orderBook[orderBook.length-1-asksBook.length]);
	 	}
	 	return this.sortBook(asksBook);
	 },


	calculateCoinsTo: function (orderBook, price) {
		var asksBook = this.getAsks(orderBook);
		var bidsBook = this.getBids(orderBook);
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
	},


	updateLocalBook: function (localBook, updateData) {
		// Find entry to update in local order book
		for (var i = localBook.length - 1; i >= 0; i--) {
			// If an price entry in local book matches the update's price
			if (localBook[i][0] == updateData[0]) {
				// Update
				if (updateData[1] == 0) {
					// Remove order from book if count = 0
					localBook.splice(i, 1)
				} else {
					// Otherwise, replace old order in book
					localBook[i] = updateData;
				}
				localBook = this.sortBook(localBook);
				return localBook;
			}
		}

		// If update doesn't match anything, add it to the book.
		localBook.push(updateData);
		localBook = this.sortBook(localBook);
	}
};