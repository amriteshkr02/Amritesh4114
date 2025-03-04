// API key and URL for weather data
const Api_key = "2fd0a318e501d357f164156824815772";
const api_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Api_key}&units=metric`;

// Query selectors for various DOM elements
const auto_btn = document.querySelector("#auto");
const mannual_btn = document.querySelector("#mannual");
let label = document.querySelector("label");
let input = document.querySelector("input");
let heading = document.querySelector("header>h1");
let dropdown = document.querySelector("#dropdown");
let body = document.querySelector("body");
let watch = document.querySelector("#watch");

// Updates the time every second
setInterval(()=>{
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if(minutes.toString().length==1){
    minutes="0"+minutes
  }
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  watch.innerText=`${hours}:${minutes} ${ampm}`;
  watch.parentElement.style.display="flex"
},1000);

// Close dropdown when clicking anywhere on the body
body.addEventListener("click",()=>{ 
  dropdown.style.display = "none";
}, true);

// Handle selection from the dropdown
dropdown.addEventListener("click",(e)=>{
  if(e.target.tagName="P"){ // Check if the clicked element is a <p> tag
    input.value=e.target.innerText;
    dropdown.style.display = "none";
  }
});

// Auto location button event listener
auto_btn.addEventListener("click", (e) => {
  e.preventDefault();
  label.innerText = "Enter a City Name";
  label.classList.remove("text-red-500");
  getlocation(e); // Fetch weather based on current location
});

// Manual city input button event listener
mannual_btn.addEventListener("click", (e) => {
  e.preventDefault();
  let city = cityChecker(); // Check if the city input is valid
  if (city) {
    getLocationByCity(city); // Fetch weather for the input city
    getforecastData(city); // Get forecast data for the input city
  }
});

// Input click event listener (dropdown display logic)
input.addEventListener("click", () => {
  label.innerText = "Enter a City Name";
  label.classList.remove("text-red-500");
  const array = JSON.parse(localStorage.getItem("myArray")); // Retrieve previously stored cities
  if(array){
    displayCity(array); // Display city suggestions from localStorage
  }
});

// Input event listener (filter cities based on input)
input.addEventListener("input",()=>{
  let city =input.value;
  let allcities = JSON.parse(localStorage.getItem("myArray"));
  if(allcities){
    let lola =  allcities.filter((e)=>{ // Filter cities that match the input
      if(e.includes(city)){
        return e;
      }
    });
    if(lola.length>=1){
      displayCity(lola); // Display matching cities
    } else {
      dropdown.style.display = "none"; // Hide dropdown if no matches
    }
  }
});

// Check if the city input is valid
function cityChecker() {
  let input = document.querySelector("input");
  let value = input.value.trim();
  if (value === "" || !isNaN(value)) { // Ensure input is not empty or a number
    label.innerText = "Please Enter a Valid City!";
    label.classList.add("text-red-500"); // Show error message
  } else {
    input.value="";
    return value; // Return the valid city name
  }
}

// Function to convert UNIX timestamp to day and date
function timeanddate(lol) {
  let timestamp = lol; // Unix timestamp in seconds
  let date = new Date(timestamp * 1000); // Multiply by 1000 to convert to milliseconds
  let day = date.toLocaleString("en-US", { weekday: "long" }); // Get the day
  let formattedDate = date.toLocaleDateString("en-US"); // Get the formatted date
  let obj ={
    day: day,
    date: formattedDate
  };
  return obj;
}

// Get location based on user's geolocation
function getlocation() {
  if (navigator.geolocation) { // Check if geolocation is available
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        let oneApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${Api_key}&units=metric`;
        fetch(oneApi)
          .then((data) => data.json())
          .then((data) => {
            extractData(data); // Process the data
            getforecastData(data.name); // Fetch forecast data
          });
      },
      (error) => {
        console.log("Error retrieving location:", error); // Handle geolocation error
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser."); // Handle no geolocation support
  }
}

