const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const notFound = document.querySelector(".error");
const errImg = document.querySelector(".not-found");
const errorText = document.querySelector("[data-errorText]");
const errorButton = document.querySelector("[data-errorButton]");

// At initial stage variables needed
let currentTab = userTab;
const API_KEY = "19a77b4512a7e903f2d508f553283356";
currentTab.classList.add("current-tab");
getfromSessionStorage();

// tab switching process
userTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

function switchTab(clickedTab) {

    notFound.classList.remove("active");

    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            // main phle search wale tab pe tha ab your weather tab visible krna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            
            getfromSessionStorage();
        }
    }
}

// check if cordinates are aleready present in session storage or not
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // if no coordinates avilable
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// API call
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    grantAccessContainer.classList.remove("active");

    loadingScreen.classList.add("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(!data.sys){
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        // render function
        renderWeatherInfo(data);
    } catch(err){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFound.classList.add("active");
        errImg.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorButton.style.display = 'block';
        errorButton.addEventListener('click', fetchUserWeatherInfo);
    }
}

// render function
function renderWeatherInfo(weatherInfo){
    // at first we have to fetch all the elements that will be used in this function.
    
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = `${weatherInfo?.name}`;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = `${weatherInfo?.weather?.[0]?.description}`;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.textContent = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.textContent = `${weatherInfo?.wind?.speed} m/s`;
    humidity.textContent = `${weatherInfo?.main?.humidity}%`;
    cloudiness.textContent = `${weatherInfo?.clouds?.all}%`;
}

// grant access button listener to get current loaction and save to session storage
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click', getLocation);

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert("No geolocation supported");
    }
}

function showPosition(position){
    const usercoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));
    fetchUserWeatherInfo(usercoordinates);
}

// search form weatherInfo
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") return;

    fetchSearchWeatherInfo(cityName);

    searchInput.value = "";
});

// API call
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(!data.sys){
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }catch(e){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFound.classList.add("active");
        errorText.innerText = `${e?.message}`;
        errorButton.style.display = "none";
    }
}