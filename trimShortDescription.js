import wixData from 'wix-data';


function redactions(text) {
  // Regular expression to match US phone numbers
  const regex = /\b(\d{3})([-.]|\s)?(\d{3})([-.]|\s)?(\d{4})\b/g;
  var text = text.replace(regex, "860-646-5151");
  // Regular expression to match email addresses
  const regex2 = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (text.indexOf("@uuse.org") <0 )
  text = text.replace(regex2, "uuseoffice@uuse.org");
  return text;
}


export function trimShortDescription() {
    console.log("Running Trim Short Desciptions");
    wixData.query('Happenings')
        .limit(100)
        .ne('isExpired',true)
        .find()
        .then((results) => {
            var characterLimit = 181;
            var isChanged = false;
            var filtered = []

            results.items.forEach((result)=>{
                
                let x = result.longdescription;
                if (x === undefined){ 
                    x = "";
                    result.longdescription = "";
                    result.generatedDescription = ""
                    isChanged = true;
                    filtered.push(result);
                    console.log("1",result);
                }

                if (x.length > (characterLimit+3)) {
                    x = x.slice(0, characterLimit) + "...";
                    if (x !== result.generatedDescription){
                        result.generatedDescription = x;
                        isChanged = true;
                        filtered.push(result);
                        console.log("2",result);
                    }
                }
            })

            console.log("Calling Update",isChanged)
            if (isChanged)
            wixData.bulkUpdate('Happenings', filtered)
            .then ((bulkResult) => {
                console.log(bulkResult);
            })
            .catch( (err) => {
                console.log(err);
            });
    })
}