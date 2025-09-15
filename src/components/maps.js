import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom train icon
const trainIcon = new L.Icon({
  iconUrl: "/images/shairyar-khan-7WLTx9Y7OUk-unsplash.jpg", // keep a small train image here
  iconSize: [40, 40],
});

function TrainMap() {
  const [trainData, setTrainData] = useState({
    lat: 28.6448, // Delhi start
    lng: 77.2167,
    name: "Rajdhani Express",
    status: "On Time",
  });

  // Fake train movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainData((prev) => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.1, // random move
        lng: prev.lng + (Math.random() - 0.5) * 0.1,
        status: "Running Smoothly 🚆",
      }));
    }, 5000); // update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
     <section className="w-full bg-blue-200 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left side: Tagline and Content */}
         <div className="flex-grow">
          <h1 className="text-5xl lg:text-5xl font-bold text-slate-900">
            Track Trains
          </h1> 
          <h1 className="text-5xl lg:text-5xl font-bold text-blue-900">
            in Real-Time
          </h1> 
          <h1 className="text-5xl lg:text-5xl font-bold text-slate-900">
           Right on the Map
          </h1>
           <p className="text-lg text-slate-500">
           Visualize live train movements, monitor their status, and stay updated with interactive maps.
          </p>
        </div>

        {/* Right side: Overlapping Images */}
        <div className="relative h-96">
          {/* Larger Image (in the back) */}
          <div className="absolute top-0 right-0 w-4/5 h-4/5">
            <img 
              src="/images/sourav-debnath-vuRHraI4Dq4-unsplash.jpg" 
              alt="Architectural detail" 
              className="w-full h-full object-cover border-4 border-white rounded-lg shadow-2xl"
            />
          </div>
          
          {/* Smaller Image (overlapping on top) */}
          <div className="absolute bottom-0 left-0 w-2/3 h-2/3">
            <img 
              src="/images/shairyar-khan-7WLTx9Y7OUk-unsplash.jpg"
              alt="Modern building facade" 
              className="w-full h-full object-cover rounded-lg shadow-2xl border-4 border-white"
            />
          </div>
        </div>

      </div>
    </section>
    <div className="w-full h-[600px] my-10 px-6">
     
      <MapContainer
        center={[trainData.lat, trainData.lng]}
        zoom={6}
        className="h-full w-full rounded-lg shadow-lg"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[trainData.lat, trainData.lng]} icon={trainIcon}>
          <Popup>
            🚆 <b>{trainData.name}</b> <br />
            Status: {trainData.status}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
    </>
  );
}

export default TrainMap;
