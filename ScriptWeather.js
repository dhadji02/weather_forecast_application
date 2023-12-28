// JavaScript source code
tabsinVisible();
//Requests creation
const xhrNominatim = new XMLHttpRequest();
const xhrCurrentWeather = new XMLHttpRequest();
const xhrForecast = new XMLHttpRequest();
const xhrAir = new XMLHttpRequest();
//Handling submit event of search in the form
const form = document.querySelector('#search');
var forms = document.querySelector("#formid");
form.addEventListener('click', function(event) {
        if (!forms.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            forms.classList.add('was-validated');
            forms.classList.remove('needs-validation');
        } else {
            event.preventDefault();
            const address = document.querySelector('#address_text'),
                region = document.querySelector('#region_text'),
                city = document.querySelector("#city_select");
            xhrNominatim.open('GET', 'https://nominatim.openstreetmap.org/search?q=' + address.value + ',' + region.value + ',' + city.value + '&format=json');
            xhrNominatim.send();
        }
    })
    //Calling the rest of the requests
xhrNominatim.onreadystatechange = function() {
    // Only run if the request is complete
    if (xhrNominatim.readyState !== 4) return;
    // Process our return data
    if (xhrNominatim.status >= 200 && xhrNominatim.status < 300) {
        // What to do when the request is successful
        const object = JSON.parse(xhrNominatim.responseText);
        if (isEmpty(object)) {
            alert("No result found for that location. Please enter another one.");
            return;
        }
        postReq(document.querySelector('#address_text').value, document.querySelector('#region_text').value, document.querySelector("#city_select").value);
        document.querySelector('#pillsNow').click();
        tabsVisible();
        xhrCurrentWeather.open('GET', 'https://api.openweathermap.org/data/2.5/weather?lat=' + parseFloat(object[0].lat) + '&lon=' + parseFloat(object[0].lon) + '&units=' + readRadio() + '&APPID=1fb6d4e9ee528b9a3066d0e49d174024');
        xhrCurrentWeather.send();
        xhrCurrentWeather.onreadystatechange = function() {
            if (xhrCurrentWeather.readyState !== 4) return;
            // Process our return data
            if (xhrCurrentWeather.status >= 200 && xhrCurrentWeather.status < 300) {
                // What to do when the request is successful
                const object2 = JSON.parse(xhrCurrentWeather.responseText);
                mapPrinter(parseFloat(object[0].lat), parseFloat(object[0].lon));
                addRow('currentTable', object2);
            } else {
                // What to do when the request has failed
                console.log('error', xhrCurrentWeather);
            }
            xhrForecast.open('GET', 'https://api.openweathermap.org/data/2.5/forecast?lat=' + parseFloat(object[0].lat) + '&lon=' + parseFloat(object[0].lon) + '&units=' + readRadio() + '&APPID=1fb6d4e9ee528b9a3066d0e49d174024');
            xhrForecast.send();
            xhrForecast.onreadystatechange = function() {
                if (xhrForecast.readyState !== 4) return;
                // Process our return data
                if (xhrForecast.status >= 200 && xhrForecast.status < 300) {
                    // What to do when the request is successful
                    const objectForecast = JSON.parse(xhrForecast.responseText);
                    createNextTable(objectForecast);
                } else {
                    // What to do when the request has failed
                    console.log('error', xhrForecast);
                }
                xhrAir.open('GET', 'https://api.waqi.info/feed/' + document.querySelector("#city_select").value + '/?token=2bbbdf53a3d5c02173b4da205a578244793e9c02');
                xhrAir.send();
                xhrAir.onreadystatechange = function() {
                    if (xhrAir.readyState !== 4) return;
                    // Process our return data
                    if (xhrAir.status >= 200 && xhrAir.status < 300) {
                        // What to do when the request is successful
                        const objectAir = JSON.parse(xhrAir.responseText);
                        airQuality(objectAir);
                    } else {
                        // What to do when the request has failed
                        console.log('error', xhrAir);
                    }
                }
            }
        }
    } else {
        // What to do when the request has failed
        console.log('error', xhrNominatim);
    }
};

