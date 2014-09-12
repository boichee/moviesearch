**9/12/14: MVVC Branch Created**

# MovieSearcher Code Challenge
## MVVC Branch (OO Implementation)

### Still just a 1-page web app that allows a user to find movies using the OMDB API. (http://www.omdbapi.com)

#### New Implementation Notes:

Reworked the implementation to make it conform more to MVC (really MVVC) and to make
it more scalable and maintainable. In MovieSearcher.js, the user’s
inputs are abstracted into a model object (omdbSearch) that
communicates with the API.

Additionally, each new parameter is represented by another object I’ve
created called omdbSearchArg, which holds the a human readable name (or
explanation) of the argument, the argKey (as specified by the omdbAPI)
and the argValue (user’s entry). Each parameter object is then stored
in an array in the omdbSearch object (args).

The omdbSearch object is itself really a singleton in concept, with a
single global variable in the script providing the instance. Were it
possible in javascript, I would make the arguments array private,
declare the variable as static, and provide getter methods that return
an immutable version of the array. In the meantime, I think I’ll have
to add some error checking to try to prevent the creation of more than
one instance of the object.

On the controller side, I need to build something more robust, but for
the moment, I’ve simply added a setInterval() to the “searchOMDB”
function that is called when the user clicks “search” (or presses
enter). As such, there is no code in the omdbSearch object itself to
communicate with a view. In effect, the controller loads the necessary
params into the model, tells the model to execute the search, and then
(by using setInterval and a callback) waits until the search has been
completed (by checking bSearchComplete in the model). Once the search
is complete, the controller’s callback ( “outputData()” ) clears the
interval and passes control (and the relevant data to output) to the
“View” (or really View Controller, since the HTML/CSS is truly the view for now),
“layoutSearchResults()” which converts the data into HTML and appends
it to the DOM.

#### TODO:

1. Still need to implement 2 other views: 
  * "Selected Movie"
  * "Selected Movie > Full Plot"

2. Also need to re-implement the convenience code that checks the
number of search results and if that # is 1, moves directly to the
“selected movie” view.

3. I need to add the modal user error notifications back in and improve
the validation methods in omdbSearch. At the moment, it validates both
the Title and Year fields but wouldn’t have a way of distinguishing for
the view controller which of the two fields was the caused the error
(if not both.)

4. Need to add a complete pushState implementation at some point so
that back and forward browser functionality are possible.

5. At some point, I should probably abstract the views into Handlebars
to improve upon my current method of updating search results/or
selected movie views through insertion of a large amount of messy and
golfed HTML into the DOM via jQuery’s append function. Would definitely
make it easier to replace individual aspects of a result if desired at
some point.

6. Need to re-implement sorting of search results. (And give the UX on
the sorting a little love too). Oh, and animate the sort!

7. Some stuff I’m probably not thinking of right now.
