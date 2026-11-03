import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { Plus, Mic, X, Navigation, Play, Square, Map as MapIcon } from 'lucide-react';
import './index.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Use a fallback location if GPS isn't available
const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125
};

const statuses = [
  { id: 'high', label: 'High Priority', color: '#EF4444' }, // Red
  { id: 'success', label: 'Visited - Success', color: '#10B981' }, // Green
  { id: 'followup', label: 'Needs Follow-up', color: '#F59E0B' }, // Yellow
  { id: 'skip', label: 'Visit Next Time', color: '#9CA3AF' }, // Gray
];

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    // IMPORTANT: Replace with an actual Google Maps API Key to remove the watermark
    googleMapsApiKey: "" // Leave empty to show development map, or add key if available
  });

  const [map, setMap] = useState(null);
  
  // Persistent State
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('evoMap_locations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [routePath, setRoutePath] = useState(() => {
    const saved = localStorage.getItem('evoMap_routePath');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isTracking, setIsTracking] = useState(() => {
    const saved = localStorage.getItem('evoMap_isTracking');
    return saved ? JSON.parse(saved) : false;
  });

  const [historyJourneys, setHistoryJourneys] = useState(() => {
    const saved = localStorage.getItem('evoMap_historyJourneys');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryRoute, setActiveHistoryRoute] = useState(null); 
  const [formData, setFormData] = useState({ name: '', phone: '', status: 'high', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false); // For snap-to-road loading
  
  const watchIdRef = useRef(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('evoMap_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('evoMap_routePath', JSON.stringify(routePath));
  }, [routePath]);

  useEffect(() => {
    localStorage.setItem('evoMap_isTracking', JSON.stringify(isTracking));
  }, [isTracking]);

  useEffect(() => {
    localStorage.setItem('evoMap_historyJourneys', JSON.stringify(historyJourneys));
  }, [historyJourneys]);

  // Handle Tracking Logic
  useEffect(() => {
    if (isTracking && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setCurrentLocation(newPos);
          
          // Add to route path
          setRoutePath(prev => [...prev, newPos]);

          // Pan map to new location
          if (map) {
            map.panTo(newPos);
          }
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, map]);

  // Initial Location Fetch (if not tracking)
  useEffect(() => {
    if (!isTracking && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
      });
    }
  }, [isTracking]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const pos = { lat: latitude, lng: longitude };
        setCurrentLocation(pos);
        if (map) map.panTo(pos);
      });
    }
  };

  const fetchSnappedPath = async (rawPath) => {
    if (rawPath.length < 2) return rawPath;
    
    // OSRM public API allows max 100 coordinates.
    // If we have more than 90 points, we downsample them evenly to fit the limit.
    let pointsToSnap = rawPath;
    if (pointsToSnap.length > 90) {
      const step = Math.ceil(pointsToSnap.length / 90);
      pointsToSnap = pointsToSnap.filter((_, i) => i % step === 0);
    }

    const coordinates = pointsToSnap.map(p => `${p.lng},${p.lat}`).join(';');
    try {
      const res = await fetch(`https://router.project-osrm.org/match/v1/driving/${coordinates}?geometries=geojson&overview=full`);
      const data = await res.json();
      if (data.code === 'Ok' && data.matchings && data.matchings.length > 0) {
        // matchings[0].geometry.coordinates is an array of [lng, lat]
        return data.matchings[0].geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));
      }
    } catch (e) {
      console.error("OSRM Snap failed", e);
    }
    return rawPath; // Return raw if snap fails
  };

  const toggleTracking = async () => {
    if (isTracking) {
      setIsProcessing(true);
      // Stopping tracking -> Snap to Road & Save to history
      if (routePath.length > 1) {
        const snappedPath = await fetchSnappedPath(routePath);
        const newJourney = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          path: snappedPath
        };
        setHistoryJourneys(prev => [newJourney, ...prev]);
      }
      setIsProcessing(false);
      setIsTracking(false);
      setRoutePath([]); // Clear current route
      setActiveHistoryRoute(null); // Clear active history
    } else {
      // Starting tracking
      setRoutePath(currentLocation ? [currentLocation] : []);
      setActiveHistoryRoute(null);
      setIsTracking(true);
    }
  };

  const viewHistoryRoute = (journey) => {
    setActiveHistoryRoute(journey);
    setIsHistoryOpen(false);
    
    // Pan to start of the route
    if (map && journey.path.length > 0) {
      map.panTo(journey.path[0]);
    }
  };

  const handleOpenSheet = () => {
    if (!currentLocation) {
      alert("Fetching location... please wait.");
      handleLocateMe();
      return;
    }
    setIsSheetOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("Please enter a name.");
      return;
    }
    const newLocation = {
      id: Date.now(),
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      ...formData
    };
    setLocations([...locations, newLocation]);
    setIsSheetOpen(false);
    setFormData({ name: '', phone: '', status: 'high', notes: '' });
  };

  const getMarkerIcon = (status) => {
    const statusObj = statuses.find(s => s.id === status);
    const color = statusObj ? statusObj.color : '#EF4444';
    
    // Create an SVG marker string with the specific color
    const svgIcon = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `);
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${svgIcon}`,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32)
    };
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapIcon size={20} color="var(--primary)" />
          Google FieldOps
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {activeHistoryRoute && (
            <button 
              onClick={() => setActiveHistoryRoute(null)}
              style={{ background: 'var(--status-high)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              Clear Route
            </button>
          )}
          <button 
            onClick={() => setIsHistoryOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
          >
            History
          </button>
          <button 
            onClick={handleLocateMe}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
          >
            <Navigation size={18} />
          </button>
        </div>
      </div>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || defaultCenter}
          zoom={15}
          onLoad={setMap}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapId: 'DEMO_MAP_ID' // Enable advanced markers
          }}
        >
          {/* Draw the Current Route Path */}
          {routePath.length > 1 && (
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#4F46E5', // Primary blue
                strokeOpacity: 0.8,
                strokeWeight: 5,
              }}
            />
          )}

          {/* Draw History Route Path if selected */}
          {activeHistoryRoute && activeHistoryRoute.path.length > 0 && (
            <>
              <Polyline
                path={activeHistoryRoute.path}
                options={{
                  strokeColor: '#9CA3AF', // Solid Gray for history
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                }}
              />
              {/* Start Point Marker */}
              <Marker 
                position={activeHistoryRoute.path[0]} 
                label="A"
                title="Start of Journey"
              />
              {/* End Point Marker */}
              <Marker 
                position={activeHistoryRoute.path[activeHistoryRoute.path.length - 1]} 
                label="B"
                title="End of Journey"
              />
            </>
          )}

          {/* Current Location Indicator (Blue Dot) */}
          {currentLocation && (
            <Marker 
              position={currentLocation} 
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              }}
              zIndex={999}
            />
          )}

          {/* Saved Locations */}
          {locations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={{ lat: loc.lat, lng: loc.lng }} 
              icon={getMarkerIcon(loc.status)}
              title={loc.name}
              onClick={() => {
                alert(`Lead: ${loc.name}\nStatus: ${loc.status}\nNotes: ${loc.notes}`);
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Tracking Control Panel */}
      <div className="tracking-panel">
        <button 
          className={`track-btn ${isTracking ? 'tracking' : ''}`} 
          onClick={toggleTracking}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <><Square size={20} /> Snapping to Road...</>
          ) : isTracking ? (
            <><Square size={20} /> Stop Journey</>
          ) : (
            <><Play size={20} /> Start Journey</>
          )}
        </button>
      </div>

      {/* Main FAB for Adding Lead */}
      <button className="fab" onClick={handleOpenSheet} style={{ bottom: isTracking ? '90px' : '90px' }}>
        <Plus size={28} />
      </button>

      {/* Bottom Sheet for Data Entry */}
      <div className={`sheet-overlay ${isSheetOpen ? 'open' : ''}`} onClick={() => setIsSheetOpen(false)}></div>
      <div className={`bottom-sheet ${isSheetOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Log New Visit</h3>
          <button onClick={() => setIsSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div className="form-group">
          <label>Google Maps Location / Shop Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Acme Corp" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Visit Status</label>
          <div className="status-grid">
            {statuses.map(s => (
              <button 
                key={s.id}
                className={`status-btn ${formData.status === s.id ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, status: s.id})}
                style={{ borderColor: formData.status === s.id ? s.color : '#D1D5DB' }}
              >
                <div className="dot" style={{ backgroundColor: s.color }}></div>
                <span style={{ fontSize: '0.75rem' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Notes</span>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
              <Mic size={14} /> Voice Note
            </button>
          </label>
          <textarea 
            className="form-input" 
            rows="3" 
            placeholder="Any observations..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          Save Location
        </button>
      </div>

      {/* History Modal */}
      <div className={`sheet-overlay ${isHistoryOpen ? 'open' : ''}`} onClick={() => setIsHistoryOpen(false)}></div>
      <div className={`bottom-sheet ${isHistoryOpen ? 'open' : ''}`} style={{ height: '70vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Journey History</h3>
          <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        {historyJourneys.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No saved journeys yet.</p>
        ) : (
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px' }}>
            {historyJourneys.map(journey => (
              <div 
                key={journey.id} 
                onClick={() => viewHistoryRoute(journey)}
                style={{ 
                  padding: '16px', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  backgroundColor: activeHistoryRoute?.id === journey.id ? '#EFF6FF' : 'white',
                  borderColor: activeHistoryRoute?.id === journey.id ? 'var(--primary)' : '#E5E7EB'
                }}
              >
                <strong>Journey</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{journey.date}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#4F46E5' }}>
                  {journey.path.length} data points recorded
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
