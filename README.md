# Pet-Adoption-APP
# cs355_project
-the purpose of this project is to be familiar how to program for the server and interact Public API’s synchronously before sending a result to the end user(Client), and use the OAuth2.0 three legged authentication.



The following **required** functionality is completed:

* [x] The user can visit the home page, and with a form for them fill out;
* [x] The user can submit the form, and use the typing information to send the first API request;
* [x] Upon receiving the response from the first API request, my server can parse the response and generate a request to the second API.
* [x] The server can cache the access token instead request access token every time;
* [x] 	The server can get the data from first API, and then make the second request on the second API synchronously and return the date second API, finally send a result back to the end user;
# APIs Used
- [NodeJs](https://github.com/loopj/android-async-http) - Simple asynchronous HTTP requests with JSON parsing
- [PetFinder API] (https://www.petfinder.com/developers/v2/docs/)- This free api  return information on a single animal type by using GET method. It will return JSON object of animal type according the query condition. 
- [OpenLibrary API] (https://openlibrary.org/dev/docs/api/books)- This free api is used for querying information on one or more books using ISBNs.
# Endpoints
 1. User
 2. Cs355 app server
 3. PetFinder server
 4. OpenLibrary server
 
