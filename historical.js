module.exports = {

	process: function (data) {
		

		var priceSeriesData = [];
		var minus50SeriesData = [];
		var plus50SeriesData = [];
		for (var i = 0; i < data.length; i++) {
			priceSeriesData.push([data[i].timestamp, data[i].price]);
			minus50SeriesData.push([data[i].timestamp, data[i].minus50]);
			plus50SeriesData.push([data[i].timestamp, data[i].plus50]);
		}

		return {
			prices: priceSeriesData,
			minus50s: minus50SeriesData,
			plus50s: plus50SeriesData
		}

	}

};