//This function checks if a value in a returned JSON, is undefined
function undefinedJ(checking) {
    if (checking === undefined)
        return true;
}

//Function used to check if an object is empty
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//Function that creates and prints the map and its layers
function mapPrinter(lat, lon) {
    let targetElement = document.getElementById('mapPut');
    if (document.getElementById('map'))
        document.getElementById('map').remove();
    let mapCreate = document.createElement('div');
    mapCreate.id = 'map';
    mapCreate.classList.add('map');
    targetElement.appendChild(mapCreate);
    var map = new ol.Map({ // a map object is created
        target: 'map', // the id of the div in html to contain the map
        layers: [ // list of layers available in the map
            new ol.layer.Tile({ // first and only layer is the OpenStreetMap tiled layer
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({ // view allows to specify center, resolution, rotation of the map
            center: ol.proj.fromLonLat([lon, lat]), // center of the map
            zoom: 5 // zoom level (0 = zoomed out)
        })
    });
    layer_temp = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=1fb6d4e9ee528b9a3066d0e49d174024',
        })
    });
    map.addLayer(layer_temp); // a temp layer on map
    layer_precipitation = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=1fb6d4e9ee528b9a3066d0e49d174024',
        })
    });
    map.addLayer(layer_precipitation); // a temp layer on map
}

//Making the tabs inVisible
function tabsinVisible() {
    const element = document.querySelector('#tabs');
    element.classList.add('d-none');
}

//Making the tabs Visible
function tabsVisible() {
    const element = document.querySelector('#tabs');
    element.classList.remove('d-none');
}

//Clear Button Functionality
const clear = document.querySelector('#clear');
clear.addEventListener('click', function() {
    document.querySelector('#pillsNow').click();
    tabsinVisible();
    document.getElementById('airTable').innerHTML = '';
    document.getElementById('airForecast').innerHTML = '';
    document.getElementById('airUv').innerHTML = '';
    document.getElementById('infoTable').innerHTML = '';
    document.getElementById('modalTable').innerHTML = '';
    document.getElementById('mapPut').innerHTML = '';
    document.getElementById('currentTable').innerHTML = '';
    document.getElementById('nextTable').innerHTML = '';
    document.getElementById('description').innerHTML = '';
    document.getElementById('temp').innerHTML = '';
    document.getElementById('tempH').innerHTML = '';
    document.getElementById('tempL').innerHTML = '';
    document.getElementById('icon').setAttribute('src', '');
    forms.classList.remove('was-validated');
    forms.classList.add('needs-validation');
})

//This function checks which radio button is selected
function readRadio() {
    let check = '';
    if (document.querySelector('#inlineRadio1').checked === true)
        check = 'metric';
    else if (document.querySelector('#inlineRadio2').checked === true)
        check = 'imperial';
    return check;
}

//This function converts a given timestamp to the needed time format 
function timeConverter(timer, par) {
    let date;
    if (par === 1)
        date = new Date(parseInt(timer) * 1000);
    else
        date = new Date(parseInt(timer));
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let print = '';
    if (hours < 10)
        print = '0' + hours + ':' + minutes.substr(-2);
    else
        print = hours + ':' + minutes.substr(-2);
    return print;
}

