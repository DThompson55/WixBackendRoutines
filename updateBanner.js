
import wixData from 'wix-data';

export function updateBanner() {
	console.log("Running Update Banner");
	wixData.query('ImportantInformation')
		.eq('show',true)
		.find()
		.then((results) => {
			var items = results.items;
			var update = false;
			items.forEach((anItem) =>{
				var today = new Date();
				today.setHours(0,0,0,0);
				var expDate =  new Date(anItem.expirationDate);
				expDate.setHours(0,0,0,0);
				if ( today > expDate) {
					anItem.show = false;
					anItem.title = anItem.title.replace(new RegExp("Expires", 'gi'), "Expired");
					update = true;
				}	
			})
			if (update){
				wixData.bulkUpdate('ImportantInformation',items);
			}
		})
	}