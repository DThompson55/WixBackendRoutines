
import wixData from 'wix-data';

export function updateRepeatingEvents() {

var not_happenings = [];

wixData.query('Happenings') // first find all the "No " events in case something got canceled.
	.limit(1000)
	.eq('isExpired',false)
	.or(
		wixData.query("Happenings")
			.eq('isExpired',undefined)
	)
	.startsWith("title","No ")
		.or(
		wixData.query("Happenings")
			.startsWith("title","NO ")
	)
	.find()
	.then((results) => {
		for (var i = 0 ; i < results.items.length ; i++ ){
			var date =   new Date(results.items[i].date);
        	date.setHours(0,0,0,0);
			not_happenings[i] = {'date':date.getTime(), 'name':(results.items[i].title).substring(3)}
		}

		console.log(not_happenings);

wixData.query('Events')
    .ge('weekOfMonth',0)
    .find()
    .then((results) => {
//console.log(results.items);
var events = results.items;

function eventToHappening(anEvent, aDate, aHappening){		
	var i = 0;
	for ( i = 0 ; i < not_happenings.length; i++ ){
		if (not_happenings[i].date === aDate.getTime()){
				console.log("Match?",anEvent.title, not_happenings[i].name,(not_happenings[i].name).startsWith(anEvent.title))
			if ((not_happenings[i].name).startsWith(anEvent.title)){
						console.log("Match",anEvent.title, not_happenings[i])
						aHappening.isExpired = true; // expire the event if it is not happening this time.
			} else {
				console.log("Sorry");
			}
		}
	}

	aHappening.title = anEvent.title;
	aHappening.description = anEvent.shortdescription+" "+anEvent.desc2;
	aHappening.longdescription = anEvent.longdescription;
	aHappening.date = aDate.toISOString().split('T')[0];
	//aHappening.times = "";//anEvent.shortdescription+" "+anEvent.desc2;
	aHappening.imageField = anEvent.image;
//    console.log("E->H",aHappening);
	return aHappening;
    }

function setCalendar(anEvent, aDate, uniquifer){

//    console.log(anEvent.title, aDate)
	var effDate = null;
	if (anEvent.effectiveDate) effDate = new Date(anEvent.effectiveDate);
	var expDate = null;
	if (anEvent.expirationDate) expDate = new Date(anEvent.expirationDate);

	if (effDate && expDate){
		if (effDate > expDate){
			if (( aDate >= expDate) && ( aDate < effDate)) return; // expired but not effective yet
		} else {
			if (( aDate < effDate) || ( aDate >= expDate)) return; // not effective yet or expired
		}
	} else 	if (effDate){
			if ( aDate < effDate)  return; // not effective yet
	} else 	if (expDate){
			if ( aDate >= expDate)  return; // expired 
	} 

	uniquifer = "_"+uniquifer;
	wixData.query('Happenings')
    .eq('repeatedEventID',anEvent._id+uniquifer)
    .find()
    .then((results) => {
        //console.log("looking for the unique happening found",results.totalCount)	

		if (results.totalCount == 0){ // doesn't exist, so we can add it
			var aHappening = eventToHappening (anEvent, aDate, {});
				aHappening.repeatedEventID = anEvent._id+uniquifer;

			wixData.insert('Happenings', aHappening)
				.then((result) => {
				//console.log("Added",result);
				})
				.catch((err) => {
				console.log(err);
				});

		} else { // it does exist so we update it
			//console.log("calling E->H");	
			var aHappening = eventToHappening (anEvent, aDate, results.items[0]);
			//console.log(aHappening,results.items,results.totalCount)
			//console.log("Update to this value",aHappening);
			wixData.update("Happenings", aHappening)
			.then((results) => {
				//console.log("Updated",results); //see item below
			})
			.catch((err) => {
				console.log(err);
			});
		}			
	 })
    .catch((error) => {
      console.log("no existing event",error);
    });
}

var td = new Date();
var today = new Date();
today.setHours(0,0,0,0);
td.setHours(0,0,0,0);
setupRecurringDates(td)
var mon = td.getMonth();
if (mon < 12) td.setMonth(mon+1)
//setupRecurringDates(td)

function setupRecurringDates(td){
	//
	// This builds a list of the n'th day of the month
	// so if you want the 2nd tuesday, you go to the 2nd cell, 
	// and the 2nd element there, and that gives you the date
	//
	const dom = [[[],[],[],[],[],[],[]],[[],[],[],[],[],[],[]]]
	var mon = td.getMonth()
	var i; // count a year's worth of weeks
	for (i = 1 ; i < 32; i++){ 
		td.setDate(i);  //  first day of the month
		var dow = td.getDay();
		if (mon != td.getMonth()){
			break;
		}
		dom[0][dow].push(new Date(td));
	}
	// next month
	td.setDate(1)
	td.setMonth(mon+1)
	mon = td.getMonth()
	for (i = 1 ; i < 32; i++){ 
		td.setDate(i);  //  first day of the month
		var dow = td.getDay();
		if (mon != td.getMonth()){
			break;
		}
		dom[1][dow].push(new Date(td));
	}
	//
	// walk through the events, and get the date they fall on, this month and next
	//

	for (i = 0 ; i < events.length; i++){

	//	if (events[i].isAffinity) continue;
		if (events[i].isDisabled) continue;
		if (events[i].doNotShowInUpcomingList) continue;

	//	if (events[i].isHidden) continue;
        //console.log(i,events[i].title,w,d);

		var d = events[i].dayOfWeek; 
		if ( d == 7 ) d = 0; 					// take care of sunday
		var w = events[i].weekOfMonth;		    // 0 means every week, otherwise the week of the month.
        if (w === undefined) continue;

		if (dom[0][d] === undefined) continue; // there are days in the array that aren't part of the month
		if (w == 0){
			try {
				var n = 4;
		 		for (w = 0 ; w < (dom[0][d]).length ; w++){ // add this month's events
			 		var x = (dom[0][d])[w];
			 		if (x >= today){
						setCalendar(events[i],(dom[0][d])[w],w);
						n--;
					}
				 }
		 		for (w = 0 ; w < n ; w++){ // add some of next month's events
			 		var oldEventDate = new Date(events[i].date);
			 		var newEventDate = (dom[1][d])[w];
			 		oldEventDate.setHours(0,0,0,0);
			 		if (oldEventDate != newEventDate){ // if we're reusing the event, make it unexpired
			 			events[i].isExpired = false;
			 		}
			 		var x = (dom[1][d])[w];
					setCalendar(events[i],(dom[1][d])[w],w);
				}
			} catch(err){console.log("end of month")} 		
		} else {
			var x = (dom[0][d])[w-1];
			//console.log("Compare",w,d,dom[0][d],x,today,( x >= today ))
			if ( x >= today ) {
				setCalendar(events[i],(dom[0][d])[w-1],99); // this month
			} else {
				setCalendar(events[i],(dom[1][d])[w-1],99); // next month
			}
		}
	}
}




	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code

//      console.log(results.items);
    })
    .catch((error) => {
      console.log(error);
    });

	})
}

