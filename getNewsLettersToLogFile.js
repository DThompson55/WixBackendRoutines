import wixData from 'wix-data';
import wixMedia from 'wix-media-backend';

//
// this is just a test function to look at how to aggregate all of the newsletters
// and some day maybe put them into their own collection
//


async function getContent(results, n){
    n++;
    if ( n > 30 ) return; // failsafe
    // handle the results
    for (var i = 0 ; i < results.items.length; i++){
        if (results.items[i].mediaType === "document") {
            if (((results.items[i].originalFileName).substr(0,6)) === "UUSENL"){
                console.log(n,i,results.items[i].originalFileName)
            } else {
//                console.log("not",n,i,results.items[i].originalFileName);
            }
        }
    }
    if (results.hasNext()) {
        results.next()
        .then(( results2 ) => {
            getContent(results2, n);
        }) 
    }
}


export function getNewsLetters(){
wixData.query("Media/Files")
  .limit(50)
  .find()
  .then( (results) => {
      var n = 0;
      getContent(results, n);
  });
}
 

