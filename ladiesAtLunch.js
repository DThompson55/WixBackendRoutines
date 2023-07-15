import wixData from 'wix-data';

//
// Ladies at Lunch alternates between thursdaya and fridays
// this looks at the text of the event, and if it has the word Friday
// it assumes the event is on a friday, and changes the calendar entry
// otherwise it assumes it's on thursday and leaves it alone.
//

export function ladiesAtLunch() {
    wixData.query('Happenings')
        .eq('title','Ladies At Lunch')
        .find()
        .then((results) => {
        for (var i = 0 ; i < results.items.length; i++){
            var result = results.items[i]; 
            var date = new Date(result.date)
            date.setHours(0,0,0,0);
            if (result.longdescription.indexOf(("Friday")) >= 0){
                if (date.getDay() == 4) { // is the date set to a Thursday?
                    date.setDate(date.getDate() + 1)        // if not, let's bump the date by one and try again, maybe friday?
                    date.setHours(0,0,0,0);
                    result.date = date.toISOString().split('T')[0];
                    wixData.update("Happenings", result)
                    .then((results) => {
                        console.log("Updated",results); //see item below
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                }
            } 
        }
    })
}