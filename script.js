// Taraz App - Core Logic
// Version: V3 - Map Integration Ready

// 1. Navigation System
function go(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    // Show requested screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Manage Bottom Nav Visibility (Hide nav on Map screen for Snap-like experience)
    const nav = document.getElementById('nav');
    if (screenId === 'map') {
        document.body.classList.add('map-mode');
        initMap(); // Initialize map when entering map screen
    } else {
        document.body.classList.remove('map-mode');
    }

    // Update Nav Item Active State
    updateNavUI(screenId);
}

function updateNavUI(screenId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        // Check if the onclick attribute matches the screenId
        if (item.getAttribute('onclick')?.includes(`'${screenId}'`) || 
            (screenId === 'home' && item.onclick?.toString().includes('home')) ||
            (screenId === 'map' && item.onclick?.toString().includes('map'))) {
            item.classList.add('active');
        }
    });
}

// 2. Map Engine (Leaflet Integration)
let map = null;

function initMap() {
    // Only initialize if map hasn't been initialized yet
    if (map !== null) return;

    console.log("Initializing Taraz Map Engine...");
    
    // Coordinates for Iran (Default view)
    const iranCoords = [32.4279, 53.6880];

    map = L.map('main-map', {
        zoomControl: false // We will position it manually or hide it for cleaner UI
    }).setView(iranCoords, 5);

    // Using OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add a sample marker to show functionality
    L.marker([35.6892, 51.3890]).addTo(map)
        .bindPopup('مأموریت فعال در تهران')
        .openPopup();

    console.log("Map Ready.");
}

// 3. App Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("Taraz App Started...");
    
    // Start at Home screen
    go('home');

    // Handle potential errors in map loading
    window.addEventListener('error', function(e) {
        console.error("App Error: ", e.message);
    }, true);
});

// 4. Placeholder for Future Modules (Missions, Conversations, etc.)
// These will be linked to Supabase in the next development step.
const api = {
    async fetchMissions() {
        console.log("Fetching missions from Supabase...");
        // Logic for Supabase call goes here
    },
    async postMission(data) {
        console.log("Posting new mission...", data);
    }
};
