const API_KEY = '0da82993e1fd43cebbe112953250312';

const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');

        const contentId = tab.dataset.tab + 'Tab';
        document.getElementById(contentId).classList.add('active');
    });
});

const cityInput = document.getElementById('cityInput');
const suggestionsBox = document.getElementById('suggestions');

cityInput.addEventListener('input', async () => {
    const text = cityInput.value.trim();

    if (text.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${text}`);
        const cities = await res.json();

        suggestionsBox.innerHTML = '';

        if (cities.length > 0) {
            suggestionsBox.style.display = 'block';
            cities.forEach(city => {
                const div = document.createElement('div');
                div.textContent = `${city.name}, ${city.country}`;
                div.addEventListener('click', () => {
                    cityInput.value = city.name;
                    suggestionsBox.style.display = 'none';
                });
                suggestionsBox.appendChild(div);
            });
        }
    } catch (err) {
        console.log('Ошибка подсказок:', err);
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== cityInput) {
        suggestionsBox.style.display = 'none';
    }
});

document.getElementById('searchCityBtn').addEventListener('click', () => {
    const city = cityInput.value;
    if (city === '') {
        showError('city', 'Пожалуйста, введите название города');
    } else {
        loadWeather(city, 'city');
    }
});

document.getElementById('searchCoordsBtn').addEventListener('click', () => {
    const lat = document.getElementById('latInput').value;
    const lon = document.getElementById('lonInput').value;

    if (lat === '' || lon === '') {
        showError('coords', 'Пожалуйста, введите широту и долготу');
    } else if (typeof lat !== 'number' || typeof lon !== 'number') {
        showError('coords', 'Введены некорректные данные');
    } else {
        loadWeather(`${lat},${lon}`, 'coords');
    }
});

function resetWidget(widgetBlock, errorBlock) {
    errorBlock.textContent = '';
    widgetBlock.classList.add('hidden');
}

async function fetchWeatherData(query) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&lang=ru`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Место не найдено');
    }

    return await response.json();
}

function displayWeatherData(data, type) {
    document.getElementById(type + 'Name').textContent = data.location.name;
    document.getElementById(type + 'CountryName').textContent = data.location.country;
    document.getElementById(type + 'Temp').textContent = data.current.temp_c + '°C';
    document.getElementById(type + 'Desc').textContent = data.current.condition.text;
    document.getElementById(type + 'Wind').textContent = 'Ветер: ' + data.current.wind_kph + ' км/ч';
    document.getElementById(type + 'Time').textContent = 'Время: ' + data.location.localtime;
    document.getElementById(type + 'Icon').src = 'https:' + data.current.condition.icon.replace("64x64", "128x128");
}

function displayMap(data, type) {
    const lat = data.location.lat;
    const lon = data.location.lon;
    const bbox = `${lon-0.05},${lat-0.05},${lon+0.05},${lat+0.05}`;

    document.getElementById(type + 'Map').src =
        `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

function addToHistory(widget, type) {
    const clone = widget.cloneNode(true);
    clone.classList.remove("hidden");
    clone.removeAttribute("id");
    clone.style.marginTop = "20px";
    document.getElementById(type + "History").prepend(clone);
}

async function loadWeather(query, type) {
    const errorBlock = document.getElementById(type + 'Error');
    const widgetBlock = document.getElementById(type + 'Widget');

    resetWidget(widgetBlock, errorBlock);

    try {
        const data = await fetchWeatherData(query);
        displayWeatherData(data, type);
        displayMap(data, type);
        addToHistory(widgetBlock, type);
    } catch (error) {
        showError(type, 'Ошибка: ' + error.message);
    }
}

function showError(type, msg) {
    document.getElementById(type + 'Error').textContent = msg;
}