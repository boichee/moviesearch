// Object oriented implementation of MovieSearcher

// Object-based implementation

// Define a search object

var intervalID;

function omdbSearch() {
    this.args = []; // An array to hold omdbSearchArgument
    this.searchResults = {}; // Will hold the results of the search as an object (once parsed from JSON)
    this.regExForDate = /(?:19|20)\d{2}/; // for date string validation: makes sure date is 4 chars and between 1900-2099
    this.bSearchComplete = false; // Flag to indicate whether or not a search has been run.
}
 
omdbSearch.prototype = {

    createQuery: function() {
      // Creates a complete GET string out of all arguments available
      var separator = "?";
      var query = "";
      for (i = 0; i < this.args.length ; i++ ) {
      	if (i == 1) separator = "&";
      	query = query + separator + this.args[i].createArgString();
      }

      return "http://www.omdbapi.com/" + query;
    },

    createArg: function(argName, argKey, argValue) {
    	// Convenience function, creates a new omdbSearchArg and then adds to array
    	var oArg = new omdbSearchArg(argName, argKey, argValue);
    	this.args[this.args.length] = oArg;
    },

    addArg: function(oArg) {
    	// Adds an existing instance of omdbSearch Arg to the array

    	// First check to make sure oArg is an omdbSearchArg
    	if (oArg instanceof omdbSearchArg) {
    		this.args[this.args.length] = oArg;
    	} else {
    		// passed object is not an omdbSearchArg instance, throw exception
    		throw "Passed object must be an instance of omdbSearchArg";
    	}
    	
    },

    // Validation of Title, Date inputs
    // Title must be at least 3 characters
    validateArgs: function() {

    	for (var i = 0; i < this.args.length; i++) {
    		if (this.args[i].argName == "Title") {
    			// If we're looking at the title arg, make sure it's at least 3 chars long
    			return (this.args[i].argValue.length >= 3);
    		} 

    		if (this.args[i].argName == "Year") {
    			// Prep some date objects to compare against
				var latestDate = new Date(Date.now() + ((60 * 60 * 24 * 365) * 1000)); // Get next year
				var earliestDate = new Date(); earliestDate.setFullYear(1900); // Set the earliest date allowed to 1900

				// Set up a date object for the year entered by the user
				var enteredDate = new Date(); enteredDate.setFullYear(this.args[i].argValue);

				// Set up boolean expression to check against
				// true if year entered is between 1900 and next year
				return (enteredDate.getTime() > earliestDate.getTime() &&  
					enteredDate.getTime() < latestDate.getTime());

    		}
    	}

    	return true; // If we're here, then no errors found
    },

    searchAPI: function(callBack) {
    	$.getJSON(this.createQuery(), function( data ) {
    		MovieSearcher.searchResults = data;

    		// Once data has been returned, mark flag to true so DOM functions can take over
    		MovieSearcher.bSearchComplete = true; 

    		callBack();
    	});

    },

    // Convenience function, grabs the appropriate field from the result dataset
    getSearchResults: function() {
    	if (this.bSearchComplete) // Make sure a search has been run.
    		return this.searchResults.Search; // If search run, pull the "Search" array from the results and return.
    	else {
    		throw "You haven't run the API search yet or results have not yet been returned!";
    		return undefined;
    	}
    }

};


function omdbSearchArg (argName, argKey, argValue) {
	this.argName = argName;
	this.argKey = argKey;
	this.argValue = argValue;
}

omdbSearchArg.prototype = {
	createArgString: function() {
		// Converts to GET format (x=someValue)
		return this.argKey + "=" + encodeURIComponent(this.argValue);
	}
};

// Now set up the procedural part of the program
// 1. Get entered values from form fields
// 2. Add those values to the search object

function outputToConsole() {
	var searchResults = MovieSearcher.getSearchResults();

	for (var i = 0; i < searchResults.length; i++) {
			console.log("Result " + i + ":");
			console.log("Title: " + searchResults[i].Title);
			console.log("Year: " + searchResults[i].Year);
			console.log("imdbID: " + searchResults[i].imdbID);
			console.log("\n");
	}
}

function searchViewController() {
	if (MovieSearcher.bSearchComplete) {
		// If the search has been completed, then update the DOM
		layoutSearchResults(MovieSearcher.getSearchResults());
	
	} else 
		throw "Error. Async request not yet complete. Cannot output results.";

}

