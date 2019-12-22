//https://insomnia.rest
//ISBN:31153009977398
//ISBN:0201558025
//LCCN: 93005405
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const isbn = '0451526538';

const credentials = require('./auth/credentialsPet.json');
const authentication_cache = './auth/authentication_cache.json';

//const authorization_endpoint = "https://www.wunderlist.com/oauth/authorize?";
const connection_established = function(request, response)
{
    console.log(request.url);
  	if(request.url === "/")
    {
        console.log(request.url);
        response.writeHead(200, {"Content-Type": "text/html"});
        let readStream = fs.createReadStream('./html/searchPet.html'); //3.Remember to send the head before the response.????
        readStream.pipe(response);
  	}

    // else if(request.url.startsWith("/favicon.ico"))
    // {
    //     response.writeHead(404, {"Content-Type": "text/plain"});
    //     response.write("404 Not Found");
    //     response.end();
    // }

    else if(request.url.startsWith("/search"))
    {
      let  post_data = querystring.stringify({
           client_id: credentials.client_id,
           client_secret: credentials.client_secret,
           grant_type: credentials.grant_type
            });
       const options = {
            method:'POST', //send data
            headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          }
        };

      user_input = url.parse(request.url,true).query;
      pet_input = user_input.q;
      book_input = user_input.b;
      lNum_input = user_input.l;
      let cache_valid = false;

    if(fs.existsSync(authentication_cache)) //return true if the path exists
    {
      cached_auth = require(authentication_cache);
      if( Date.parse(cached_auth.expiration)>Date.parse(Date())){
        cache_valid = true;
      }
      else{
        console.log('Token Expired');
      }
    }
    if(cache_valid){
      create_search_req(cached_auth,pet_input,book_input,lNum_input,response);
    }
    else
    {

      const token_endpoint = 'https://api.petfinder.com/v2/oauth2/token';
  		let authentication_req = https.request(token_endpoint, options, function(authentication_res){
        const auth_sent_time = new Date();
        auth_sent_time.setHours(auth_sent_time.getHours()+1);
  			received_authentication(authentication_res, pet_input, auth_sent_time, response);

  		});
  		authentication_req.on('error', function(e){ console.error(e); });
  		//authentication_req.write(post_data);
  		console.log("Requesting  Token");
  		authentication_req.end(post_data); //The request is not sent until req.end() is called
    }
       };
}

function received_authentication(authentication_res, pet_input, auth_sent_time, response){
	authentication_res.setEncoding("utf8");
	let body = "";
	authentication_res.on("data", function(chunk) {body += chunk;});
	authentication_res.on("end", function(){
		const pet_auth = JSON.parse(body);
    console.log(pet_auth);
    create_access_token_cache(pet_auth,pet_input,auth_sent_time,response);
    create_search_req(pet_auth, pet_input, book_input,lNum_input, response);

	});
};

function create_access_token_cache(pet_auth,pet_input,auth_sent_time,response){
  pet_auth.expiration = auth_sent_time;
  const data = JSON.stringify(pet_auth)
  const output_dir = authentication_cache;
    fs.writeFile(`${output_dir}`, data,"utf-8", function(err){
      if(err){
        throw err;
      }
      console.log("Token has been cached!!");
      console.log(pet_auth);
    });
    create_search_req(pet_auth, pet_input, book_input,lNum_input,response);
};

function create_search_req(pet_auth, pet_input,book_input, lNum_input,res)
  {
    const options_get = {
      method: 'GET',
      headers:
      {
        Authorization: `Bearer ${pet_auth.access_token}`
        //json: true
      }

    }
    const search_endpoint = `https://api.petfinder.com/v2/animals?type=${pet_input}&page=2`;
    //const input_url = search_endpoint +'?q=' +user_input + '&type=album&access_token=' + pet_auth.access_token;
    //console.log(input_url);
    let search_req = https.request(search_endpoint, options_get, (search_res) => {
      // console.log(res);
      var body = "";
      search_res.on('data', function(chunk) {
        body += chunk;
      });

      search_res.on('end', function() {
       var  animal_data = JSON.parse(body);
       console.log(animal_data);


       //var imgPath_arrs=[];

       const pet_data = animal_data.animals;
       let pet_urlArry = [];
       let content = "";
       let loaded_url = 0;
       pet_data.forEach(function(animal, index){
         const pet_url = animal.url;
         https.get(pet_url, function(url_res){
          pet_urlArry.push(pet_url);
          loaded_url++;
          if(loaded_url==pet_data.length){
            generate_webpage(pet_urlArry,book_input, lNum_input, res);
          }
        }).on('error', function(err){
          console.log(err);
        });
       })

        /* if(fs.existsSync(`./pet-photos/${user_input}`)){
              for(let i = 0; i < photos.length; i++){
                  const image_path = `/pet-photos/${user_input}/images${i}.png`;
                  imgPath_arrs.push(image_path);
              }
              //generate_webpage(imgPath_arrs, res);
          }
          else{

              //downloadImages(album_items, user_input, res);
          } */
        //  put second request here
      });
    });

    search_req.on('error', (e) => {
        console.log("Searched album fail", e);
    });
    search_req.end();
  };


 function second_search_req(book_input, lNum_input,res, data)
 {
   const options_get = {
     method: 'GET'
   }
   const  book_endpoint = `https://openlibrary.org/api/books?bibkeys=ISBN:${book_input},LCCN:${lNum_input}&format=json`;

   const search_req = https.request(book_endpoint,options_get,(search_res)=>{

     var body = "";
     search_res.on('data', function(chunk){
       body += chunk;
     });
     search_res.on('end',function(){
       //console.log("body:", body);
       let book_data = JSON.parse(body);
       const image_url = book_data[`ISBN:${book_input}`].thumbnail_url;
       data += `<img src="${image_url}"  height="200" width="168" >`
       console.log("2th API Book data: ",book_data);

       res.writeHead(200, {
         "Content-Type": "text/html"
       });
       res.end(data);

     })
   }).on('error', (e) => console.log('Failed to get data',e));
   search_req.end();

 }


 function generate_webpage(pet_urlArry,book_input, lNum_input, res)
 {
   let data = "<h1>Search Results</h1>";
   for (let i = 0; i < pet_urlArry.length; i++) {

     data +=  '"' + pet_urlArry[i] + '"' +"</br>" ;

   }
   // console.log(res);
   data += '<p>That was the result from the first api. The content below is obtained from the second api</p>'
   second_search_req(book_input,lNum_input, res, data);
 };

const server = http.createServer(connection_established);
server.listen(3000);
console.log("The server is now listening on port 3000");
