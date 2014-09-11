// Code to poll the OMDb server with the search that has been entered

// Set up the URI to the API
var apiURI = "http://www.omdbapi.com/?";
var oLastSearch = new Object();


function isStringEmpty(str) {
	if(str.trim().length <= 0) return true; 
	else return false;
}

// Searches for any movies matching the input string

function startSearch(frm_searchForm, options, imdbID)
{	
	
	// Validate the form before continuing to process
	if (frm_searchForm.frm_movieQuery.value.trim().length == 0) {
		// If no title entered, return with an error message
		alert ("You must enter at least a title to search for a movie.");
		return false;
	}
	
	// If title entered, continue to processing
	continueSearch(frm_searchForm, options, imdbID);
	
}

function grabLongPlot(imdbID) {
	
	data = null; // clear data object.
	
	var requestURI = apiURI + 'i=' + imdbID + '&plot=full';
	
	// Request prepped, now send OMDB API and decide how to process results
	
	$.getJSON( requestURI, 
		
		function( data ) {
			
			// Clear the current info in outputPlot
			$('#outputPlot').empty();
			
			// Now add the new full plot
			$('#outputPlot').append(data.Plot);
			
		}
	);	
}

function continueSearch(frm_searchForm, options, imdbID)
{
	// Create an object to hold the form values in prep for AJAX call
	var oMovieSearch = new Object();
	
	// Set up the regex to find the year
	var yearEx = /(19|20)[0-9]{2}/; // Will match years between 1900-2099
	
	// Init a query string 
	var apiQuery = "";
	
	// extract the form data and drop it into the search object
	// var frm_searchForm = $('#frm_searchForm').get(0);
	
	// Check if an imdbID is set, and if it is, add that field to the search object
	if (imdbID !== undefined) {
		oMovieSearch.i = imdbID;
	} else {
		// imdbID not set so we're dealing with a search, not a link click
		// Determine which title param to use based on options argument (either: s|t)
		var titleKey = (options !== undefined && options == 'dblClick') ? "t" : "s";
		// alert (titleKey); // Testing only
		oMovieSearch[titleKey] = frm_searchForm.frm_movieQuery.value;
		oLastSearch.title = frm_searchForm.frm_movieQuery.value;
		frm_searchForm.frm_movieQuery.value = ""; // clear field
	
		// Now fill the "y" (aka 'year') param
		oMovieSearch.y = frm_searchForm.frm_movieYear.value;
		oLastSearch.year = frm_searchForm.frm_movieYear.value;
		frm_searchForm.frm_movieYear.value = ""; // clear field
	}
	
	// Prep AJAX Query
	if (oMovieSearch.i !== undefined) {
		// imdbID was set, so just use that for the query
		apiQuery = "i=" + oMovieSearch.i;
	} else {
		// imdbID was not set, so perform normal search
		// Now create the query string by going through the object.
		for (key in oMovieSearch) {
			// Check that the key's value is defined, and if so add the relevant string
			if (oMovieSearch[key]) {
				if (apiQuery.length > 0) apiQuery = apiQuery + "&"; // If apiQuery has something in it, then we're past the first item
			
				// Now add the relevant parameter and value to the apiRequest
				apiQuery = apiQuery + key + "=" + encodeURIComponent(oMovieSearch[key]);
			}
		}	
	}
	
	// Now create the complete request
	var requestURI = apiURI + apiQuery;
	
	// alert (apiQuery); // Testing only
	
	// Request prepped, now send OMDB API and decide how to process results
	
	$.getJSON( requestURI, 
		
		function( data ) {
			
			// Check to make sure the search created results before proceeding
			if(data.Search === undefined) {
				// TODO: replace the alert below with a function to display the error in the interface.
				alert ("No movies could be found based on your search. Try again.");
				return false;
			}
			
			
			if (oMovieSearch.s) {
				// If we did a "search" we'll display results
				
				if (data.Search.length == 1) {
					// unless only 1 result was returned, then just show that result
					continueSearch(false, false, data.Search[0].imdbID);
					
				} else layoutSearchResults(data);
				
			} else if (oMovieSearch.t || oMovieSearch.i) { 
				// If t or i were set, then we should only have 1 result
				layoutSingleMovie(data);
			} else {
				// Catch any other errors that might occur
				alert ("An unknown error occurred. Please try again.");
				return false;
			}
		}
	);	
}

function layoutSearchResults (data)
{
	
	// Prep the search results for display
	var counter = 0; // set up an iterative counter to start a row every 3 results
  	var items = [];
  	$.each( data.Search, 
		function( key, val ) {
			
			// Check what iteration we're at and add the appropriate row divs
			if ((counter != 0) && (counter % 3 == 0)) items.push('</div>');
			if (counter % 3 == 0) items.push('<div class="row">');
			counter++;
			
			items.push('<div class="col-md-4"><h2>'+val.Title+'</h2><p>'+val.Year+'</p><p><a class="btn btn-default" href="javascript:continueSearch(false, false, \''+val.imdbID+'\')" role="button" target="_blank">Select this movie &raquo;</a></p></div>');	
	  	});
		
	// Now prep the display about the search itself
	var queryString = oLastSearch.title;
	// Add the year if one was entered
	queryString = (oLastSearch.year.length > 0) ? queryString + ' (' + oLastSearch.year + ')' : queryString;
	var queryDisplayHtml = '<h1>You searched for:</h1><h3>"'+ queryString +'"</h3><p>And got '+ counter +' results.</p>';
	
		// Output all prepped, so append the html in the appropriate locations on screen
		// First make sure those elements are empty.
		$('#mainOutput').empty();
		$('#detailsOutput').empty();
		
		// Now append
		$('#mainOutput').append(queryDisplayHtml);
		$('#detailsOutput').append(items.join(""));
}


function layoutSingleMovie(data)
{
	
	// Clean up any prior appends before doing it again
	$('#mainOutput').empty();
	$('#detailsOutput').empty();
	
	var mainOutputHtml = '<h1>' + data.Title + '</h1><h3>'+ data.Year +'</h3><p id="outputPlot">'+ data.Plot +'</p><p><a href="javascript:grabLongPlot(\''+ data.imdbID +'\')" class="btn btn-primary btn-lg" role="button">More &raquo;</a></p>';
		
	var detailsOutputHtml = '<div class="col-md-3"><h2>Writer(s)</h2><p>'+ data.Writer +'</p></div><div class="col-md-3"><h2>Director</h2><p>'+ data.Director +'</p></div><div class="col-md-3"><h2>Actors</h2><p>'+ data.Actors +'</p></div><div class="col-md-3"><p><img src="'+ data.Poster +'" alt="'+ data.Title +' Poster" style="height:300px;width:100%"></p>  </div>';
	
	
	// All set to append new html
	// First make sure those elements are empty.
	$('#mainOutput').empty();
	$('#detailsOutput').empty();
	
	// Now add mainOutput to the DOM
	$('#mainOutput').append(mainOutputHtml);
	
	// Now, add detailsOutput to the DOM	
	$("<div/>", {
	"class": "row",
	html: detailsOutputHtml }).appendTo("#detailsOutput");

}


// Attach an event handler to the search button

$(document).ready(function() {
	$('#frm_doSearch').click(function() { startSearch(this.form) });
	$('#frm_doSearch').dblclick(function() { startSearch(this.form, 'dblClick')});
	$('#frm_searchForm').submit(function () {
		startSearch(this.form);
	 	return false;
	});
});




