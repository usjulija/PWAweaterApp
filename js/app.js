/*==============MAIN VARIABLES===============*/
const main = document.getElementById("app");
const locationButton = document.getElementById("location");
const searchButton = document.getElementById("search");
const refreshButton = document.getElementById("refresh");
const locating = document.querySelector(".locating");
const modal = document.querySelector(".modal-container");
const header = document.querySelector(".header");
const closeModal = document.getElementById("modalCancel");
const checkbox = document.querySelector('input[type=checkbox]');

//Open Weather App API key
const apiKey = "6df34740c7766e4c99784637a68ebe70";

let app = {
  celsius: true,
  selectedCities: [],
};

/*==============EVENT LISTENERS===============*/
//add event listener to get current location button
locationButton.addEventListener('click', getLocation);

//add event listener to modal
searchButton.addEventListener('click', () => {
  toggleAddModal(true);
});

closeModal.addEventListener('click',() => {
  toggleAddModal(false);
});

//add event listner to the search form that appears in modal
document.querySelector('.searchForm').addEventListener('submit', (e) => {
  searchInitiate(e);
  toggleAddModal(false);
});

//add event listener to temperature toggle button
checkbox.addEventListener('click', temperatureToggle);
document.querySelector('.slider').addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
    temperatureToggle();
  } else {
    return;
  }
});

refreshButton.addEventListener('click', () => {
  app.selectedCities.forEach(city => updateOnRefresh(city));
});
/*==============FUNCTIONS TO DEAL WITH and UPDATE UI===============*/
//makes modal visible and invisible
function toggleAddModal(visible) {
  if (visible) {
   modal.classList.add('visibleOpacity');
   main.classList.add('hidePointer');
   header.classList.add('hidePointer');
   document.querySelector(".buttons-container").classList.add('hidden');
   document.querySelectorAll(".close").forEach(button => button.classList.add('hidden'));
 } else {
   modal.classList.remove('visibleOpacity');
   main.classList.remove('hidePointer');
   header.classList.remove('hidePointer');
   document.querySelector(".buttons-container").classList.remove('hidden');
   document.querySelectorAll(".close").forEach(button => button.classList.remove('hidden'));
 }
}

//converts temperature to fahrenheit and back to celsius
function temperatureToggle() {
  let temperatures = document.querySelectorAll('.temperature');

  if(app.celsius) {
    temperatures.forEach(item => {
      if (item.classList.contains('C')) {
        let oldValue = parseFloat(item.innerHTML);
        let newValue = Math.round((oldValue*1.8)+32);
        item.classList.remove('C');
        item.classList.add('F');
        item.innerHTML = `${newValue}&#176F`;
        checkbox.checked = true;
      }
    });
    return app.celsius = false;
  } else {
    temperatures.forEach(item => {
      if (item.classList.contains('F')) {
        let oldValue = parseFloat(item.innerHTML);
        let newValue = Math.round((oldValue-32)/1.8);
        item.classList.remove('F');
        item.classList.add('C');
        item.innerHTML = `${newValue}&#176C`;
        checkbox.checked = false;
      }
    });
    return app.celsius = true;
  }
}

//converts week's day number to word
function convertDayOfWeek(dateNumber) {
  let dayOfWeek;
  switch (dateNumber) {
    case 0:
      dayOfWeek = "Sun";
      break;
    case 1:
      dayOfWeek = "Mon";
      break;
    case 2:
      dayOfWeek = "Tue";
      break;
    case 3:
      dayOfWeek = "Wed";
      break;
    case 4:
      dayOfWeek = "Thu";
      break;
    case 5:
      dayOfWeek = "Fri";
      break;
    case  6:
      dayOfWeek = "Sat";
      break;
  }
  return dayOfWeek;
}

//gets date and time from current date
function currentDate(date) {
  const year = new Date(date * 1000).getFullYear();
  const month = new Date(date * 1000).getMonth()+1;
  const day = new Date(date * 1000).getDate();
  const hour = new Date(date * 1000).getHours();
  const minutes = new Date(date * 1000).getMinutes();
  return `${year}-${month < 10 ? '0' : '' }${month}-${day < 10 ? '0' : '' }${day} ${hour < 10 ? '0' : '' }${hour}:${minutes < 10 ? '0' : '' }${minutes}`;
}

//funcction to close card
function closeCard(event) {
  let card = event.target.parentNode.parentNode.parentNode;
  let number = parseInt(card.getAttribute('data-id'));

  event.target.parentNode.parentNode.parentNode.parentNode.removeChild(card);

  //remove from the selected cities array
  let indexNum = app.selectedCities.findIndex(i => i.id === number);
  app.selectedCities.splice(indexNum, 1);
  console.log(app);
  saveSelectedCities();
}

