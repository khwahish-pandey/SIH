import React, { useState, useEffect, useMemo, useRef } from 'react';
import Tagline from './tagline';
import AlertFeed from './AlertFeed';
import Corosel from './corosel';

// --- INITIAL DATA & CONFIGURATION ---

// Station locations as percentages along the track
const stationLocations = {
    Kengeri: 38,
    Hejjala: 48,
    Bidadi: 60,
    Ketohalli: 78,
    Mandya: 88,
};

// Track convergence points
const convergencePoints = [
    { tracks: ['p1_full', 'p2_full'], at: 35 },
    { tracks: ['p4_full', 'p5_full'], at: 50 },
    { tracks: ['p8_full', 'p9_full'], at: 65 },
];


const initialTrains = {
    'T123': { id: 'T123', status: 'At Platform', trackId: 'p1_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 80 },
    'T456': { id: 'T456', status: 'At Platform', trackId: 'p2_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 85 },
    'T789': { id: 'T789', status: 'At Platform', trackId: 'p3_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 70 },
    'T101': { id: 'T101', status: 'At Platform', trackId: 'p4_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 80 },
    'T212': { id: 'T212', status: 'En Route', trackId: 'p5_full', position: 2, color: 'bg-green-500', speed: 90, baseSpeed: 90 },
    'T313': { id: 'T313', status: 'En Route', trackId: 'p6_full', position: 20, color: 'bg-blue-500', speed: 80, baseSpeed: 80 },
    'T414': { id: 'T414', status: 'En Route', trackId: 'p7_full', position: 8, color: 'bg-green-500', speed: 80, baseSpeed: 80 },
    'T515': { id: 'T515', status: 'At Platform', trackId: 'p8_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 100 },
    'T616': { id: 'T616', status: 'At Platform', trackId: 'p9_full', position: 0, color: 'bg-gray-500', speed: 0, baseSpeed: 75 },
    'T717': { id: 'T717', status: 'En Route', trackId: 'p10_full', position: 18, color: 'bg-green-500', speed: 80, baseSpeed: 80 },
};

// --- CHILD COMPONENTS ---

const trackPaths = {
    p1_full: "M 50,50 L 250,50 Q 300,50 350,100 L 400,100 Q 450,100 500,150 L 950,150",
    p2_full: "M 50,90 L 250,90 Q 300,90 350,100 L 400,100 Q 450,100 500,150 L 950,150",
    p3_full: "M 50,130 L 400,130 Q 450,130 500,150 L 950,150",
    p4_full: "M 50,170 L 420,170 Q 470,170 520,160 L 550,160 Q 600,160 650,150 L 950,150",
    p5_full: "M 50,210 L 420,210 Q 470,210 520,160 L 550,160 Q 600,160 650,150 L 950,150",
    p6_full: "M 50,250 L 550,250 Q 600,250 650,150 L 950,150",
    p7_full: "M 50,290 L 600,290 Q 650,290 700,300 L 950,300",
    p8_full: "M 50,330 L 550,330 Q 600,330 650,310 L 680,310 Q 700,310 700,300 L 950,300",
    p9_full: "M 50,370 L 550,370 Q 600,370 650,310 L 680,310 Q 700,310 700,300 L 950,300",
    p10_full: "M 50,410 L 950,410",
};

const Train = ({ train, position }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    if (!position) return null;
    
    const color = train.speed === 0 && train.status !== 'At Platform' ? 'red' : train.color.replace('bg-', '').replace('-500', '');

    return (
        <g 
            transform={`translate(${position.x}, ${position.y})`} 
            className="train-container cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <circle r="9" fill={color} stroke="#FFFFFF" strokeWidth="2" style={{ filter: 'url(#glow)' }}/>
            {showTooltip && (
                <g>
                    <rect x="-40" y="-40" width="80" height="25" rx="5" fill="rgba(0,0,0,0.7)" />
                    <text x="0" y="-25" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                        {train.id} ({train.speed}km/h)
                    </text>
                </g>
            )}
            <text x="0" y="-18" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="bold" fontFamily="monospace" style={{ paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '3px' }}>
                {train.id}
            </text>
        </g>
    );
};

const LiveRailwayNetwork = ({ trains }) => {
    const svgRef = useRef(null);
    const [pathElements, setPathElements] = useState({});

    useEffect(() => {
        if (svgRef.current) {
            const paths = svgRef.current.querySelectorAll('path');
            const elements = {};
            paths.forEach(p => { elements[p.id] = p; });
            setPathElements(elements);
        }
    }, []);

    const trainPositions = useMemo(() => {
        const positions = {};
        for (const trainId in trains) {
            const train = trains[trainId];
            const path = pathElements[train.trackId];
            if (path) {
                const totalLength = path.getTotalLength();
                const point = path.getPointAtLength((train.position / 100) * totalLength);
                positions[trainId] = { x: point.x, y: point.y };
            }
        }
        return positions;
    }, [trains, pathElements]);
    
    // Defines which track each station label should be associated with and its vertical offset
    const stationTrackMapping = {
        Kengeri: { trackId: 'p3_full', yOffset: -25 },
        Hejjala: { trackId: 'p6_full', yOffset: 25 },
        Bidadi: { trackId: 'p7_full', yOffset: 25 },
        Ketohalli: { trackId: 'p10_full', yOffset: 25 },
        Mandya: { trackId: 'p10_full', yOffset: -25 },
    };

    return (
        <div className="bg-blue-50 rounded-xl p-4 relative h-full flex flex-col shadow-xl border-2 border-slate-500">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Live Railway Network</h2>
            <div className="flex-grow relative">
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1000 460">
                    <rect x="0" y="20" width="50" height="420" fill="#E5E7EB" rx="5" />
                    <text x="25" y="230" fill="#1F2937" textAnchor="middle" transform="rotate(-90, 25, 230)" fontSize="18" fontWeight="bold">BENGALURU</text>
                    <rect x="950" y="120" width="50" height="320" fill="#E5E7EB" rx="5" />
                    <text x="975" y="280" fill="#1F2937" textAnchor="middle" transform="rotate(-90, 975, 280)" fontSize="18" fontWeight="bold">MYSURU</text>
                    {Object.entries(trackPaths).map(([id, d]) => ( <path key={id} id={id} d={d} stroke="#D1D5DB" strokeWidth="2" strokeDasharray="5,5" fill="none" /> ))}
                    {Array.from({ length: 10 }).map((_, index) => ( <text key={`label-a-${index}`} x="60" y={50 + index * 40} fill="#4B5563" dy="0.35em" fontSize="14">{`P${index + 1}`}</text> ))}
                    <text x="940" y="150" fill="#4B5563" dy="0.35em" fontSize="14" textAnchor="end">B1</text>
                    <text x="940" y="300" fill="#4B5563" dy="0.35em" fontSize="14" textAnchor="end">B2</text>
                    <text x="940" y="410" fill="#4B5563" dy="0.35em" fontSize="14" textAnchor="end">B3</text>
                     {Object.entries(stationLocations).map(([name, pos]) => {
                        const mapping = stationTrackMapping[name];
                        const path = pathElements[mapping.trackId];
                        if (!path) return null;

                        const totalLength = path.getTotalLength();
                        const point = path.getPointAtLength((pos / 100) * totalLength);

                        return (
                            <g key={name} className="station-label" transform={`translate(${point.x}, ${point.y + mapping.yOffset})`}>
                                <rect x="-35" y="-10" width="70" height="20" fill="#ffffff" stroke="#cbd5e1" rx="4" />
                                <text x="0" y="5" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#4b5563">{name}</text>
                            </g>
                        );
                    })}
                    {Object.values(trains).map(train => ( <Train key={train.id} train={train} position={trainPositions[train.id]} /> ))}
                </svg>
            </div>
        </div>
    );
};

const AIRecommendations = ({ recommendations, accepted, onAccept, onOverride }) => {
    return (
        <div className="bg-blue-50 rounded-xl h-full shadow-xl border-2 border-slate-500 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Actions</h2>
            </div>
            <div className="p-6 space-y-4 flex-shrink-0">
                {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md hover:border-blue-300">
                        <div className="flex items-start">
                            <span className="text-2xl mr-4">{rec.icon}</span>
                            <div>
                                <h3 className="font-bold text-gray-900">{rec.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                <div className="mt-4 flex space-x-2"><button onClick={() => onAccept(rec.id)} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-green-600">Accept</button><button onClick={() => onOverride(rec.id)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-300">Override</button></div>
                            </div>
                        </div>
                    </div>
                ))}
                 {recommendations.length === 0 && <div className="text-center text-gray-500 py-4"><p>No new recommendations.</p></div>}
            </div>
            <div className="p-6 border-t border-gray-200 mt-auto"><h2 className="text-lg font-semibold text-gray-800">Recently Accepted</h2></div>
            <div className="px-6 pb-6 space-y-3 overflow-y-auto">
                 {accepted.map((rec) => ( <div key={`accepted-${rec.id}`} className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg"><div className="flex items-center"><span className="text-xl mr-3">✅</span><div><h4 className="font-semibold text-sm text-green-800">{rec.title}</h4><p className="text-xs text-green-700">{rec.description}</p></div></div></div> ))}
                 {accepted.length === 0 && <div className="text-center text-gray-500 py-4"><p>No actions accepted yet.</p></div>}
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

const Dashboard = () => {
    const [trains, setTrains] = useState(initialTrains);
    const [recommendations, setRecommendations] = useState([]);
    const [acceptedRecommendations, setAcceptedRecommendations] = useState([]);
    const lastUpdateTime = useRef(0);
    const animationFrameId = useRef();

    // Animation Loop using requestAnimationFrame
    useEffect(() => {
        const animate = (timestamp) => {
            if (!lastUpdateTime.current) lastUpdateTime.current = timestamp;
            const deltaTime = timestamp - lastUpdateTime.current;

            setTrains(currentTrains => {
                const updatedTrains = { ...currentTrains };
                for (const trainId in updatedTrains) {
                    const train = updatedTrains[trainId];
                    if (train.speed > 0) {
                        const distance = (train.speed * 1000 / 3600) * (deltaTime / 1000); // distance in meters
                        const trackLengthKm = 140; // Approx distance Bengaluru to Mysuru
                        const positionIncrement = (distance / (trackLengthKm * 1000)) * 100;
                        let newPosition = (train.position + positionIncrement);
                        if (newPosition >= 100) {
                            // When train reaches the end, reset it to 'At Platform' in Mysuru (conceptually)
                            // For this simulation, we'll just reset it back at Bengaluru for continuous demo
                            newPosition = 0;
                            updatedTrains[trainId].status = 'At Platform';
                            updatedTrains[trainId].speed = 0;
                            updatedTrains[trainId].color = 'bg-gray-500';
                        }
                         updatedTrains[trainId].position = newPosition;
                    }
                }
                return updatedTrains;
            });

            lastUpdateTime.current = timestamp;
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animationFrameId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, []);

    // Dynamic Recommendation Generation
     useEffect(() => {
        const generateRecs = () => {
            let allDepartureRecs = [];
            let enRouteRecs = [];
            const enRouteTrains = Object.values(trains).filter(t => t.status === 'En Route');
            const platformTrains = Object.values(trains).filter(t => t.status === 'At Platform');

            // 1. Generate ALL possible Departure Recs
            for (const train of platformTrains) {
                allDepartureRecs.push({ 
                    id: `depart-${train.id}`, 
                    icon: '➡️', 
                    title: `Depart Train ${train.id}`, 
                    description: `Signal is clear for ${train.id} to depart from Platform ${train.trackId.slice(1, -5)}.`, 
                    action: { type: 'depart', trainId: train.id }, 
                    priority: 2, 
                    sortValue: train.baseSpeed 
                });
            }
            
            // Sort departure recs by priority (speed) and take only the top 3
            allDepartureRecs.sort((a, b) => b.sortValue - a.sortValue);
            const topDepartureRecs = allDepartureRecs.slice(0, 3);

            // 2. Station Stop Recs (Priority 1)
            for (const train of enRouteTrains) {
                for (const [name, pos] of Object.entries(stationLocations)) {
                    if (Math.abs(train.position - pos) < 1 && !recommendations.some(r => r.action.trainId === train.id && r.action.station === name)) {
                        enRouteRecs.push({ id: Date.now() + Math.random(), icon: '🏢', title: `Stop at ${name}`, description: `Recommend a brief stop for Train ${train.id} at ${name}.`, action: { type: 'station_stop', trainId: train.id, station: name }, priority: 1, sortValue: train.speed });
                    }
                }
            }

            // 3. Convergence Collision Avoidance (Priority 3 - Highest)
            for (const point of convergencePoints) {
                const trainsOnConvergingTracks = enRouteTrains.filter(t => point.tracks.includes(t.trackId) && Math.abs(t.position - point.at) < 5);
                if (trainsOnConvergingTracks.length > 1) {
                    const slowerTrain = trainsOnConvergingTracks.sort((a, b) => a.speed - b.speed)[0];
                    if (!recommendations.some(r => r.action.trainId === slowerTrain.id && r.priority === 3)) {
                        enRouteRecs.push({ id: Date.now() + Math.random(), priority: 3, icon: '🛑', title: 'Halt Train Immediately', description: `Halt ${slowerTrain.id} to avoid congestion at convergence point.`, action: { type: 'stop', trainId: slowerTrain.id }, sortValue: slowerTrain.speed });
                    }
                }
            }
            
            // Combine the top departure recs with all en-route recs
            let combinedRecs = [...topDepartureRecs, ...enRouteRecs];
            
            // Sort the final combined list by overall priority
            combinedRecs.sort((a, b) => b.priority - a.priority || b.sortValue - a.sortValue);

            // Set the state with the newly calculated list
            setRecommendations(combinedRecs);
        };

        const interval = setInterval(generateRecs, 5000);
        generateRecs(); // Run once immediately on load
        return () => clearInterval(interval);
    }, [trains]);

    const handleAccept = (id) => {
        const rec = recommendations.find(r => r.id === id);
        if (!rec) return;

        const { action } = rec;
        
        if (action.type === 'depart') {
             setTrains(currentTrains => {
                const train = currentTrains[action.trainId];
                return {...currentTrains, [action.trainId]: {...train, speed: train.baseSpeed, status: 'En Route', color: train.baseSpeed > 85 ? 'bg-blue-500' : 'bg-green-500' }};
            });
        } else {
            setTrains(currentTrains => {
                const newTrains = { ...currentTrains };
                const train = newTrains[action.trainId];
                if (!train) return currentTrains;

                if (action.type === 'stop') {
                    train.speed = 0;
                    train.status = 'Halted';
                } else if (action.type === 'station_stop') {
                    train.speed = 0;
                    train.status = `Stopped at ${action.station}`;
                    setTimeout(() => {
                        setTrains(prev => ({...prev, [action.trainId]: {...prev[action.trainId], speed: prev[action.trainId].baseSpeed, status: 'En Route'}}))
                    }, 20000);
                }
                return newTrains;
            });
        }

        setAcceptedRecommendations(prev => [rec, ...prev].slice(0, 3));
        setRecommendations(prev => prev.filter(r => r.id !== id));
    };

    const handleOverride = (id) => setRecommendations(prev => prev.filter(r => r.id !== id));

    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-200 text-gray-800 font-sans">
            <Tagline />
            <div className="flex flex-col w-full h-100% p-3 lg:p-6 bg-gray-200 text-gray-800 font-sans">
                <header className="mb-4 flex flex-col items-center">
                    <h1 className="text-4xl lg:text-4xl font-bold text-blue-900 text-center">
                        Railway-command center
                    </h1>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                        <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Live Network Feed
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-6 h-full min-h-0">
                    <div className="xl:col-span-8 h-auto xl:h-full">
                        <LiveRailwayNetwork trains={trains} />
                    </div>
                    <div className="xl:col-span-4 h-auto xl:h-full">
                        <AIRecommendations
                            recommendations={recommendations}
                            accepted={acceptedRecommendations}
                            onAccept={handleAccept}
                            onOverride={handleOverride}
                        />
                    </div>
                </div>
            </div>
            <div><AlertFeed></AlertFeed></div>
            <div className='bg-gray-100' >
                <p className='text-3xl lg:text-4xl  p-10 font-bold text-center text-slate-700'>Performance-Highlights</p><Corosel></Corosel>
            
      <p className="text-lg bg-gray-100 text-gray-700 leading-relaxed max-w-4xl  p-5 mx-auto text-center">
        Transforming the way Indian Railways operates, our AI-driven platform
        empowers controllers with real-time insights and optimized decisions.
        By reducing delays, improving safety, and boosting efficiency, it paves
        the way for smarter and more reliable train operations.
      </p>
  
            </div>
        </div>
        
    );
};

export default Dashboard;