// This function does the layout of the search results
function layoutSearchResults (dataToProcess)
{
	
	// Prep the search results for display
	var counter = 0; // set up an iterative counter to start a row every 3 results
  	var items = [];
  	$.each( dataToProcess, 
		function( key, val ) {
			
			// Check what iteration we're at and add the appropriate row divs
			if ((counter != 0) && (counter % 3 == 0)) items.push('</div>');
			if (counter % 3 == 0) items.push('<div class="row">');
			counter++;
			
			items.push('<div class="col-md-4"><h2><a href="javascript:continueSearch(false, false, \''+val.imdbID+'\')">'+val.Title+'</a></h2><p>'+val.Year+'</p><p><a class="btn btn-default" href="javascript:continueSearch(false, false, \''+val.imdbID+'\')" role="button" target="_blank">Select this movie &raquo;</a></p></div>');	
	  	});
		
	// Now prep the display about the search itself
	var queryString = "";
	var searchTitle = $('#frm_movieQuery').get(0).value;
	var searchYear = $('#frm_movieYear').get(0).value;
	queryString = searchTitle;
	// Add the year if one was entered
	queryString = (searchYear && searchYear.length > 0) ? queryString + ' (' + searchYear + ')' : queryString;
	var queryDisplayHtml = '<h1>You searched for:</h1><h3>"'+ queryString +'"</h3><p>And got '+ counter +' results.</p>';
	
		// Output all prepped, so append the html in the appropriate locations on screen
		// First make sure those elements are empty.
		$('#mainOutput').empty();
		$('#detailsOutput').empty();
		
		// Now append
		$('#mainOutput').append(queryDisplayHtml);
		$('#detailsOutput').append(items.join(""));
		
		$('#sort_dropdown').css('display', 'block');
}

function searchOMDB() {

	// Initialize the global search object to its empty state;
	MovieSearcher = new omdbSearch();

	// Get the values entered into the form
	frm_title = $('#frm_movieQuery').get(0).value;
	frm_year = $('#frm_movieYear').get(0).value;

	// Create new arg objects for each value
	MovieSearcher.createArg('Title', 's', frm_title);

	// Check to make sure a year was entered, and if so, assign
	if (frm_year.length) {
		MovieSearcher.createArg('Year', 'y', frm_year);
	};
	

	// Check to make sure data was entered correctly by user, and if not, let them know
	if (!MovieSearcher.validateArgs()) {
		var d = new Date();
		alert ("Your input was incorrect. Title must be at least 3 letters, and year must be between 1900 and " + d.getFullYear() + ".");
		return false;
	}

	// callBack sets the view controller in motion after success (200) received from XHR request
	var callBack = function() {
		searchViewController();
	}

	// Run the search with the properties applied to the search object
	MovieSearcher.searchAPI(callBack);

}


// Event handlers to make it go!

$(document).ready(function() {
	$('#frm_doSearch').click(function() { searchOMDB(this.form) });
	$('#frm_doSearch').dblclick(function() { searchOMDB(this.form, 'dblClick')});
	$( "#frm_movieQuery" ).keypress(function( event ) {
	  if ( event.which == 13 ) {
	     event.preventDefault();
		 searchOMDB( $('#frm_searchForm').get(0) );
	  }
	});
	$( "#frm_movieYear" ).keypress(function( event ) {
	  if ( event.which == 13 ) {
	     event.preventDefault();
		 searchOMDB( $('#frm_searchForm').get(0) );
	  }
	});
});

// Set up the search object as a global "~singleton" (only one search object at a time per page)
var MovieSearcher;


/* 	TODO: eventsRunLoop() does NOT actually do any work yet, it's just a test of the concept.
So far, it's writing to the console properly when the XHR call is complete, but I definitely want
to test this further and experiment with other possible implementations to see what's most responsive
and what implementation uses the least resources. I'll eventually have to add code to call 
the function/method that controls the search view, at which point I'll be able to remove 
the "callBack" structure from omdbSearch.searchAPI(); */

// Set up the runLoop
function eventsRunLoop() {
	try {
		if (MovieSearcher && MovieSearcher.bSearchComplete) {
			console.log ("The search was completed. bSearchComplete = " + MovieSearcher.bSearchComplete);
			clearInterval(intervalID);
		};
	} catch (e) {
			console.log (e);
	}
}

// Use setInterval to create a run loop capable of watching for a condition and triggering code based on that condition
var intervalID = setInterval(function() { eventsRunLoop() }, 100); // set an intervalID so I can cancel it later