// Get weather data based on city name
async function getLocationByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${Api_key}&units=metric`;
  try {
    let data = await fetch(url);
    if (!data.ok) throw new Error(`${data.status}`);
    let resdata = await data.json();
    extractData(resdata); // Process the data
  } catch (err) {
    if (err.message == "404") {
        heading.innerHTML=`CloudVista &nbsp;<i class="fa-solid fa-cloud"></i><span class="font-bold">&nbsp;-City not found!</span> `;
    } else if (err instanceof TypeError) {
      heading.innerHTML=`CloudVista &nbsp;<i class="fa-solid fa-cloud"></i><span class="font-bold">&nbsp;-Please check your internet connection</span> `;
    } else {
      console.log("Error:", err);
    }
  }
}

// Get weather forecast data for the next few days
async function getforecastData(city) {
  const API = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${Api_key}&units=metric`;
  try {
    let data = await fetch(API);
    if (!data.ok) throw new Error(`${data.status}`);
    let resdata = await data.json();
    extractforecastData(resdata, city); // Process forecast data
  } catch (err) {
    if (err.message == "404") {
      label.innerText  ="City not found! Try Again";
      label.classList.add("text-red-500");
    } else if (err instanceof TypeError) {
      console.log("Please check your internet connection");
    } else {
      console.log("Error:", err);
    }
  }
}

// Extract and display weather forecast data
function extractforecastData(data, city){
  let newData = data.list.filter((e) => {
    return [8, 16, 24, 32, 39].includes(data.list.indexOf(e)); // Filter forecast data for the next 5 days
  });
  
  let forecastWeather = [];
  let dayAndDate = [];
  for (let data of newData) {
    let abc = timeanddate(data.dt);
    dayAndDate.push(abc);
  }

  for (let data of newData) {
    let weather = {
      temprature: data.main.temp,
      wind: data.wind.speed,
      day: dayAndDate[newData.indexOf(data)].day,
      date: dayAndDate[newData.indexOf(data)].date,
      city_name: city,
      humidity: data.main.humidity,
      status: data.weather[0].main,
      description: data.weather[0].description,
    };

    forecastWeather.push(weather);
  }

  displayforecastData(forecastWeather); // Display the forecast data
}

// Extract and display current weather data
function extractData(data){
  let dayAndDate = timeanddate(data.dt);
  let weather = {
    temprature: data.main.temp,
    wind: data.wind.speed,
    day: dayAndDate.day,
    date: dayAndDate.date,
    city_name: data.name,
    humidity: data.main.humidity,
    status: data.weather[0].main,
    description: data.weather[0].description,
  };

  displayData(weather); // Display the current weather data
}

// Display current weather data
function displayData(weather){
  let div = document.querySelector("#displayData")  // Get the display data div
  let infodiv = document.querySelector("#infoText")  // Get the info text div
  let weather_img = document.querySelector("#weather_img")  // Get the weather image element
  div.style.display = "flex";  // Make the div visible
  storeCity(weather.city_name)  // Store the city in localStorage
 heading.innerHTML=`CloudVista &nbsp;<i class="fa-solid fa-cloud"></i><span class="font-bold">&nbsp;- Weather of ${weather.city_name}</span> `  // Set the heading
   infodiv.innerHTML=`  
    <h1>${weather.city_name}</h1>
     <p class="text-3xl sm:text-4xl font-semibold">${weather.day}</p>
     <p class="text-5xl sm:text-6xl font-bold text-gray-500">${Math.floor(weather.temprature)}&deg;C</p>
     <p>Humidity: <i class="fa-solid fa-droplet"></i> ${weather.humidity}%</p>
     <p>wind:<i class="fa-solid fa-wind"></i> ${weather.wind} M/S</p>
     <p class="border-2 p-1 px-2 w-fit rounded-lg text-white bg-yellow-300 font-semibold">${ weather.status}</p>
   `
  
    if(weather.status=="Haze"){  // Check for haze weather status
     weather_img.setAttribute("src","/images/sun.png")  // Set appropriate image
    }
    else if (weather.status=="Mist"){  // Check for mist weather status
     weather_img.setAttribute("src","/images/mist.png")  // Set appropriate image
    }
    else if(weather.status=="Clouds"){  // Check for cloudy weather status
     weather_img.setAttribute("src","/images/cloudy.png")  // Set appropriate image
    }
    else if(weather.status=="Clear"){  // Check for clear weather status
     weather_img.setAttribute("src","/images/sun (2).png")  // Set appropriate image
    }
    else if(weather.status=="Rain"){  // Check for rainy weather status
     weather_img.setAttribute("src","/images/rainny.png")  // Set appropriate image
    }
}

