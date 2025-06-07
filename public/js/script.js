const socket = io({
  transports: ['websocket'], // Force WebSocket for Render
  upgrade: false
});
let map;
const markers = {};

// Initialize map when geolocation is available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Initialize map if not already done
            if (!map) {
                map = L.map('map').setView([latitude, longitude], 16);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Sheriyans Coding School'
                }).addTo(map);
            }
            
            // Send location to server
            socket.emit("sendLocation", { latitude, longitude });
        },
        (error) => {
            console.error("Error getting location:", error);
            // Fallback initialization if geolocation fails
            if (!map) {
                map = L.map('map').setView([0, 0], 2);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Sheriyans Coding School'
                }).addTo(map);
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
} else {
    console.error("Geolocation not supported");
    // Initialize map without geolocation
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Sheriyans Coding School'
    }).addTo(map);
}

// Handle incoming location updates
socket.on("receiveLocation", (data) => {
    const { id, latitude, longitude } = data;
    
    // Update or create marker
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
        // Center map on new marker (optional)
        map.setView([latitude, longitude], 16);
    }
});

// Handle user disconnections
socket.on("userDisconnected", (data) => {
    const { id } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});