$(document).ready(function($) {

//opens the only link in new window
$("a").click(function() {
	$(this).attr('target', '_blank');
}); 

//create a Clock object that holds a Date object, with the current time set as a method instead of a static variable

function Clock(gmtOffset, bigCity) {
	this.bigCity = bigCity;
	this.daypart = ""; //placeholder for AM/PM	
	this.gmtOffset = gmtOffset;
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
var berlinClock = new Clock (1, "Berlin");
var losangelesClock = new Clock (-8, "Los Angeles");

//create an array that holds all the clocks that inherit from clock, including the new objects created by the clockMaker function below
var cities = [greenwichClock, torontoClock, tokyoClock, berlinClock, losangelesClock];

//function for displaying clock data into the DOM
var clocksDisplay = function() {
	cities.forEach(function(city) {
		$("#cities").append("<li class='city'>"+city.bigCity+ " | " +
			city.showHours()+ ":" + 
			city.showMinutes()+ ":" + 
			city.showSeconds()+ "  " +
			city.daypart+
		"</li>");
	});
};

clocksDisplay();//initial call to set up container <li> tags
	
//function for updating the clock data displayed in the DOM
var clocksUpdate = function() {
	$(".city").each(function(index, value) { 
    	$(this).text(cities[index].bigCity+ " | " +
			cities[index].showHours()+ ":" + 
			cities[index].showMinutes()+ ":" + 
			cities[index].showSeconds()+ "  " + 
			cities[index].daypart)
    });
};

setInterval(clocksUpdate, 1000); //keeps time in sync by re-checking the time value every second

//function for generating new clock objects requiring a city name and a gmt offset as arguments
var clockMaker = function(){
	$cityNameInput = $("#addCity").val();
	$gmtOffsetInput = $("#addOffset").val();
	//checks if the value passed to the offset text field is outside of the acceptable range, or not a number
	if (isNaN($gmtOffsetInput) || $gmtOffsetInput < -12 || $gmtOffsetInput >12) {
		alert("GMT Offset must be a number between -12 and +12")
	} else {
		//creates a new object that inherits from Clock	
		var o = new Clock($gmtOffsetInput, $cityNameInput);
		//adds it to the cities array for later display via incrementing
		//unshift places the new item at the first position at the array, for easier recognition that something happened
		cities.unshift(o);
		return o;	
	};	
};

//on clicking "submit", adds new clock objects into the display
$("#submitCity").click(function(){
	clockMaker(); //creates a new clock object
	$(".city").remove(); //clears the current <li class="city"> tags
	clocksDisplay(); //rebuilds the display
	//$("#addCity").text(""); //resets for both input fields to clear values
	//$("#addOffset").text("");
})



});