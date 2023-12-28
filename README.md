**Weather Forecast Web Application (HTML/CSS/JAVASCRIPT/PHP/MYSQL)**

**04/2021**

**Author:** Demetra Hadjicosti - dhadji02
**Files:**  index.html, ScriptWeather.js, StyleWeather.css, act.php

**Description:**
The webpage opens on a form where the user enters the address and the city of their choice (in Cyprus) to fetch weather forecast information for the current day and the next 24 hours as well as air quality information. 

**Tab with Air Quality information and UV Index for the selected city**. The API providing this information is: api.waqi.info. This tab gives information about air quality index and pollutants,  particulate matter forecast and UV Index forecast.
**It contains 3 tables:**
- The 1st table, is about current air quality index and pollutants (O3, NO2, SO2, CO).
- The 2nd table, gives a forecast about the average Particulate Matter (PM10, PM2.5). Both values represent particles flaoting in the air. The forecast table contains these values for 4 days, starting from the day that the request was made.
- The 3rd table, contains data for the max Ultraviolet Index (UV index) for 4 days, starting from the day that the request was 
made.
This tab, also contains a button named "Learn about air quality data" which opens a Modal which has a table that provides definitions about the different indexes and pollutants for the user's knowledge. The values of air quality index, particulate matter and risk of harm from UV exposure, are colored to a certain colour that 
represents the level of health concern.

The database connection functionality can work only if the webpage is hosted on a web server.
