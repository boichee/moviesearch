// Code to poll the OMDb server with the search that has been entered

// Set up the URI to the API
var apiURI = "http://www.omdbapi.com/?";


function isStringEmpty(str) {
	if(str.trim().length <= 0) return true; 
	else return false;
}

// Searches for any movies matching the input string
function doSearch(imdbID)
{	
	
	// Clear the #searchResults before every new request
	$("#searchResults").html("");
	
	// Set up the object to hold the query results until the API call
	// Key for each property of oMovieSearch will match parameters in the OMDB API
	var oMovieSearch = new Object();
	
	// Set up the regex to find the year
	var yearEx = /(19|20)[0-9]{2}/; // Will match years between 1900-2099
	
	// Init a query string 
	var apiQuery = "";
	
	// We're going to get the value of the form field, create an array to store title, year, or both.
	var form = $('#searchForm').get(0);  // document.getElementById('searchForm');
	var query = form.movieQuery.value;
	form.movieQuery.value = ""; // Clear the field now that we've captured the search
	
	
	// Check to see if imdbID has been set, if it has, then update the settings appropriately.
	if(imdbID != null) {
		if (imdbID == "t") {
			titleKey = 't';
		} else {
			apiQuery = "i=" + encodeURIComponent(imdbID);		
		} 
	} else {
		titleKey = 's';
			
	}
	
	
	// Now, check that apiQuery is still empty
	if (apiQuery.length == 0) { // If still, empty, then we don't have a specified imdbID, so build the query.
	
		// First, make sure a search was entered.
		if (isStringEmpty(query)) return; // if empty string found, return and do nothing.
	
		// Moving on....
	
	
		// Test for a year within the query
		if (yearEx.test(query)) { // If true, replace the year with an empty string and assign the year to our call object
			aYears = yearEx.exec(query);
			oMovieSearch.y = aYears[0]; // get the 0th index of the returned array.
		
			var title = query.replace(yearEx, "");
			if (!isStringEmpty(title)) {
				oMovieSearch[titleKey] = title.trim();
			} else {
				alert ("You must enter a title in addition to a year. Please try again.");
				return;
			}
		} else { // If no year entered, just apply the query to the title and set the year to null
			oMovieSearch[titleKey] = query.trim();
		}
	
		// Now create the query string by going through the object.
		for (key in oMovieSearch) {
			// Check that the key's value is non-null, and if so add the relevant string
			if (oMovieSearch[key]) {
				if (apiQuery.length > 0) apiQuery = apiQuery + "&"; // If apiQuery has something in it, then we're past the first item
			
				// Now add the relevant parameter and value to the apiRequest
				apiQuery = apiQuery + key + "=" + encodeURIComponent(oMovieSearch[key]);
			}
		}
	
	
	}
	// We should now have a correctly formatted query string, so build the complete API request URI

	var requestURI = apiURI + apiQuery;
	// alert(requestURI); // For testing only

	
	
	$.getJSON( requestURI, 
		
		function( data ) {
			
			if (data.Search && data.Search.length > 1) { // That is, if a search with multiple results has been returned
				
				layoutSearchResults(data);
				
			} else { // If we only have a single object to parse through.
				
				if (data.Search && data.Search.length == 1) {
					// Only 1 search result returned. Go straight to single-item display with just that item.
					var imdbId = data.Search[0].imdbID;
					data = null; // Unset the data object to avoid an endless loop.
					doSearch(imdbId);
					return;
				}
				
				layoutSingleMovie(data);
				
			}
			
	  	  	
		}
	);
	
}



function layoutSearchResults (data)
{
  	var items = [];
  	$.each( data, 
		function( key, val ) {
			
			if(val == "False") {
				alert ("No movies could be found based on your query. Try again.");
				return;
			}
			
			
			$.each( val, function (key, val) {
				items.push("<a href='javascript:doSearch(\"" + val.imdbID + "\")'><div class='searchResult'><div class='movieDetails'><div class='movieTitle'>" + val.Title + "</div><div class='movieYear'>" + val.Year + "</div></div></div></a>");
			});	
	  	});
	
	
	$("<div/>", {
		"id": "searchResults",
		"class": "grid_8 prefix_2 suffix_2",
		html: items.join("") }).appendTo("#outputContent");
}


