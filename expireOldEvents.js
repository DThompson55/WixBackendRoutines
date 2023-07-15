import wixData from 'wix-data';

export function expireOldEvents() {
    wixData.query('Happenings')
        .limit(100)
        .eq('isExpired',false)
        .or(
            wixData.query("Happenings")
                .eq('isExpired',undefined)
        )
        .ascending("date")
        .find()
        .then((results) => {
        var today = new Date();
        today.setHours(0,0,0,0);

        var isThereAFeaturedService = false;

        if (results.totalCount > 90)   console.log("WARNING: The Regular Events Collection has "+results.totalCount+" items and needs to be trimmed");
        for (var i = 0 ; i < results.items.length; i++){
            if ( results.items[i].isFeatured === undefined) results.items[i].isFeatured = false;
            if ( results.items[i].isExpired === undefined) results.items[i].isExpired = false;
            if ( results.items[i].isService === undefined) results.items[i].isService = false;

            var result = results.items[i]; 
            if (result.date) { // if it is not already expired, check to see if it should be
                let expirationDate = new Date(result.date);
                expirationDate.setHours(0,0,0,0);
                result.isExpired = (today.getTime() > expirationDate.getTime()); // assumes it is not currently expired based on query
                if (result.isExpired) {
                    console.log("setting isExpired",i,today,expirationDate, result.isExpired);
                    result.isFeatured = false;
                    wixData.update("Happenings", result)
                    .then((results) => {
                        console.log("Updated",results); //see item below
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                } else { // promote the next sunday service to a featured event, 
                         // this works because the query was sorted in order
                    if (result.isService && (isThereAFeaturedService == false)){
                        isThereAFeaturedService = true;
                        result.isFeatured = true;
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
        }
    })
}