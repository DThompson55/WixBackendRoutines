
import wixData from 'wix-data';

export function updateBanner() {
	wixData.query('ImportantInformation')
		.eq('show',true)
		.find()
		.then((results) => {
			var items = results.items;
			var today = new Date();
			today.setHours(0,0,0,0);
			//console.log(today);
			//
			// walk through the items, and get the date they fall on, this month and next
			//
			var update = false;
			for (var i = 0 ; i < items.length; i++){
				var anItem = items[i];
				if (! anItem.show) continue;
				if (! anItem.expirationDate) continue;
				var expDate = expDate = new Date(anItem.expirationDate);
				//console.log(expDate, anItem);

				if ( today >= expDate) {
					anItem.show = false;
					update = true;
				}	
			}
			if (update){
				wixData.bulkUpdate('ImportantInformation',items);
			}
		})
	}