/*==============FUNCTIONS GETTING and FETCHING API DATA===============*/
//update cards on refresh
function updateOnRefresh(city) {
  let url = `https://api.openweathermap.org/data/2.5/forecast?id=${city.id}&appid=${apiKey}&units=metric`;
  let card = document.querySelector(`[data-id="${city.id}"]`);
  card.parentNode.removeChild(card);
  let indexNum = app.selectedCities.findIndex(i => i.id === city.id);
  app.selectedCities.splice(indexNum, 1);
  console.log(app);
  saveSelectedCities();
  fetchWeather(url);
}

//get weather based on current location
function getLocation() {
  //check if location navigation is supported
  if (!navigator.geolocation){
    main.innerHTML = `
    <section class="card">
      <div class="close">
        <button onclick="closeCard(event)" aria-label="remove message" title="remove message"><i class="material-icons" style="font-size:25px">close</i></button>
      </div>
      <div class="error">
        <img src="./images/error.svg" alt="cloud with umbrella">
        <p>Geolocation is not supported by your browser</p>
      </div>
    </section>
    `;
    return;
  }
  //take position lat and lang
  function success(position) {
    let latitude  = position.coords.latitude;
    let longitude = position.coords.longitude;
    let unsplashUrl;

    //modify url
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    //fetch data
    fetchWeather(url);
  }

  //handle error whren geolocation went wrong
  function error() {
    main.innerHTML = `
    <section class="card">
      <div class="close">
        <button onclick="closeCard(event)" aria-label="remove message" title="remove message"><i class="material-icons" style="font-size:25px">close</i></button>
      </div>
      <div class="error">
        <img src="./images/error.svg" alt="cloud with umbrella">
        <p>We were unable to retrieve your location, please allow browser to know your current location.</p>
      </div>
    </section>
    `;
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

//initiates API URL based on search input
function searchInitiate(e) {
  e.preventDefault();
  const input = e.target['0'].value.trim();

  //modify url
  let url = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=${apiKey}&units=metric`;

  //fetch data
  fetchWeather(url);
}

//function fetching data from weather API
function fetchWeather(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      //get 5 days and save them as one object
      let currentForecastData = {
        id: data.city.id,
        label: `${data.city.name}, ${data.city.country}`,
        currently: {
          time: data.list['0'].dt,
          now: new Date(Date.now()),
          description: data.list['0'].weather['0'].description,
          shortDescription: data.list['0'].weather['0'].main,
          icon: data.list['0'].weather['0'].icon,
          temperature: Math.round(data.list['0'].main.temp),
          hummidity: data.list['0'].main.humidity,
          wind: data.list['0'].wind.speed,
          windDegr: data.list['0'].wind.deg
        },
        daily: {
          data: [
            {time: data.list['8'].dt, icon: data.list['8'].weather['0'].icon, temperature: Math.round(data.list['8'].main.temp), description: data.list['8'].weather['0'].main},
            {time: data.list['16'].dt, icon: data.list['16'].weather['0'].icon, temperature: Math.round(data.list['16'].main.temp), description: data.list['16'].weather['0'].main},
            {time: data.list['24'].dt, icon: data.list['24'].weather['0'].icon, temperature: Math.round(data.list['24'].main.temp), description: data.list['24'].weather['0'].main},
            {time: data.list['32'].dt, icon: data.list['32'].weather['0'].icon, temperature: Math.round(data.list['32'].main.temp), description: data.list['32'].weather['0'].main}
          ]
        }
      };

      //push the object to the array
      app.selectedCities.push(currentForecastData);
      saveSelectedCities();
      console.log(app);
      generateCard(currentForecastData);
    })
    .catch(() => {
      console.log("error with weather API");
      main.innerHTML = `
        <section class="card">
          <div class="close">
            <button onclick="closeCard(event)" aria-label="remove message" title="remove message"><i class="material-icons" style="font-size:25px">close</i></button>
          </div>
          <div class="error">
            <img src="./images/error.svg" alt="cloud with umbrella">
            <p>Sorry, not possible to get data on current weather, please try again later.</p>
          </div>
        </section>
        `;
    });
}

//generate weather card to DOM
function generateCard(data) {
  //align temperatures depending on what units are selected
  let classTemp, dayTemp;
  //if celsius
  if(app.celsius) {
    checkbox.checked = false;
    classTemp = "C";
    dayTemp = `${data.currently.temperature}&#176;C`;
  } else {
    //if fahrenheit
    checkbox.checked = true;
    classTemp = "F";
    dayTemp = `${Math.round((data.currently.temperature*1.8)+32)}&#176;F`;
  }

  //create section with class card
  const card = document.createElement('section');
  card.classList.add('card');
  card.setAttribute("data-id", data.id);

  //current weather
  card.innerHTML = `
  <div class="close">
    <button onclick="closeCard(event)" aria-label="remove city" title="remove city"><i class="material-icons" style="font-size:25px">close</i></button>
  </div>
  <h2>${data.label}</h2>
  <h3>Today, ${currentDate(data.currently.time)}</h3>
  <div class="current-weather">
    <div class="main-icon">
      <div class="text">
        <p>${data.currently.description}</p>
        <p class="temperature ${classTemp}">${dayTemp}</p>
      </div>
      <img src="./images/${data.currently.icon}.svg" alt="${data.currently.shortDescription}">
    </div>
    <div class="weather-circles-container">
      <div class="hummidity">
        <p>humidity</p>
        <svg viewBox="0 0 36 36">
          <path class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path class="circle"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#7485AA";
            stroke-width="1";
            stroke-dasharray="${data.currently.hummidity}, 100"
          />
          <text x="18" y="20.35" class="percentage">${data.currently.hummidity}%</text>
        </svg>
      </div>
      <div class="wind-direction">
        <p>wind direction</p>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 138.5 138.5">
          <g fill="#7485AA">
            <path d="M126.8 69.3a57.6 57.6 0 0 1-30.9 50.6c-19.1 10.1-42.6 7.5-59.9-5-17.5-12.7-25.7-35.2-21.9-56.2C17.8 38 33.5 21.1 53.5 14.8c17.2-5.4 36-1.6 50.4 8.8 14.5 10.5 22.7 28 22.9 45.7 0 2.9 4.5 2.9 4.5 0-.2-19.7-9.4-37.7-25.1-49.5C90.3 7.8 68.7 5 50 11.2c-18.3 6.1-32.4 21.1-38.5 39.2-6.3 18.9-2.3 40.2 9.6 56 15.8 21 44 29.2 68.8 20.9 24.7-8.3 41.1-32.3 41.4-58 0-2.9-4.5-2.9-4.5 0z"/>
            <path d="M124.3 69.3c-.7 28.4-23 53.4-52 54.3-29.6 1-55-21.9-56.6-51.6-1.4-27.2 18.5-52.1 45.5-56.4 30.4-4.9 59.2 17.3 62.7 47.7.4 3.7-.7 9.6 4.1 10.6 4.2.9 5.8-2.7 5.7-6.1-.2-12.7-4.7-25.5-12.1-35.7A63.94 63.94 0 0 0 53.8 7.5C29.5 13.7 10.3 35.1 6.7 59.9c-3.7 25.7 9 52.1 31.7 64.8 21.2 11.9 48.7 11 68.5-3.4 9.4-6.8 16.9-16.1 21.5-26.8 2.4-5.6 4-11.5 4.9-17.5.5-3.5 2.1-9.7-1.8-11.9-3-1.6-6.4.3-7 3.4-.6 3.1 4.2 4.5 4.8 1.3-1.1 5.5-1.5 11.3-3.2 16.8-1.9 6-4.7 11.7-8.4 16.9-6.9 9.8-17 17.5-28.4 21.3-23.2 7.8-50.2.3-65.4-19C6.6 84 7.1 52.6 25 31.3 42 11.1 71.7 4.6 95.6 16.2c11.5 5.6 21 15.2 26.8 26.6 2.9 5.6 4.8 11.7 5.7 17.9.1.9.3 6.8 1.1 7-.1 0-.9-8.7-1.1-9.7a59.62 59.62 0 0 0-48.6-47.3C57.1 7 34.3 16.9 21.2 35.5c-13 18.4-13.7 43.4-2.9 63 13 23.4 42.1 35.2 67.9 27.9 25.4-7.2 42.5-31.1 43.1-57.2.1-3.1-4.9-3.1-5 .1z" class="st0"/>
            <g>
            <path d="M68.7 9.9v7.5c0 1.5 2.4 1.5 2.4 0V9.9c0-1.6-2.4-1.6-2.4 0z"/>
            <path d="M68.7 9.9v7.5c0 1.5 2.4 1.5 2.4 0V9.9c0-1.6-2.4-1.6-2.4 0z"/>
            <path d="M68.7 9.9v7.5c0 1.5 2.4 1.5 2.4 0V9.9c0-1.6-2.4-1.6-2.4 0zM39.2 18.4c1.2 2.2 2.5 4.3 3.7 6.5.8 1.3 2.9.1 2.1-1.2-1.2-2.2-2.5-4.3-3.7-6.5-.8-1.3-2.9-.1-2.1 1.2zM17.9 40.6c2.2 1.2 4.3 2.5 6.5 3.7 1.3.8 2.5-1.3 1.2-2.1-2.2-1.2-4.3-2.5-6.5-3.7-1.3-.7-2.5 1.3-1.2 2.1zM10.5 70.5H18c1.5 0 1.5-2.4 0-2.4h-7.5c-1.5 0-1.5 2.4 0 2.4zM19.1 100c2.2-1.3 4.3-2.5 6.5-3.7 1.3-.8.1-2.9-1.2-2.1-2.2 1.2-4.3 2.5-6.5 3.7-1.3.8-.1 2.9 1.2 2.1zM41.3 121.3c1.3-2.2 2.5-4.3 3.7-6.5.8-1.3-1.3-2.5-2.1-1.2-1.2 2.2-2.5 4.3-3.7 6.5-.8 1.4 1.3 2.6 2.1 1.2zM71.2 128.7v-7.5c0-1.5-2.4-1.5-2.4 0v7.5c0 1.5 2.4 1.5 2.4 0zM100.7 120.1c-1.3-2.2-2.5-4.3-3.7-6.5-.8-1.3-2.9-.1-2.1 1.2 1.3 2.2 2.5 4.3 3.7 6.5.8 1.4 2.9.2 2.1-1.2zM122.3 97.8c-2.2-1.2-4.3-2.5-6.5-3.7-1.3-.8-2.5 1.3-1.2 2.1 2.2 1.2 4.3 2.5 6.5 3.7 1.3.7 2.5-1.4 1.2-2.1zM129.5 67.8H122c-1.5 0-1.5 2.4 0 2.4h7.5c1.5 0 1.5-2.4 0-2.4zM120.8 38.2c-2.2 1.2-4.3 2.5-6.5 3.7-1.3.8-.1 2.9 1.2 2.1 2.2-1.2 4.3-2.5 6.5-3.7 1.3-.8.1-2.9-1.2-2.1zM98.4 17c-1.2 2.2-2.5 4.3-3.7 6.5-.8 1.3 1.3 2.5 2.1 1.2 1.2-2.2 2.5-4.3 3.7-6.5.8-1.4-1.3-2.6-2.1-1.2z"/>
          </g>
          <g id="arrow" style="transform:rotate(${data.currently.windDegr}deg)">
            <path fill="#3a9dce" d="M40.1 99.1l29.8-59.7V81z"/>
            <path fill="#6cd7ef" d="M99.8 99.1L69.9 39.4V81z"/>
          </g>
        </svg>
      </div>
      <div class="wind">
        <p>wind speed</p>
        <svg viewBox="0 0 36 36">
          <path class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path class="circle"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#7485AA";
            stroke-width="1";
            stroke-dasharray="${data.currently.wind}, 100"
          />
          <text x="18" y="20.35" class="percentage">${data.currently.wind}m/s</text>
        </svg>
      </div>
    </div>
  </div>
  `;

  //add forecast as separate section with class forecast
  const weaterContainer = document.createElement('div');
  weaterContainer.classList.add('forecast');
  card.appendChild(weaterContainer);

  data.daily.data.forEach((day) => {
    //align temperatures depending on what units are selected
    let classTemp, dayTemp;
    //if celsius
    if(app.celsius) {
      checkbox.checked = false;
      classTemp = "C";
      dayTemp = `${day.temperature}&#176;C`;
    } else {
      //if fahrenheit
      checkbox.checked = true;
      classTemp = "F";
      dayTemp = `${Math.round((day.temperature*1.8)+32)}&#176;F`;
    }

    const container = document.createElement('div');
    container.innerHTML = `
    <p class="weekDay">${convertDayOfWeek(new Date(day.time * 1000).getDay())}</p>
    <img src="./images/${day.icon}.svg" alt="${day.description}">
    <p>${day.description}</p>
    <p class="temperature ${classTemp}">${dayTemp}</p>
    `
    weaterContainer.appendChild(container);
  });

  //hide the spinner
  locating.classList.add('hidden');
  //display card
  main.appendChild(card);
}

/*==============START APP WITH SELECTED CITIES AND SERVICE WORKER===============*/
function saveSelectedCities() {
  window.localforage.setItem('selecetedCitiesData', app);
  console.log('saved');
}

if ('serviceWorker' in navigator) {
  console.log('service worker registration in progress');
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registration completed with scope: ',
        registration.scope)
    }, (err) => {
      console.log('Service Worker registration failed', err)
    })
  })
} else {
  console.log('Service Workers not supported')
}

/*==============INITIATES APP===============*/
document.addEventListener('DOMContentLoaded', function() {
  window.localforage.getItem('selecetedCitiesData', function(err, cityList) {
    if (cityList) {
      console.log(cityList);
      app.selectedCities = cityList.selectedCities;
      app.celsius = cityList.celsius;
      console.log(app);
      app.selectedCities.forEach(city => generateCard(city));
    } else {
      getLocation();
    }
  });
});
