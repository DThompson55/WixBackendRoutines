import wixData from 'wix-data';

export function expireOldEvents() {
// expires old events
// if the event starts with the word "No " it removes the event
// it looks at upcoming sunday services and makes the next one featured.


    console.log("Running Expire Old Events");
    wixData.query('Happenings')
        .limit(100)
        .ne('isExpired',true)
        .ascending("date")
        .find()
        .then((results) => {
        var today = new Date();
        today.setHours(0,0,0,0);

        var isThereAFeaturedService = false;

        //if (results.totalCount > 90)   
        console.log("WARNING: The Regular Events Collection has "+results.totalCount+" items and needs to be trimmed");
        for (var i = 0 ; i < results.items.length; i++){
            if ( results.items[i].isFeatured === undefined) results.items[i].isFeatured = false;
            if ( results.items[i].isExpired === undefined) results.items[i].isExpired = false;
            if ( results.items[i].isService === undefined) results.items[i].isService = false;
            if ( results.items[i].isFuture === undefined) results.items[i].isFuture = false;

            var result = results.items[i]; 
            if (result.date) { // if it is not already expired, check to see if it should be
                let expirationDate = new Date(result.date);
                expirationDate.setHours(0,0,0,0);
                result.isExpired = (today.getTime() > expirationDate.getTime()); // assumes it is not currently expired based on query
                if (result.isExpired) {
                    console.log("setting isExpired",i,today,expirationDate, result.isExpired);
                    result.isFeatured = false;
                    const pattern = /^No (.*) (this week|this month)$/i;
                    var match = result.title.match(pattern);

                    if (match && (match[1].length > 1)) {
                        wixData.remove("Happenings", result._id)
                        .then((results) => {
                            console.log("Removed result.title",results); //see item below
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    } else {
                        wixData.update("Happenings", result)
                        .then((results) => {
                            console.log("Updated",results); //see item below
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    }
                } else { // promote the next sunday service to a featured event, 
                         // this works because the query was sorted in order
                    if (result.isService && (isThereAFeaturedService == false)){
                        isThereAFeaturedService = true;
                        result.isFeatured = true;
                        wixData.update("Happenings", result)
                        .then((results) => {
                            console.log("Updated to Featured Service",results); //see item below
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    }
                }
            }
        }
    })
}