//Function that implements the functionality of the Right Now tab
function addRow(currentTable, object2) {
    let list = ['Pressure', 'Humidity', 'Wind Speed', 'Cloud Cover', 'Sunrise', 'Sunset'];
    let listAtt = ['pressure', 'humidity', 'speed', 'all', 'sunrise', 'sunset'];
    let listfind = ['main', 'main', 'wind', 'clouds', 'sys', 'sys'];
    let addonsMetric = [' hPa', ' %', ' meters/sec', ' %', '', ''];
    let addonsImperial = [' Mb', ' %', ' miles/hour', ' %', '', ''];
    let values = [];
    values.push(object2.weather[0].icon);
    values.push(object2.weather[0].description);
    values.push(object2.name);
    values.push(object2.main.temp);
    values.push(object2.main.temp_min);
    values.push(object2.main.temp_max);
    for (i = 0; i < values.length; i++)
        if (undefinedJ(values[i]))
            values[i] = 'N.A.';
    const element = document.querySelector("#icon");
    element.setAttribute('src', 'https://openweathermap.org/img/w/' + values[0] + '.png');
    let check = readRadio();
    let add;
    if (check === 'metric')
        add = 'C';
    else
        add = 'F';
    const element1 = document.querySelector("#description");
    element1.innerText = values[1] + " in " + values[2];
    const element2 = document.querySelector("#temp");
    element2.innerText = values[3] + ' °' + add;
    const element3 = document.querySelector("#tempL");
    element3.innerText = 'L: ' + values[4] + ' °' + add + ' | '
    const element4 = document.querySelector("#tempH");
    element4.innerText = ' H: ' + values[5] + ' °' + add;

    for (i = document.getElementById(currentTable).rows.length - 1; i >= 0; i--)
        document.getElementById(currentTable).deleteRow(i);

    let tableRef = document.getElementById(currentTable);
    for (i = 0; i < listfind.length; i++) {
        let newRow = tableRef.insertRow(-1);
        let newCell = newRow.insertCell(0);
        let newCell1 = newRow.insertCell(1);
        let newText;
        if (!undefinedJ(list[i]))
            newText = document.createTextNode(list[i]);
        else
            newText = document.createTextNode("N.A.");
        newCell.appendChild(newText);
        let newText1;
        if (check === 'metric')
            newText1 = document.createTextNode(object2[listfind[i]][listAtt[i]] + addonsMetric[i]);
        else
            newText1 = document.createTextNode(object2[listfind[i]][listAtt[i]] + addonsImperial[i]);
        if (undefinedJ(object2[listfind[i]][listAtt[i]]))
            newText1 = "N.A.";
        if (i > 3) {
            let newText2, print, formattedTime;
            if (!undefinedJ(object2[listfind[i]][listAtt[i]])) {
                newText2 = object2[listfind[i]][listAtt[i]];
                print = timeConverter(newText2, 1);
                formattedTime = document.createTextNode(print);
            } else
                formattedTime = document.createTextNode("N.A.");
            newCell1.appendChild(formattedTime);
        } else
            newCell1.appendChild(newText1);
    }
}

