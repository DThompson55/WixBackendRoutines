import wixData from 'wix-data';
const oos = "6463b64c994b2ac5430f5907"

const startOfQuarter = getStartOfPrecedingQuarter();

export function musicReport (){
  const bag = [];
  console.log("The Start Date is",startOfQuarter);
  bag.push({"type":"PARAGRAPH","id":"foo","nodes":[{"type":"TEXT","id":"","nodes":[],"textData":{"text":"The Music Report lists all of the music performed at UUSE Sunday Services during the reporting period Starting "+startOfQuarter+" today is "+new Date(),"decorations":[]}}],"headingData":{"level":6,"textStyle":{"textAlignment":"AUTO"},"indentation":0}});

  wixData.query('Blog/Posts') 
  .hasSome("categories",[oos])
  .ascending("publishedDate")
  .find()
  .then((response) => {
    work(response, 1, bag, response.totalPages);
    })
  console.log("Done")
}


const keywords = ["SONG","HYMN","PRELUDE","POSTLUDE","MUSIC","MEDITATION","MEDLEY","CHANT"]


function blogParser(richContent, bag){
  
  var sectionTitle = [];
  var inMusic = false;
  
  if (richContent == undefined) return;

  richContent.nodes.forEach((node)=>{
    try {
      if (node.type === "PARAGRAPH") {
        if ((node.nodes.length > 0) && (node.nodes[0].textData) && (node.nodes[0].textData.decorations.length>0)) {
            if (node.nodes[0].textData.decorations[0].type === "BOLD") {
              //console.log("\n"+node.nodes[0].textData.text);
              sectionTitle.push(node.nodes[0].textData.text);
              inMusic = false;
            } 
          }
        if ((node.paragraphData.textStyle.textAlignment === "CENTER")){
            if ( sectionTitle.length > 0 ){
              var title = sectionTitle.pop();

              if (keywords.some(keyword => title.toUpperCase().includes(keyword))){
                addToBag(title+" ---------------------", bag);
                inMusic = true;
              }
              sectionTitle = [];
            } 
            if ((inMusic) && (node.nodes.length > 0))
            if (!containsSkippableWords(node.nodes[0].textData.text))
            addToBag("- "+node.nodes[0].textData.text, bag);
        } 
      }
    }
    catch(error){
      console.log("trouble in the parser",error);
    }
  })
}

function containsSkippableWords(inputString) {
  const skippableWords = ["sung by", "played by", "led by","performed by", "musicians", "Hymn Leader"];
  const lowerCaseInput = inputString.toLowerCase();
  return skippableWords.some(word =>
    lowerCaseInput.includes(word.toLowerCase())
  );
}


function getStartOfPrecedingQuarter() {
  var today = new Date();
  var currentMonth = today.getMonth();
  var startOfQuarter;

  // Calculate the start of the quarter
  if (currentMonth < 3) {
    // January to March
    startOfQuarter = new Date(today.getFullYear() - 1, 9, 1); // October 1 of last year
  } else if (currentMonth < 6) {
    // April to June
    startOfQuarter = new Date(today.getFullYear(), 0, 1); // January 1 of this year
  } else if (currentMonth < 9) {
    // July to September
    startOfQuarter = new Date(today.getFullYear(), 3, 1); // April 1 of this year
  } else {
    // October to December
    startOfQuarter = new Date(today.getFullYear(), 6, 1); // July 1 of this year
  }

  var Sept2023 = new Date("2023-08-15");
 
  if ( startOfQuarter < Sept2023 ) startOfQuarter = Sept2023;

  return startOfQuarter;
}

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

function addToBag(s, bag, verbose = false){
  bag.push(
    {"type":"PARAGRAPH","id":generateRandomString(),"nodes":[{"type":"TEXT","id":"","nodes":[],"textData":{"text":s,"decorations":[]}}],"paragraphData":{"textStyle":{"textAlignment":"AUTO"},"indentation":0}});
  if (verbose) console.log("Bag Size",bag.length,"Added",s)
}

function work(response, iteration, bag, pages){
  try{
    console.log("Work iteration",iteration,bag.length)  
    //if (iteration>=10)throw new Error("Runaway Train");
     console.log("Resp.Length",response.length);
    // console.log("Resp.items.length",response.items.length);
     console.log("Resp.TotalPages",response.totalPages);
     console.log("Resp.TotalCount",response.totalCount);
    // console.log("Resp.currentPage",response.currentPage);

    response.items.forEach((item)=>{
      if ( new Date(item.publishedDate) >= startOfQuarter) {
        console.log(item.publishedDate,item.title);
        addToBag("--------------------------------------------------------", bag);
        var dtt = item.title;
        addToBag(dtt, bag, true);
        blogParser(item.richContent, bag);
      }
    })  
    console.log("a puzzle",(iteration <= pages),iteration,pages)
    if (iteration < pages){
      console.log("Calling another iteration");
      response.next()
      .then((resp2) =>{
        console.log("NEXT Response",resp2)
        work(resp2, iteration+1, bag, pages)
        })
    } else {
      console.log("Not calling another iteration",response.currentPage)
      writeResults(bag);
    }
  } catch(error){
    console.log("That didn't work",error)
  }
}

function writeResults(bag){
    console.log("writing the report",bag.length);
        let richcontent = {nodes:bag};
        let data = {"_id":"e9f44573-e10c-4534-a4c1-d8d8b7ac6e55","title":"Music Report",richcontent,index:2};
        //console.log("Trying to open RichContent now")
        wixData.update('RichContent', data)
                .then((result) => {
                console.log("Updated",result);
                })
                .catch((err) => {
                console.log(err);
                });
}