function layoutSingleMovie(data)
{
	
	// Clean up any prior appends before doing it again
	$('#outputContent').empty();
	
  	var htmlToSend = "";
	
	htmlToSend = '<div class="moviePoster"><img src="' + data.Poster + '" class="moviePoster" /> </div> <div id="shortFacts" class="movieFacts"> <div class="detailRowHead"> <h4>'+ data.Title +'</h4> </div> <div class="detailRows"> <div class="detailRow odd"> <p>'+ data.Plot +'<br /><a href="javascript:moreFacts()">more...</a></p> </div></div> </div> <div id="moreFacts" class="movieFacts"> <div class="detailRowHead"> <h4>'+ data.Title +'</h4> </div> <div class="detailRows"> <div class="detailRow odd"> <p>Year: '+ data.Year +'</p></div> <div class="detailRow"> <p>Writer(s): '+ data.Writer +'</p></div> <div class="detailRow odd"> <p>Director: '+ data.Director +'</p></div> <div class="detailRow"> <p>Actors: '+ data.Actors +'</p></div> <div class="detailRow odd"> <p><a href="javascript:lessFacts()">< Go back</a></p></div></div> </div>';
 
$("<div/>", {
	"id": "movieResult",
	"class": "grid_8 prefix_2 suffix_2",
	html: htmlToSend }).appendTo("#outputContent");

}



// Doing the AJAX by Hand, just for funzies

function mkElWithMovie(elType, innerHTMLorSrc)
{
	var el = document.createElement(elType);
	if (elType != 'img') {
		el.innerHTML = innerHTMLorSrc;
	} else {
		el.src = innerHTMLorSrc;
	}
	
	return el;
}

function ajaxByHandParse(dataReceived) {
	
	var oJSON = JSON.parse(dataReceived);
	
	// alert (oJSON.Title); // For testing only
	// alert (oJSON.Runtime); // For testing only
	
	return oJSON;
	
}

function ajaxByHand()
{
	var req = new XMLHttpRequest();
	
	req.onreadystatechange = function() {
		if (req.readyState == 4 && req.status == 200) {
			// document.getElementById("ajaxFill").innerHTML = req.responseText;
			
			// On return of data, pass the parsing responsibilities off to another function and get an Object
			 var oMovie = ajaxByHandParse(req.responseText);
			 
		 	// Now start adding elements to the page with the various data
		 	var detailsContainer = document.getElementById('ajaxFill');
	
		 	// var movTitle = document.createElement('p');
		 	// movTitle.innerHTML = oJSON.Title;
	
		 	var movTitle = mkElWithMovie('p', "Movie Title: " + oMovie.Title);
		 	detailsContainer.appendChild(movTitle);
	
		 	var movPoster = mkElWithMovie('img', oMovie.Poster);
		 	// detailsContainer.appendChild(movPoster); // Commenting out for now because imDB won't allow access.
			
			var movActors = mkElWithMovie('p', "Actors: " + oMovie.Actors);
			detailsContainer.appendChild(movActors);
	
			 
			 
		}
	}
	
	req.open("GET","http://www.omdbapi.com/?t=Annie%20Hall&tomatoes=true", true);
	req.send();
}


function moreFacts()
{
	$('#shortFacts').css('display', 'none');
	$('#moreFacts').css('display', 'inline-block');
}

function lessFacts()
{
	$('#shortFacts').css('display', 'inline-block');
	$('#moreFacts').css('display', 'none');
}





// Attach an event handler to the search button

$(document).ready(function() {
	$('#movieReturn').click(function() { doSearch('t') });
	$('#movieSearch').click(function() { doSearch() });
	$('#searchForm').submit(function () {
		doSearch();
	 return false;
	});
});