//Function that implements the functionality of the next 24 hours tab
function createNextTable(objectForecast) {
    var values = [];
    for (i = 0; i < 8; i++) {
        values.push(objectForecast.list[i].dt);
        values.push(objectForecast.list[i].weather[0].icon);
        values.push(objectForecast.list[i].main.temp);
        values.push(objectForecast.list[i].clouds.all);
        values.push(objectForecast.list[i].weather[0].main);
        values.push(objectForecast.list[i].weather[0].description);
        values.push(objectForecast.list[i].main.humidity);
        values.push(objectForecast.list[i].main.pressure);
        values.push(objectForecast.list[i].wind.speed);
    }
    values.push(objectForecast.city.name);
    for (i = 0; i < values.length; i++)
        if (undefinedJ(values[i]))
            values[i] = 'N.A.';
    let tableHeader = ['Time', 'Summary', 'Temp', 'Cloud Cover', 'Details'];
    let check = readRadio();
    for (i = document.getElementById('nextTable').rows.length - 1; i >= 0; i--)
        document.getElementById('nextTable').deleteRow(i);
    let doit = document.getElementById('nextTable');
    let header = document.createElement('thead');
    doit.appendChild(header);
    let row = header.insertRow(-1);
    for (i = 0; i < tableHeader.length; i++) {
        let x = document.createElement("th");
        x.textContent = tableHeader[i];
        row.appendChild(x);
    }
    let body = document.createElement('tbody');
    doit.appendChild(body);
    for (i = 0; i < 8; i++) {
        let newRow = body.insertRow(-1);
        for (j = 0; j < 5; j++) {
            let newCell = newRow.insertCell(j);
            switch (j) {
                case 0:
                    let newText, print, formattedTime;
                    if (!undefinedJ(values[(i * 9)])) {
                        newText = values[(i * 9)];
                        print = timeConverter(newText, 1);
                        formattedTime = document.createTextNode(print);
                        newCell.appendChild(formattedTime);
                    } else {
                        formattedTime = document.createTextNode("N.A.");
                        newCell.appendChild(formattedTime);
                    }
                    break;
                case 1:
                    let icon = newCell.appendChild(document.createElement('img'));
                    icon.setAttribute('src', 'https://openweathermap.org/img/w/' + values[(i * 9) + 1] + '.png');
                    break;
                case 2:
                    if (check === 'metric') {
                        let newText = document.createTextNode(values[(i * 9) + 2] + ' °C');
                        newCell.appendChild(newText);
                    } else {
                        let newText = document.createTextNode(values[(i * 9) + 2] + ' °F');
                        newCell.appendChild(newText);
                    }
                    break;
                case 3:
                    let newText1 = document.createTextNode(values[(i * 9) + 3] + ' %');
                    newCell.appendChild(newText1);
                    break;
                case 4:
                    let button = document.createElement("button");
                    button.classList.add('btn', 'btn-success');
                    button.textContent = 'View';
                    button.id = 'viewb'
                    button.setAttribute('type', 'button');
                    newCell.appendChild(button);
                    break;
            }
        }
    }
    //Crearting the modals for the next24 hours tab
    var allButtons = document.querySelectorAll("#viewb");
    allButtons.forEach(function(button, index) {
        button.addEventListener('click', function() {
            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            let date = new Date(values[(index * 9)] * 1000);
            const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
            document.querySelector("#staticBackdropLabel").textContent = 'Weather in ' + values[72] + ' on ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + timeConverter(date.getTime(), 0);
            let tableModal = document.querySelector("#modalTable");
            if (document.querySelector("#tableMod"))
                document.querySelector("#tableMod").remove();
            let bodyT = document.createElement('tbody');
            bodyT.id = "tableMod";
            tableModal.appendChild(bodyT);
            newRow = bodyT.insertRow(-1);
            let iconT = document.createElement('img');
            iconT.setAttribute('src', 'https://openweathermap.org/img/w/' + values[(index * 9) + 1] + '.png');
            newCell = newRow.insertCell(0);
            newCell.appendChild(iconT);
            let newCellD = newRow.insertCell(1);
            newText = document.createTextNode(values[(index * 9) + 4] + ' (' + values[(index * 9) + 5] + ')');
            newCellD.colSpan = 2;
            newCellD.appendChild(newText);
            let newRowb = bodyT.insertRow(-1);
            newRowb.className = "rowModal";
            let listmodal = ['Humidity', 'Pressure', 'Wind Speed'];
            for (i = 0; i < 3; i++) {
                newCell = newRowb.insertCell(i);
                newText = document.createTextNode(listmodal[i]);
                newCell.appendChild(newText);
            }
            let check = readRadio();
            let metrics = ['Mb', 'miles/hour', 'hPa', 'meters/sec'];
            let y = 0;
            if (check === 'metric')
                y = 2;
            newRow = bodyT.insertRow(-1);
            newCell = newRow.insertCell(0);
            newText = document.createTextNode(values[(index * 9) + 6] + ' %');
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(values[(index * 9) + 7] + ' ' + metrics[y]);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(2);
            newText = document.createTextNode(values[(index * 9) + 8] + ' ' + metrics[y + 1]);
            newCell.appendChild(newText);
            myModal.show();
        });
    });
}

