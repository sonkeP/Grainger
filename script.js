// Initialize map centered on the US
var map = L.map('map').setView([37.8, -96], 4); // US view

// Add base tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample data for disaster locations (earthquakes and floods)
var disasterData = [
    [37.78, -122.42, 0.7], // San Francisco (earthquake)
    [34.05, -118.24, 0.9], // Los Angeles (earthquake)
    [40.73, -73.93, 0.6],  // New York (flood)
    [29.76, -95.37, 0.8],  // Houston (flood)
];

// Add heatmap layer
var heatLayer = L.heatLayer(disasterData, {
    radius: 20,
    blur: 15,
    maxZoom: 10,
    max: 1.0
}).addTo(map);

// Add markers to specify exact disaster locations
disasterData.forEach(function (point) {
    var lat = point[0];
    var lng = point[1];
    var intensity = point[2];

    // Add a marker for each disaster location
    L.marker([lat, lng]).addTo(map)
        .bindPopup('Disaster location<br>Intensity: ' + intensity)
        .openPopup();
});

// Function to update earthquake data from USGS Earthquake API
function fetchEarthquakeData() {
    return fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
        .then(response => response.json())
        .then(data => {
            // Parse geojson data for earthquakes
            return data.features.map(feature => [
                feature.geometry.coordinates[1], // Latitude
                feature.geometry.coordinates[0], // Longitude
                feature.properties.mag / 10      // Intensity scaled down
            ]);
        });
}

// Function to update flood data (hypothetical API, replace with real flood data source)
function fetchFloodData() {
    // Example: Replace this URL with a real flood data API endpoint
    return fetch('https://api.example.com/floods')
        .then(response => response.json())
        .then(data => {
            // Parse the flood data
            return data.features.map(feature => [
                feature.geometry.coordinates[1], // Latitude
                feature.geometry.coordinates[0], // Longitude
                feature.properties.severity / 10  // Flood severity scaled down
            ]);
        });
}

// Function to combine earthquake and flood data and update heatmap
function updateDisasterData() {
    console.log('Updating disaster data...');

    // Fetch both earthquake and flood data
    Promise.all([fetchEarthquakeData(), fetchFloodData()])
        .then(results => {
            // Combine earthquake and flood data into one array
            const combinedData = results[0].concat(results[1]);

            // Update heatmap with combined data
            heatLayer.setLatLngs(combinedData);

            // Update map with disaster markers
            combinedData.forEach(function (point) {
                var lat = point[0];
                var lng = point[1];
                var intensity = point[2];

                // Add or update a marker for each disaster location
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('Disaster location<br>Intensity: ' + intensity)
                    .openPopup();
            });
        });
}

// Trigger real-time updates when the button is clicked
document.getElementById('liveUpdatesButton').addEventListener('click', updateDisasterData);
