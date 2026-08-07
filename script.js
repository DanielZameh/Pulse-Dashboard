function readLocalStorageData(storageKey, fallbackValue) {
  var serializedItem = localStorage.getItem(storageKey);
  if (!serializedItem) return fallbackValue;
  return JSON.parse(serializedItem);
}

function writeLocalStorageData(storageKey, dataValue) {
  localStorage.setItem(storageKey, JSON.stringify(dataValue));
}

var userApplicationConfig = readLocalStorageData('userConfigSettings', { mode: '12', city: 'London' });
var userBookmarksList = readLocalStorageData('userBookmarksArray', [{t: 'GitHub', u: 'https://github.com'}, {t: 'Google', u: 'https://google.com'}]);
var userTodoList = readLocalStorageData('userTodoListArray', ['Review pull requests', 'Update documentation']);

function updateLiveClock() {
  var currentDateInstance = new Date();
  var hoursValue = currentDateInstance.getHours();
  var minutesString = String(currentDateInstance.getMinutes()).padStart(2, '0');
  var timeSuffixString = '';
  
  if (userApplicationConfig.mode === '12') {
    timeSuffixString = hoursValue >= 12 ? ' PM' : ' AM';
    hoursValue = hoursValue % 12 || 12;
  }
  
  document.getElementById('clockDisplay').innerText = hoursValue + ':' + minutesString + timeSuffixString;
  
  var dateFormattingOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  document.getElementById('dateDisplayLabel').innerText = currentDateInstance.toLocaleDateString('en-US', dateFormattingOptions);
}

async function fetchWeatherDataForCity() {
  try {
    var geocodingEndpointUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(userApplicationConfig.city) + '&count=1';
    var geocodingResponse = await fetch(geocodingEndpointUrl);
    var parsedGeocodingResult = await geocodingResponse.json();
    if (parsedGeocodingResult.results && parsedGeocodingResult.results.length > 0) {
      var firstLocationItem = parsedGeocodingResult.results[0];
      var weatherForecastEndpointUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + firstLocationItem.latitude + '&longitude=' + firstLocationItem.longitude + '&current_weather=true';
      var weatherResponse = await fetch(weatherForecastEndpointUrl);
      var parsedWeatherResult = await weatherResponse.json();
      document.getElementById('temperatureDisplay').innerText = Math.round(parsedWeatherResult.current_weather.temperature) + '°C';
      document.getElementById('locationDisplay').innerText = firstLocationItem.name;
    }
  } catch (error) {
    // Fallback
  }
}

function renderUserBookmarks() {
  var linksContainerElement = document.getElementById('linksContainerBox');
  linksContainerElement.innerHTML = '';
  for (var indexCounter = 0; indexCounter < userBookmarksList.length; indexCounter++) {
    var anchorElementNode = document.createElement('a');
    anchorElementNode.href = userBookmarksList[indexCounter].u;
    anchorElementNode.innerText = userBookmarksList[indexCounter].t;
    anchorElementNode.className = 'dynamic-link-anchor';
    linksContainerElement.appendChild(anchorElementNode);
  }
}

function renderUserTasks() {
  var taskListContainerElement = document.getElementById('taskUnorderedList');
  taskListContainerElement.innerHTML = '';
  for (var taskIndexCounter = 0; taskIndexCounter < userTodoList.length; taskIndexCounter++) {
    var listItemElementNode = document.createElement('li');
    listItemElementNode.innerText = '- ' + userTodoList[taskIndexCounter];
    listItemElementNode.className = 'task-item-line';
    taskListContainerElement.appendChild(listItemElementNode);
  }
}

function executeWebSearch(submitEventObject) {
  submitEventObject.preventDefault();
  var searchInputQueryText = document.getElementById('searchInputField').value.trim();
  if (!searchInputQueryText) return;
  if (searchInputQueryText.indexOf('.') !== -1 && searchInputQueryText.indexOf(' ') === -1) {
    window.location.href = searchInputQueryText.indexOf('http') === 0 ? searchInputQueryText : 'https://' + searchInputQueryText;
  } else {
    window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(searchInputQueryText);
  }
}

function toggleClockMode() {
  userApplicationConfig.mode = userApplicationConfig.mode === '12' ? '24' : '12';
  document.getElementById('timeToggleButton').innerText = userApplicationConfig.mode + 'H';
  writeLocalStorageData('userConfigSettings', userApplicationConfig);
  updateLiveClock();
}

setInterval(updateLiveClock, 1000);
updateLiveClock();
fetchWeatherDataForCity();
renderUserBookmarks();
renderUserTasks();