//Function that implements the functionality of the air quality and UV index tab 
function airQuality(objectAir) {
    document.querySelector("#aqHeaders").textContent = "Air Quality Index & Gas Pollutants - Right Now in " + document.querySelector("#city_select").value;
    let measure = ' μg/m3';
    let num, aqi = objectAir.data.aqi;
    let tableAir = document.querySelector("#airTable");
    for (i = tableAir.rows.length - 1; i >= 0; i--)
        tableAir.deleteRow(i);
    let bodyT = document.createElement('tbody');
    bodyT.id = "tableAir";
    tableAir.appendChild(bodyT);
    let headers = ['Air quality Index', 'Average Ozone (O3) Today', 'Nitrogen Dioxide (NO2)', 'Sulphur Dioxide (SO2)', 'Carbon Monoxide (CO)'];
    for (i = 0; i < headers.length; i++) {
        let newRow = bodyT.insertRow(-1);
        let newCell, newText1;
        newCell = newRow.insertCell(0);
        newCell.setAttribute('style', 'font-weight:bold;');
        newCell.appendChild(document.createTextNode(headers[i]));
        newCell = newRow.insertCell(1);
        if (i === 0) {
            if (!undefinedJ(aqi)) {
                newText1 = aqi + ', ';
                let image = document.createElement('img');
                switch (true) {
                    case (aqi < 50):
                        num = 1;
                        newText1 += ' Good ';
                        newCell.setAttribute('style', 'color:green;');
                        break;
                    case (aqi < 101):
                        num = 2;
                        newText1 += ' Moderate ';
                        newCell.setAttribute('style', 'color:orange;');
                        break;
                    case (aqi < 151):
                        num = 3;
                        newText1 += ' Unhealthy for sensitive groups ';
                        newCell.setAttribute('style', 'color:#DD571C;');
                        break;
                    case (aqi < 201):
                        num = 4;
                        newText1 += ' Unhealthy ';
                        newCell.setAttribute('style', 'color:red;');
                        break;
                    case (aqi < 301):
                        num = 5;
                        newText1 += ' Very Unhealthy ';
                        newCell.setAttribute('style', 'color:lilac;');
                        break;
                    case (aqi < 500):
                        num = 6;
                        newText1 += ' Hazardous ';
                        newCell.setAttribute('style', 'color:purple;');
                        break;
                }
                newCell.appendChild(document.createTextNode(newText1));
                image.setAttribute('src', 'https://waqi.info/images/emoticons/aqi-label-' + num + '.svg');
                image.classList.add("images");
                newCell.appendChild(image);
            } else
                newCell.appendChild(document.createTextNode('N.A.'));
        }
        let sub = 0;
        if ((document.querySelector("#city_select").value === 'Limassol') || (document.querySelector("#city_select").value === 'Famagusta')) {
            sub = 2;
        }
        switch (i) {
            case 1:
                if (!undefinedJ(objectAir.data.forecast.daily.o3[2 - sub].avg))
                    newCell.appendChild(document.createTextNode(objectAir.data.forecast.daily.o3[2 - sub].avg + measure));
                else
                    newCell.appendChild(document.createTextNode('N.A.'));
                break;
            case 2:
                if (!undefinedJ(objectAir.data.iaqi.no2.v))
                    newCell.appendChild(document.createTextNode(objectAir.data.iaqi.no2.v + measure));
                else
                    newCell.appendChild(document.createTextNode('N.A.'));
                break;
            case 3:
                if (!undefinedJ(objectAir.data.iaqi.so2.v))
                    newCell.appendChild(document.createTextNode(objectAir.data.iaqi.so2.v + measure));
                else
                    newCell.appendChild(document.createTextNode('N.A.'));
                break;
            case 4:
                if (!undefinedJ(objectAir.data.iaqi.co.v)) {
                    let num = objectAir.data.iaqi.co.v * 100;
                    var n = num.toFixed(1);
                    newCell.appendChild(document.createTextNode(n + measure));
                } else
                    newCell.appendChild(document.createTextNode('N.A.'));
                break;
        }
    }
    if ((document.querySelector("#city_select").value === 'Limassol') || (document.querySelector("#city_select").value === 'Famagusta')) {
        sub = 2;
    } else
        sub = 0;
    let tableFor = document.querySelector("#airForecast");
    for (i = tableFor.rows.length - 1; i >= 0; i--)
        tableFor.deleteRow(i);
    let header = document.createElement('thead');
    tableFor.appendChild(header);
    let row = header.insertRow(-1);
    let tableHeader = ['Day', 'Particulate Matter (PM10)', 'Particulate Matter (PM2.5)'];
    for (i = 0; i < tableHeader.length; i++) {
        let x = document.createElement("th");
        x.textContent = tableHeader[i];
        row.appendChild(x);
    }
    let bodyTF = document.createElement('tbody');
    bodyTF.id = "tableFor";
    tableFor.appendChild(bodyTF);
    let txt;
    for (i = 0; i < 4; i++) {
        let newRow1 = bodyTF.insertRow(-1);
        let newCell1 = newRow1.insertCell(0);
        if (i === 0)
            txt = 'Today'
        else if (i === 1)
            txt = 'Tomorrow'
        else {
            if (!undefinedJ(objectAir.data.forecast.daily.pm10[2 + i - sub].day)) {
                str = objectAir.data.forecast.daily.pm10[2 + i - sub].day;
                txt = str.substring(8, str.length) + "/" + str.substring(5, 7);
            } else
                txt = 'N.A.';
        }
        newCell1.appendChild(document.createTextNode(txt));
        newCell1.setAttribute('style', 'font-weight:bold');
        newCell1 = newRow1.insertCell(1);
        if (!undefinedJ(objectAir.data.forecast.daily.pm10[2 + i - sub].avg)) {
            let pm10C = objectAir.data.forecast.daily.pm10[2 + i - sub].avg;
            switch (true) {
                case (pm10C < 51):
                    newCell1.setAttribute('style', 'color:limegreen;');
                    break;
                case (pm10C < 101):
                    newCell1.setAttribute('style', 'color: darkgreen;');
                    break;
                case (pm10C < 251):
                    newCell1.setAttribute('style', 'color:orange;');
                    break;
                case (pm10C < 351):
                    newCell1.setAttribute('style', 'color:#DD571C;');
                    break;
                case (pm10C < 431):
                    newCell1.setAttribute('style', 'color:red;');
                    break;
                case (pm10C >= 431):
                    newCell1.setAttribute('style', 'color:brown;');
                    break;
            }
            newCell1.appendChild(document.createTextNode(objectAir.data.forecast.daily.pm10[2 + i - sub].avg + measure));
        } else
            newCell1.appendChild(document.createTextNode('N.A.'));
        newCell1 = newRow1.insertCell(2);
        if (!undefinedJ(objectAir.data.forecast.daily.pm25[2 + i - sub].avg)) {
            pm10C = objectAir.data.forecast.daily.pm25[2 + i - sub].avg;
            switch (true) {
                case (pm10C < 31):
                    newCell1.setAttribute('style', 'color:limegreen;');
                    break;
                case (pm10C < 61):
                    newCell1.setAttribute('style', 'color: darkgreen;');
                    break;
                case (pm10C < 91):
                    newCell1.setAttribute('style', 'color:orange;');
                    break;
                case (pm10C < 121):
                    newCell1.setAttribute('style', 'color:#DD571C;');
                    break;
                case (pm10C < 250):
                    newCell1.setAttribute('style', 'color:red;');
                    break;
                case (pm10C >= 250):
                    newCell1.setAttribute('style', 'color:brown;');
                    break;
            }
            newCell1.appendChild(document.createTextNode(objectAir.data.forecast.daily.pm25[2 + i - sub].avg + measure));
        } else
            newCell1.appendChild(document.createTextNode('N.A.'));
    }

    let tableUV = document.querySelector("#airUv");
    for (i = tableUV.rows.length - 1; i >= 0; i--)
        tableUV.deleteRow(i);
    let headerU = document.createElement('thead');
    tableUV.appendChild(headerU);
    let rowU = headerU.insertRow(-1);
    let tableHeaders = ['Day', 'Maximum UV index', 'Risk of harm from exposure'];
    for (i = 0; i < tableHeaders.length; i++) {
        let xu = document.createElement("th");
        xu.textContent = tableHeaders[i];
        rowU.appendChild(xu);
    }
    if ((document.querySelector("#city_select").value === 'Limassol') || (document.querySelector("#city_select").value === 'Famagusta'))
        sub = 2;
    else
        sub = 0;
    let bodyUV = document.createElement('tbody');
    tableUV.appendChild(bodyUV);
    for (i = 0; i < 4; i++) {
        let newRow2 = bodyUV.insertRow(-1);
        let newCell2 = newRow2.insertCell(0);
        if (i === 0) {
            txt = 'Today';
        } else if (i === 1)
            txt = 'Tomorrow';
        else {
            str = objectAir.data.forecast.daily.uvi[2 + i - sub].day;
            if (!undefinedJ(str))
                txt = str.substring(8, str.length) + "/" + str.substring(5, 7);
            else
                txt = 'N.A.';
        }
        newCell2.appendChild(document.createTextNode(txt));
        newCell2.setAttribute('style', 'font-weight:bold');
        newCell2 = newRow2.insertCell(1);
        let max = objectAir.data.forecast.daily.uvi[2 + i - sub].max;
        if (!undefinedJ(max)) {
            newCell2.appendChild(document.createTextNode(max))
            newCell2 = newRow2.insertCell(2);
            let addon = '';
            switch (true) {
                case (max < 3):
                    addon = 'Low';
                    newCell2.setAttribute('style', 'color:green;');
                    break;
                case (max < 6):
                    addon = 'Moderate';
                    newCell2.setAttribute('style', 'color:orange;');
                    break;
                case (max < 8):
                    addon = 'High';
                    newCell2.setAttribute('style', 'color:#DD571C;');
                    break;
                case (max < 11):
                    addon = 'Very High';
                    newCell2.setAttribute('style', 'color:red;');
                    break;
                case (max >= 11):
                    addon = 'Extreme';
                    newCell2.setAttribute('style', 'color:lilac;');
                    break;
            }
            newCell2.appendChild(document.createTextNode(addon));
        } else
            newCell2.appendChild(document.createTextNode('N.A.'));
    }
}

