
import wixData from 'wix-data';
//
// this goes through all of the sunday services and sets a default OOS and image field
// Hard coding the default image and default OOS seems fragile, but simple for mow.
//
export function oosSync() {
    wixData.query('Happenings')
        .eq('isExpired',false)
        .eq('isService',true)
        .eq('document',null)
        .find()
        .then((results) => {
            for (var i = 0 ; i < results.items.length; i++){
                results.items[i].document = "649d74153b156faadbdd3da7";
                if (results.items[i].imageField == null){
                    results.items[i].imageField = "wix:image://v1/3ce235_1db382e294524efe87a3068f972e567e~mv2.png/closing%20words%20white%20w%20trans%20backing%201080p.png#originWidth=784&originHeight=441"
                }
            }
            // this is where we would create a placeholder OOS and attach it to the event record
                  
        wixData.bulkUpdate('Happenings', results.items)
        .then ((bulkResult) => {
            console.log(bulkResult);
        })
        .catch( (err) => {
            console.log(err);
        });
    })
}


