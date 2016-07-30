module.exports = {

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
				return localBook;
			}
		}

		// If update doesn't match anything, add it to the book.
		localBook.push(updateData);
	}
};