//This function provides the air quality information (in the modal)
const info = document.querySelector("#buttonInfo");
info.addEventListener('click', function() {
    const myModal = new bootstrap.Modal(document.getElementById('infoModal'));
    document.querySelector("#headerAir").textContent = 'Learn about Air Quality Pollutants';
    let tableModal = document.querySelector("#infoTable");
    if (document.querySelector("#infoMod"))
        document.querySelector("#infoMod").remove();
    let bodyT = document.createElement('tbody');
    bodyT.id = "infoMod";
    tableModal.appendChild(bodyT);
    let newRow = bodyT.insertRow(-1);
    let headerI = ['Air quality Index', 'Ozone (O3)', 'Particulate Matter (PM10)', 'Particulate Matter (PM2.5)', 'Nitrogen Dioxide (NO2)', 'Sulphur Dioxide (SO2)', 'Carbon Monoxide (CO)'];
    let descs = ['The Air Quality Index (AQI) indicates how clean or polluted air is.', 'Ozone at ground level is a harmful air pollutant, because of its effects on people.', 'Fine particles in air, like dust. PM10 is also known as respirable particulate matter.', 'Tiny particles in the air that reduce visibility and cause the air to appear hazy.', 'Nitrogen dioxide is part of a group of gaseous air pollutants produced as a result of road traffic and other fossil fuel consumption processes.', 'A colorless, reactive air pollutant with a strong odor. This gas can be a threat to human health, animal health, and plant life.', 'Carbon monoxide (CO) is an odorless, colorless gas formed by the incomplete combustion of fuels.'];
    for (i = 0; i < headerI.length; i++) {
        newRow = bodyT.insertRow(-1);
        newCell = newRow.insertCell(0);
        newCell.setAttribute("style", "font-weight:bold;");
        newCell.appendChild(document.createTextNode(headerI[i]));
        newCell = newRow.insertCell(1);
        newCell.appendChild(document.createTextNode(descs[i]));
    }
    myModal.show();
})