// Display 5-day forecast data
function displayforecastData(weather){

let fiveDaysDiv= document.querySelector("#fivedays")  // Get the 5-day forecast div
   fiveDaysDiv.style.display="flex"  // Make the div visible
      for(let i=0;fiveDaysDiv.children.length>i;i++){  // Loop through the children to display forecast

         fiveDaysDiv.children[i].innerHTML=`  
          <div class="absolute inset-0 bg-white opacity-60"></div>
   <p class="text-2xl z-10 font-semibold">${weather[i].day}</p>
   <p class="text-4xl z-10 font-bold">${Math.floor(weather[i].temprature)}&deg;C</p>
   <p class="z-10">Humidity: <i class="fa-solid fa-droplet"></i> ${weather[i].humidity}%</p>
   <p class="z-10">wind: <i class="fa-solid fa-wind"></i> ${weather[i].wind} M/S</p>
   <p class="border-2 z-10 px-2 w-fit rounded-lg text-white bg-yellow-300 font-semibold">${weather[i].status}&nbsp${checkWeather(weather[i])}</p>
 </div>
         `   
         
          if(weather[i].status=="Rain"){  // Check if the forecast day has rain
           fiveDaysDiv.children[i].classList=`relative bg-[url('/images/rainny_weather.jpg')] bg-cover bg-opacity-10 bg-center h rounded-md w-44 h-full flex items-center gap-1 flex-col`  // Set appropriate background image for rain
         }
        else if(Math.floor(weather[i].temprature)>15){  // Check if the temperature is above 15°C
           fiveDaysDiv.children[i].classList=`relative bg-[url('/images/istockphoto-1007768414-612x612.jpg')] bg-cover bg-opacity-10 bg-center h rounded-md w-44 h-full flex items-center gap-1 flex-col`  // Set appropriate background image for warm temperature
          }
         else{  // Default background for cold temperature
           fiveDaysDiv.children[i].classList=`relative bg-[url('/images/badge-snowcovered.jpg')] bg-cover bg-opacity-10 bg-center h rounded-md w-44 h-full flex items-center gap-1 flex-col`  // Set appropriate background image for cold temperature
          }
      }
}

// Check and return an icon based on the weather status
function checkWeather(weather){
// console.log(weather)
if(weather.status=="Clouds"){  // If the status is Clouds
 let icon = "<i class='fa-solid fa-cloud'></i>"  // Return cloud icon
 return icon
}
else if(weather.status=="Rain"){  // If the status is Rain
 let icon = "<i class='fa-solid fa-cloud-showers-heavy'></i>"  // Return rain icon
 return icon
}
else if (weather.status === "Clear") {  // If the status is Clear
 return "<i class='fa-solid fa-sun'></i>";  // Return sun icon
}
else if (weather.status === "Snow") {  // If the status is Snow
 return "<i class='fa-solid fa-snowman'></i>";  // Return snowman icon
}
else{
 return ""  // Return an empty string if the weather status is unknown
}
}

// Store city in localStorage to keep track of visited cities
function storeCity(city){
const existingArray = JSON.parse(localStorage.getItem("myArray")) || []  // Get the existing city array from localStorage

const newItem = city.toLowerCase();  // Convert city name to lowercase to avoid duplicates
if(!existingArray.includes(newItem)){  // If the city is not already in the array

existingArray.unshift(newItem);  // Add city to the front of the array
}else{  // If the city is already in the array
let i = existingArray.indexOf(newItem)  // Find the index of the city
existingArray.splice(i,1)  // Remove the city from the array
existingArray.unshift(newItem);  // Add the city to the front again
}
localStorage.setItem("myArray", JSON.stringify(existingArray));  // Save the updated array to localStorage
}

// Display city suggestions from the array
function displayCity(array){
if(array.length>4){  // If the array has more than 4 cities, limit it to 5
 array.length=5
}
dropdown.innerHTML=""  // Clear the dropdown
dropdown.style.display = "flex";  // Show the dropdown
for ( let city of array){  // Loop through the cities
let p= document.createElement("p")  // Create a new paragraph for each city
p.innerText=city  // Set the city name
p.classList="p-1 px-2  hover:bg-gray-300 border-black bg-white"  // Add styling to the paragraph
dropdown.appendChild(p)  // Append the paragraph to the dropdown
}
}
