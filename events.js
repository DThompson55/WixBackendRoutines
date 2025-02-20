import wixData from 'wix-data';


//
// a simple date formatter that matches what WIX wants
//
function formatDate(date) {

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth()+1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export function wixCrm_onFormSubmit(form) {
  const validUsers = 
  ["18622e4b-b2a5-468f-81e6-125b2fe037fc", //Carol
  "ec4730ad-e548-4506-a477-ffeb2b7505ae",  //Uuse office
  "987966b9-a535-4b33-a728-90c0f783682a",  //Josh 
  "8335d4cb-4362-48aa-be6c-32e6a253f816",  // Sue Barlow
  "19b15b08-30ab-40ca-b883-fc009bc0c619",  //Paul Cocuzzo
  "dd5ec831-19f8-406c-b9bb-88b6a11fbe32",  //Danny
  "e6cad301-598c-4263-a6fa-59c24246f7fe",  //Nancy
  "5bbe6f1a-612c-4004-a2b4-3846459488ce"]; //uuseadmin and owner

  let formName = form.formName;
  let who = form.contactId;
  let data = form.submissionData;

  console.log("formName is",formName);
  console.log("Form Data is",data)

  const isValidUser = validUsers.some(element => element.includes(who));

  if (!isValidUser) {
    console.log("invalid user id",who);
    return;
  }

  if (formName === "BannerForm") {

    const messageField = data.find(obj => obj.fieldName === "message");
    const expDateField = data.find(obj => obj.fieldName === "date");

    var newMessage = null;
    if ( messageField != null ) newMessage = messageField.fieldValue;

    const newExpirationDate = new Date(expDateField.fieldValue);
    const sDate = formatDate(newExpirationDate);//"2023-mm-dd

    newExpirationDate.setHours(0,0,0,0);

    const newTitle = "Expires"+" "+(expDateField.fieldValue);

    wixData.query('ImportantInformation') // first find all the "No " events in case something got canceled.
      .eq('expirationDate',sDate)
      .find()
      .then((results) => {
        if (results.items.length != 0) {
          results.items.forEach((item) =>{
            if (newMessage == null){
              wixData.remove('ImportantInformation',item._id)
              .then((result) => {
                console.log("Removed",result);
              })
              .catch((err) => {
                console.log(err);
              });

            } else {            
              item.text = newMessage;
              wixData.update('ImportantInformation',item)
              .then((result) => {
                console.log("Updated",result);
              })
              .catch((err) => {
                console.log(err);
              });
            }
          })
        } else {
          const newItem = {title:newTitle, text:newMessage, expirationDate:sDate, show: true};
          wixData.insert('ImportantInformation',newItem)
          .then((result) => {
            console.log("Added",result);
          })
          .catch((err) => {
            console.log(err);
          });
        }
      })
    } 
      
  if (formName === "EventForm") {

    console.log(formName);

      const title = (data.find(obj => obj.fieldName === "title")).fieldValue;
      const date = (data.find(obj => obj.fieldName === "date")).fieldValue;
      const sDate = formatDate(new Date(date));//"2023-mm-dd
      const isService = false;
      const isExpired = false;
      const isFeatured = false;

      var longdescription = null;
      let descriptionField = (data.find(obj => obj.fieldName === "description"))
      if (descriptionField != null ) longdescription = descriptionField.fieldValue; 
      const newItem = {title, date:sDate, longdescription, isService, isExpired, isFeatured, generatedDescription:longdescription }

      console.log("is it null?",(longdescription === null))
      console.log("Desc",descriptionField);

      if (longdescription !== null) {
        try {
          wixData.query("Happenings")
          .eq('date',sDate)
          .contains('title',title)
          //.eq('isExpired',false)
          .find()
          .then((results) => {
            if ( results.items.length > 0){
              //update
              console.log("update");
              let item = results.items[0];
              item.longdescription = newItem.longdescription;
              item.generatedDescription = newItem.longdescription;
              item.isExpired = false;
              
              wixData.update('Happenings',item)
              .then((result) => {
                console.log("Updated",result);
              })
              .catch((err) => {
                console.log(err);
              });

            } else {
              //insert
              console.log("insert");
              wixData.insert('Happenings',newItem)
              .then((result) => {
                console.log("Added",result);
              })
              .catch((err) => {
                console.log(err);
              });


            }
          })
        } catch(error) {console.log(error)}
      }
    
      if (longdescription === null) {
        try {
          console.log("Deleting",title);
          wixData.query("Happenings")
          .eq('date',sDate)
          .contains('title',title)
          //.eq('isExpired',false)
          .find()
          .then((results) => {
            console.log("searching to delete ", results.length)
            var found = false;
            if ( results.items.length > 0){
            var item = results.items[0];
              console.log("Let's remove this one",item.title);
              item.isExpired = true;
              wixData.update('Happenings',item)
              .then((result) => {
                console.log("Expired",result);
              })
              .catch((err) => {
                console.log(err);
              });
            }
          })
        } catch(error){console.log("error2",error)}
      }
    }
  }
