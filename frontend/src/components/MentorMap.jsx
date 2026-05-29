import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// City coordinates mapping for Indian cities
const CITY_COORDS = {
  Hyderabad:  [17.3850, 78.4867],
  Bangalore:  [12.9716, 77.5946],
  Chennai:    [13.0827, 80.2707],
  Pune:       [18.5204, 73.8567],
  Mumbai:     [19.0760, 72.8777],
  Delhi:      [28.6139, 77.2090],
};

export default function MentorMap({ mentors, studentCity }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const navigate = useNavigate();

  // 1. Initialize Map Container & CartoDB Dark Matter Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map instance if hot-reload or remount happens
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = CITY_COORDS[studentCity] || CITY_COORDS.Hyderabad;
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 6,
      zoomControl: false
    });

    mapInstanceRef.current = map;
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Dark Matter tile layer matches the obsidian platform aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Create marker overlay layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [studentCity]);

  // 2. Render Markers on filtered/recommended mentors update
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Group mentors by city to calculate spiral jitter offsets
    const cityGroups = {};
    mentors.forEach((m) => {
      const profile = m.mentor_data ? m.mentor_data : m;
      const city = profile.user?.city || 'Hyderabad';
      if (!cityGroups[city]) {
        cityGroups[city] = [];
      }
      cityGroups[city].push(m);
    });

    // Populate pins on Leaflet map instance
    Object.keys(cityGroups).forEach((city) => {
      const cityMentors = cityGroups[city];
      const baseCoords = CITY_COORDS[city] || CITY_COORDS.Hyderabad;

      cityMentors.forEach((m, idx) => {
        const profile = m.mentor_data ? m.mentor_data : m;
        const score = m.score;
        const isAi = score !== undefined;

        // Calculate spiral scatter coordinates to prevent overlaps
        let lat = baseCoords[0];
        let lng = baseCoords[1];
        if (cityMentors.length > 1 && idx > 0) {
          const angle = idx * 0.9;
          const radius = 0.015 * Math.sqrt(idx);
          lat += radius * Math.cos(angle);
          lng += radius * Math.sin(angle);
        }

        // Pulse recommendation indicator ring (emerald AI match, indigo default)
        const pinHtml = `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${isAi ? 'bg-emerald-400/60' : 'bg-indigo-400/60'} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${isAi ? 'bg-emerald-500 border border-emerald-400/30' : 'bg-indigo-500 border border-indigo-400/30'} shadow-[0_0_8px_rgba(99,102,241,0.4)]"></span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-map-pin',
          html: pinHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon });

        // Domain badges layout
        const domainsHtml = (profile.domains || []).slice(0, 3).map(d => `
          <span class="py-0.5 px-2 rounded bg-slate-900 border border-slate-800 text-[9px] font-black text-silver uppercase tracking-wider">
            ${d}
          </span>
        `).join(' ');

        // Setup Popup DOM container
        const popupDiv = document.createElement('div');
        popupDiv.className = 'p-4 bg-[#0d0d11]/95 text-silver rounded-2xl border border-white/8 space-y-3 min-w-[220px] backdrop-blur-md shadow-2xl';
        popupDiv.innerHTML = `
          <div class="space-y-1">
            <h4 class="font-extrabold text-sm text-cyber-white m-0 tracking-tight leading-tight">${profile.user?.name}</h4>
            <div class="flex items-center justify-between text-slate-muted text-[10px] font-semibold">
              <span>📍 ${profile.user?.city}</span>
              ${score ? `<span class="text-emerald-400 font-extrabold uppercase text-[8px] bg-emerald-500/10 py-0.5 px-1.5 border border-emerald-500/25 rounded">⚡ ${score}% Match</span>` : ''}
            </div>
          </div>
          
          <div class="flex items-center gap-1.5 text-[11px] font-medium border-t border-white/5 pt-2">
            <div class="flex items-center text-amber-400 fill-amber-400">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-cyber-white font-black ml-1">${profile.avg_rating?.toFixed(1) || '0.0'}</span>
            </div>
            <span class="text-white/10">|</span>
            <span class="text-slate-muted">${profile.session_count || 0} sessions</span>
          </div>
          
          <div class="flex flex-wrap gap-1 pt-1">
            ${domainsHtml}
          </div>
          
          <button class="w-full mt-3 py-2 px-3 rounded-xl bg-cyber-white text-black font-extrabold text-[10px] text-center uppercase tracking-wider hover:bg-silver transition-all duration-300 border-0 shadow-md cursor-pointer">
            View Full Profile
          </button>
        `;

        // Direct router binding on button inside leaflet popup
        popupDiv.querySelector('button').addEventListener('click', () => {
          navigate(`/mentor/${profile.user?.id}`, { state: { matchScore: score, matchReason: m.reason } });
        });

        marker.bindPopup(popupDiv, {
          closeButton: false,
          className: 'custom-leaflet-popup'
        });

        markersGroup.addLayer(marker);
      });
    });

    // Auto fit map boundary around coordinates
    const layers = markersGroup.getLayers();
    if (layers.length > 0) {
      const group = L.featureGroup(layers);
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [mentors, navigate]);

  return (
    <div className="w-full relative animate-stagger-fade">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[550px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl z-10" 
      />
    </div>
  );
}
