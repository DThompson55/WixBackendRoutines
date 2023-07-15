import wixData from 'wix-data';

export function trimShortDescription() {
    wixData.query('Happenings')
        .limit(100)
        .eq('isExpired',false)
        .or(
            wixData.query("Happenings")
                .eq('isExpired',undefined)
        )
        .find()
        .then((results) => {
            var characterLimit = 141;
            var isChanged = false;

            for (var i = 0 ; i < results.items.length; i++){
                var result = results.items[i];
                let x = result.longdescription;
                if (x === undefined){ 
                    x = "";
                    result.longdescription = "";
                    result.generatedDescription = ""
                    isChanged = true;
                }

                if (x.length > (characterLimit+3)) {
                    x = x.slice(0, characterLimit) + "...";
                    result.generatedDescription = x;
                    isChanged = true;
                }
            }
        
            console.log("Calling Update",isChanged)
            if (isChanged)
            wixData.bulkUpdate('Happenings', results.items)
            .then ((bulkResult) => {
                console.log(bulkResult);
            })
            .catch( (err) => {
                console.log(err);
            });
    })
}