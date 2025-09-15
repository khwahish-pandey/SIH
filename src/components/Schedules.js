import React from 'react';
import { useEffect,useState } from 'react';
import { trainList } from '../utils/trainList';
export default function Shedules(){
const [allTrains,SetallTrains]=useState([]);
const normalizeTrainNo = (num) => num.toString().replace(/^0+/, "");
useEffect(()=>{
    

const fetchTrains=async()=>{
    const res=await fetch('https://railway-details.onrender.com/trains/livemap')
    const data= await res.json();
   // console.log("data",data)
    const trains = data.data || []; 
      SetallTrains(trains);
    
   }
  fetchTrains();
    
    
  },[])

       
     function formatTrainData(apiTrain, listTrain) {
     return {
    trainNo: apiTrain.train_number,
    trainName: listTrain?.trainName || apiTrain.train_name,
    status: listTrain?.status || "Unknown",
    departure: listTrain?.departure || "--",
    arrival: listTrain?.arrival || "--",

    // Live location
    currentStation: apiTrain.current_station_name,
    nextStation: apiTrain.next_station_name,
    lat: apiTrain.current_lat,
    lng: apiTrain.current_lng,

    // Timing info
    minsSinceDep: apiTrain.mins_since_dep,
    nextArrivalIn: apiTrain.next_arrival_minutes,
    distanceFromSourceKm: apiTrain.distance_from_source_km,

 
    type: apiTrain.type,
    };
   }


        const blrTrains = allTrains.filter(train =>
        trainList.some(listItem =>
          normalizeTrainNo(train.train_number) === listItem.trainNo.toString()
        ));
       

        const formattedTrains = blrTrains.map(apiTrain => {
  const listTrain = trainList.find(t => t.trainNo === normalizeTrainNo(apiTrain.train_number));
  return formatTrainData(apiTrain, listTrain);
});

console.log("Formatted Trains:", formattedTrains);



       const getStatusStyle = (status) => {
    if (status === "On Time") {
      return "bg-green-200 text-green-800";
    } else if (status === "Cancelled") {
      return "bg-red-200 text-red-800";
    } else if (status === "Passing Through") {
      return "bg-blue-200 text-blue-800";
    } else if (status && status.includes("Early")) {
      return "bg-cyan-200 text-cyan-800";
    } else if (status && status.includes("Delayed")) {
      if (status.includes("+15m") || status.includes("+20m")) {
        return "bg-orange-200 text-orange-800";
      } else {
        return "bg-yellow-200 text-yellow-800";
      }
    } else {
      return "bg-purple-200 text-purple-800";
    }
  };

  // Function to get action button styling and text
  const getActionButton = (status) => {
    if (status === "On Time" || status === "Passing Through") {
      return {
        className: "bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs",
        text: "Track"
      };
    } else if (status === "Cancelled") {
      return {
        className: "bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded text-xs",
        text: "Reroute"
      };
    } else if (status && status.includes("Delayed +15m")) {
      return {
        className: "bg-orange-500 text-white hover:bg-orange-600 px-3 py-1 rounded text-xs",
        text: "Adjust"
      };
    } else {
      return {
        className: "bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 rounded text-xs",
        text: "Adjust"
      };
    }
  };

  // Function to determine actual time based on status
  const getActualTime = (scheduledTime, status) => {
    if (status === "Cancelled") {
      return "--";
    } else if (status && status.includes("Early")) {
      return scheduledTime; // You might want to calculate actual early time
    } else if (status && status.includes("Delayed")) {
      return scheduledTime; // You might want to calculate actual delayed time
    } else {
      return scheduledTime;
    }
  };

  return (
    <>
      <div className="flex w-full bg-blue-200 shadow-lg overflow-hidden min-h-[500px]">
        {/* Container for the text content */}
        <div className="flex-1 p-8 sm:p-12 border-blue-500">
          <div className="w-full space-y-3 pt-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Stay Ahead
            </h1>
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900">
              With
            </h1>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Smarter Train Timings
            </h1>
            <p className="text-lg text-slate-500">
              Get real-time access to train schedules, plan journeys efficiently, and never miss a connection.
            </p>
          </div>
        </div>

        {/* Image Container */}
        <div className="hidden sm:block sm:w-1/3">
          <img
            src="/images/penta-sathwik-l6t1ixFldOo-unsplash.jpg"
            alt="Indian passenger train"
            className="w-full h-full object-cover rounded-tl-full rounded-bl-full border-l-8 border-white"
          />
        </div>
      </div>

      <div className="flex-1 p-3 lg:p-6">
        <div className="bg-blue-50 rounded-xl p-3 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Train Schedules</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-3 px-4 font-semibold">Train No</th>
                  <th className="text-left py-3 px-4 font-semibold">Train Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Current Station</th>
                  <th className="text-left py-3 px-4 font-semibold">Arrival</th>
                  <th className="text-left py-3 px-4 font-semibold">Departure</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formattedTrains.length > 0 ? formattedTrains.map((train, index) => {
                  const actionButton = getActionButton(train.status || "On Time");
                  
                  return (
                    <tr 
                      key={train.trainNo || index} 
                      className={`border-b border-blue-200 hover:bg-blue-100 ${index === formattedTrains.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="py-3 px-4 font-medium">{train.trainNo}</td>
                      <td className="py-3 px-4">{train.trainName}</td>
                      <td className="py-3 px-4">{train.currentStation}</td>
                      <td className="py-3 px-4">{train.arrival}</td>
                      <td className="py-3 px-4">{train.departure}</td>
                      <td className="py-3 px-4">
                        <span className={`${getStatusStyle(train.status || "On Time")} px-2 py-1 rounded-full text-xs font-medium`}>
                          {train.status || "On Time"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className={actionButton.className}>
                          {actionButton.text}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="py-8 px-4 text-center text-slate-500">
                      No train data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );


    
}
