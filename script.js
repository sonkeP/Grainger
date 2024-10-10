// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map centered on the Atlantic Ocean (for hurricanes)
    var map = L.map('map').setView([20, -60], 4); // Adjust the center based on where hurricanes are expected

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize an empty heatmap layer
    var heatLayer = L.heatLayer([], {
        radius: 30,   // Increase radius for better visibility
        blur: 25,     // Increase blur to smoothen the heatmap
        maxZoom: 8,   // Adjust based on map zoom level
        gradient: {    // Define a gradient for different risk levels
            0.0: 'green',   // Low Risk
            0.5: 'yellow',  // Moderate Risk
            1.0: 'red'      // High Risk
        }
    }).addTo(map);

    // Function to fetch earthquake data from USGS Earthquake API
    function fetchEarthquakeData() {
        return fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
            .then(response => response.json())
            .then(data => {
                return data.features.map(feature => ({
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0],
                    intensity: feature.properties.mag,
                    place: feature.properties.place,
                    depth: feature.geometry.coordinates[2] // Adding depth information
                }));
            });
    }

    // Function to fetch hurricane data from NOAA API
    function fetchHurricaneData() {
        return fetch('https://www.nhc.noaa.gov/CurrentStorms.json') // Example NOAA API URL
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                return data.activeStorms.map(storm => ({
                    lat: parseFloat(storm.latitude),
                    lng: parseFloat(storm.longitude),
                    intensity: storm.windSpeed, // Use wind speed directly
                    name: storm.name // Add storm name
                }));
            });
    }

    // Function to determine risk level based on depth
    function getRiskLevel(depth) {
        if (depth < 30) return "High Risk";
        if (depth >= 30 && depth <= 70) return "Moderate Risk";
        return "Low Risk";
    }

    // Function to determine heatmap intensity based on depth
    function getIntensityForHeatmap(depth) {
        if (depth < 30) return 1.0; // High Risk
        if (depth >= 30 && depth <= 70) return 0.5; // Moderate Risk
        return 0.0; // Low Risk
    }

    // Function to update earthquake data and refresh the map
    function updateEarthquakeData() {
        console.log('Updating earthquake data...');
        fetchEarthquakeData()
            .then(earthquakes => {
                if (!earthquakes || earthquakes.length === 0) {
                    console.log('No earthquakes found.');
                    return;
                }

                // Update heatmap
                heatLayer.setLatLngs(earthquakes.map(eq => [eq.lat, eq.lng, getIntensityForHeatmap(eq.depth)]));

                // Clear existing markers
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Add markers for earthquakes with popups
                earthquakes.forEach(eq => {
                    L.marker([eq.lat, eq.lng])
                        .addTo(map)
                        .bindPopup(`Magnitude: ${eq.intensity} <br> Depth: ${eq.depth} km <br> Risk Level: ${getRiskLevel(eq.depth)} <br> Location: ${eq.place}`);
                });
            })
            .catch(error => {
                console.error('Error updating earthquake data:', error);
            });
    }

    // Function to update hurricane heatmap data
    function updateHurricaneHeatmap() {
        console.log('Updating hurricane heatmap data...');
        fetchHurricaneData()
            .then(hurricanes => {
                if (!hurricanes || hurricanes.length === 0) {
                    console.log('No hurricanes found.');
                    return;
                }

                // Update heatmap
                heatLayer.setLatLngs(hurricanes.map(h => [h.lat, h.lng, h.intensity / 100]));

                // Clear existing markers
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Add markers for hurricanes with popups
                hurricanes.forEach(h => {
                    L.marker([h.lat, h.lng])
                        .addTo(map)
                        .bindPopup(`Hurricane: ${h.name} <br> Wind Speed: ${h.intensity} mph`);
                });
            })
            .catch(error => {
                console.error('Error updating hurricane heatmap:', error);
            });
    }

    // Trigger earthquake updates when the Real-Time Updates button is clicked
    document.getElementById('liveUpdatesButton').addEventListener('click', updateEarthquakeData);

    // Trigger heatmap updates when the Heatmaps button is clicked
    document.getElementById('heatmapsBtn').addEventListener('click', updateHurricaneHeatmap);

    // Initial update for earthquake data
    updateEarthquakeData();

    function fetchRealTimeUpdates() {
        fetch('http://localhost:5000/api/real-time-data')
            .then(response => response.json())
            .then(data => updateAlerts(data))
            .catch(error => console.error('Error:', error));
    }

    // Update real-time alerts on the page
    function updateAlerts(data) {
        const alertsSection = document.querySelector('.real-time-updates');
        alertsSection.innerHTML = ''; // Clear previous alerts

        data.articles.forEach(article => {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert';
            alertElement.innerText = `${article.title} - ${article.source.name}`;
            console.log(alertElement.innerText);
            alertsSection.appendChild(alertElement);
        });
    }

    // Trigger real-time updates when the Live Updates button is clicked
    document.getElementById('liveUpdatesButton').addEventListener('click', fetchRealTimeUpdates);

    // Fetch real-time updates every 60 seconds (optional)
    setInterval(fetchRealTimeUpdates, 60000);

    // Initial fetch for real-time updates (if needed)
    fetchRealTimeUpdates();
});