//Request to get the last 5 requests - Log button 
const logging = document.querySelector('#log');
logging.addEventListener('click', function() {
    // Set up our HTTP request
    var xhr = new XMLHttpRequest();
    // Setup our listener to process completed requests
    xhr.onreadystatechange = function() {
        // Only run if the request is complete
        if (xhr.readyState !== 4)
            return;
        // Process our return data
        if (xhr.status >= 200 && xhr.status < 300) {
            getReq(JSON.parse(xhr.responseText));
        } else {
            console.log('error', xhr);
        }
    };
    const userid = 'dhadji02';
    xhr.open('GET', 'act.php?username=' + userid);
    xhr.send();
})

//This function, prints the requests to the modal of the log button 
function getReq(objLog) {
    const myModal = new bootstrap.Modal(document.getElementById('logModal'));
    document.querySelector("#headerLog").textContent = 'Last 5 requests';
    let tableModal = document.querySelector("#logTable");
    if (document.querySelector("#tableLogH"))
        document.querySelector("#tableLogH").remove();
    if (document.querySelector("#tableLog"))
        document.querySelector("#tableLog").remove();
    let tableHeader = ['Time', 'Address', 'Region', 'City'];
    let header = document.createElement('thead');
    header.id = 'tableLogH';
    header.classList.add('alignH');
    tableModal.appendChild(header);
    let row = header.insertRow(0);
    for (i = 0; i < tableHeader.length; i++) {
        let x = document.createElement("th");
        x.textContent = tableHeader[i];
        row.appendChild(x);
    }
    let bodyT = document.createElement('tbody');
    bodyT.id = "tableLog";
    tableModal.appendChild(bodyT);
    let newRow, newCell, newText;
    for (i = 0; i < objLog.length; i++) {
        newRow = bodyT.insertRow(-1);
        for (j = 0; j < 4; j++) {
            switch (j) {
                case 0:
                    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let dateL;
                    if (!undefinedJ(objLog[i].timestamp)) {
                        dateL = new Date(objLog[i].timestamp * 1000);
                        newText = document.createTextNode(objLog[i].address);
                        newText = document.createTextNode(dateL.getDate() + ' ' + months[dateL.getMonth()] + ' ' + dateL.getFullYear() + ' ' + timeConverter(dateL.getTime(), 0));
                    } else
                        newText = document.createTextNode("N.A.");
                    newCell = newRow.insertCell(j);
                    newCell.appendChild(newText);
                    break;
                case 1:
                    newCell = newRow.insertCell(j);
                    if (!undefinedJ(objLog[i].address))
                        newText = document.createTextNode(objLog[i].address);
                    else
                        newText = document.createTextNode("N.A.");
                    newCell.appendChild(newText);
                    break;
                case 2:
                    newCell = newRow.insertCell(j);
                    if (!undefinedJ(objLog[i].region))
                        newText = document.createTextNode(objLog[i].region);
                    else
                        newText = document.createTextNode("N.A.");
                    newCell.appendChild(newText);
                    break;
                case 3:
                    newCell = newRow.insertCell(j);
                    if (!undefinedJ(objLog[i].city))
                        newText = document.createTextNode(objLog[i].city);
                    else
                        newText = document.createTextNode("N.A.");
                    newCell.appendChild(newText);
                    break;
            }
        }
    }
    myModal.show();
}

//Function that posts a request to the database via PHP
function postReq(address, region, city) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
            xhr.responseText;
        } else {
            console.log('error', xhr);
        }
    };
    xhr.open('POST', 'act.php');
    xhr.setRequestHeader("Content-Type", "application/json");
    const data = {};
    data.username = 'dhadji02';
    data.address = address;
    data.region = region;
    data.city = city;
    xhr.send(JSON.stringify(data));
}