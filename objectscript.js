$(document).ready(function($) {

//opens the only link on this page in new window
$('a').click(function() {
	$(this).attr('target', '_blank');
}); 

//create a Clock object that holds a Date object, with the current time set as a method instead of a static variable

function Clock(gmtOffset, bigCity) {
	this.bigCity = bigCity;
	this.daypart = ""; //placeholder for AM/PM	
	this.gmtOffset = gmtOffset;
	var tempId = bigCity.replace(/[^a-zA-Z0-9]/g,"")//regex to strip punctuation and spaces 
	this.refID = tempId.charAt(0).toLowerCase()+tempId.slice(1); 
	//refID is built from provided city names, but it formats it for use as an HTML ID by stripping punctuation and spaces, and then making it camel-case
};

//methods added to Clock.prototype rather than Clock constructor to save memory

Clock.prototype.offsetter = function(offset) {
	//function to create a UTC variable to deal with timezone offsets that aren't integers, which will affect both hours and minutes
	var coreTime = new Date();
	//get the current UTC time (in ms) by taking the current local time and adding back the local gmt offset
	var utc = coreTime.getTime()+(coreTime.getTimezoneOffset() * 60000);
	var now = new Date(utc + (3600000*offset));
	return now;
};

Clock.prototype.showSeconds = function() {
	var currentSeconds = this.offsetter(this.gmtOffset).getSeconds();
	if (currentSeconds < 10) {
		currentSeconds = "0"+currentSeconds;
	}
	return currentSeconds;
};

Clock.prototype.showMinutes = function() {
	var currentMinutes = this.offsetter(this.gmtOffset).getMinutes();
	if (currentMinutes < 10) {
		currentMinutes = "0"+currentMinutes;
	}
	return currentMinutes;
};

Clock.prototype.showHours = function() {
	var currentHours = this.offsetter(this.gmtOffset).getHours();
	if (currentHours > 12) {
		currentHours = currentHours - 12;
		this.daypart = "PM";
	} else {
		this.daypart = "AM";
	}
	return currentHours;
};

//create some new time-zone objects that inherit from Clock
var greenwichClock = new Clock(0, "GMT");
var torontoClock = new Clock(-4, "Toronto");
var tokyoClock = new Clock (9, "Tokyo");
var grandmaClock = new Clock (1, "Grandma's House");
var losangelesClock = new Clock (-8, "Los Angeles");
var clientClock = new Clock (-5, "Big Client");

//create an array that holds all the clocks that inherit from clock, including the new objects created by the clockMaker function below
var citiesArray = [greenwichClock, torontoClock, tokyoClock, losangelesClock, grandmaClock, clientClock];

//function for displaying clock data into the DOM
var clocksDisplay = function() {
	citiesArray.forEach(function(city) {
		var cityId = city.refID;
		$("#cities").append("<li class='city' id='"+cityId+"'>Loading...<i class='icon-remove-sign' /></li>");
		//The "Loading..." is for the clocksUpdate function, which requires a non-empty text node to initialize
		$( "#cities" ).sortable();
	});
};

clocksDisplay();//initial call to set up container <li> tags
	
//function for updating the clock data displayed in the DOM
var clocksUpdate = function() {
	citiesArray.forEach(function(city) {
		var reference = city.refID;
		//saves the value of the "bigCity" property of each object in the array as "name" 
		$("#"+reference).contents().filter(function() {
   			return this.nodeType == 3;   //Filtering by text node
				}).replaceWith(city.bigCity+ " | " +			
					city.showHours()+ ":" + 
					city.showMinutes()+ ":" + 
					city.showSeconds()+ "  " + 
					city.daypart)		
		});
};

//old clocksUpdate method for comparison
	// var $cityCluster = $(".city");
	// //checks the id of the selected elements against the bigCity property of the cities array elements
	// $cityCluster.each(function(index) {
	// 	for (var i=0; i<citiesArray.length; i++) {
	// 		if ($(this).attr("id") === citiesArray[i].bigCity) {
	// 			//contents are filtererd to modify the <li> tage text but not nested elements
	// 			$(this).contents().filter(function() {
 //    					return this.nodeType == 3;   //Filtering by text node
	// 				}).replaceWith(citiesArray[i].bigCity+ " | " +			
	// 				citiesArray[i].showHours()+ ":" + 
	// 				citiesArray[i].showMinutes()+ ":" + 
	// 				citiesArray[i].showSeconds()+ "  " + 
	// 				citiesArray[i].daypart)		
	// 		}
	// 	}
 //    });
// };

setInterval(clocksUpdate, 1000); //keeps time in sync by re-checking the time value every second

//function for generating new clock objects using <input> fields to provide a city name and gmt offset
var clockMaker = function(){
	var $cityNameInput = $("#addCity").val();
	var $gmtOffsetInput;
	if ($("#addOffsetManual").val() != "") {
		$gmtOffsetInput = $("#addOffsetManual").val();
	} else {
		$gmtOffsetInput = $("#addOffsetDropdown option:selected").val();
	}
	//checks if the value passed to the offset text field is outside of the acceptable range, or not a number
	if (isNaN($gmtOffsetInput) || $gmtOffsetInput < -12 || $gmtOffsetInput >12) {
		alert("GMT Offset must be a number between -12 and +12")
		throw new Error("GMT wrong type or out of range!");
	} else {
		//creates a new object that inherits from Clock	
		var o = new Clock($gmtOffsetInput, $cityNameInput);
		//adds it to the cities array for later display via incrementing
		//unshift places the new item at the first position at the array, for easier recognition that something happened
		citiesArray.unshift(o);
		return o;	
	};	
};

//on clicking "submit", adds new clock objects into the display
$("#submitCity").click(function(){
	clockMaker(); //creates a new clock object
	var cityId = citiesArray[0].refID;
	//prepends a <li> tag with the appropriate cityID for the new clock object now at the front of the array
	$("#cities").prepend($("<li class='city' id='"+cityId+"'>Loading...<i class='icon-remove-sign' /></li>"))
	//sets the text for the new li (as eq(o) of the containing element) relative to the first item in the cities array
	//matching by ID is not required for the initial population of the time, only for the once-a-second time update
	$(".city :first").contents().filter(function(){
		return this.nodeType == 3; //same filtering method as earlier
		}).replaceWith(citiesArray[0].bigCity+ " | " +
			citiesArray[0].showHours()+ ":" + 
			citiesArray[0].showMinutes()+ ":" + 
			citiesArray[0].showSeconds()+ "  " + 
			citiesArray[0].daypart);
	$("#addCity").val(""); //resets for both input fields to clear values
	$("#addOffsetManual").val("");
})


//function to remove clocks from the display when clicking the "remove" icon
$("#cities").on("click", ".icon-remove-sign", function(event){
  	$(this).parent(".city").remove();
});


});