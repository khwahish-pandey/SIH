import React, { useMemo, useRef, useEffect, useState } from 'react';

// Define the SVG paths for each track from the starting platforms.
// The paths are defined using SVG path data strings which allow for curves.
const trackPaths = {
    p1: "M 50,50 L 250,50 Q 350,50 450,150 L 950,150",
    p2: "M 50,100 L 250,100 Q 350,100 450,150 L 950,150",
    p3: "M 50,150 L 350,150 Q 450,150 550,200 L 950,200",
    p4: "M 50,200 L 350,200 Q 450,200 550,200 L 950,200",
    p5: "M 50,250 L 450,250 Q 550,250 650,250 L 950,250",
    p6: "M 50,300 L 450,300 Q 550,300 650,250 L 950,250",
};

// A component for a single train, rendered on an SVG canvas
const Train = ({ train, position }) => {
    // Don't render if the train's position hasn't been calculated yet
    if (!position) return null;

    // Use a <g> element to group the circle and text, making positioning easier
    return (
        <g transform={`translate(${position.x}, ${position.y})`}>
            <circle r="8" fill={train.color.replace('bg-', '').replace('-500', '')} stroke="#111827" strokeWidth="2" />
            <text
                x="0"
                y="-15"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontFamily="monospace"
                // Add a stroke to the text to make it more readable against the tracks
                style={{ paintOrder: 'stroke', stroke: '#111827', strokeWidth: '2px', strokeLinecap: 'butt', strokeLinejoin: 'miter' }}
            >
                {train.id}
            </text>
        </g>
    );
};

const LiveRailwayNetwork = ({ trains, simulationTarget }) => {
    const svgRef = useRef(null);
    const [pathElements, setPathElements] = useState({});

    // After the component mounts, get the actual SVG path elements from the DOM.
    // We need these to calculate points along the path.
    useEffect(() => {
        if (svgRef.current) {
            const paths = svgRef.current.querySelectorAll('path');
            const elements = {};
            paths.forEach(p => {
                elements[p.id] = p;
            });
            setPathElements(elements);
        }
    }, []);

    // Memoize the calculation of train positions to avoid re-calculating on every render.
    // This only runs when trains or the path elements change.
    const trainPositions = useMemo(() => {
        const positions = {};
        for (const trainId in trains) {
            const train = trains[trainId];
            const path = pathElements[train.trackId];
            if (path) {
                const totalLength = path.getTotalLength();
                // Get the (x, y) coordinates at a specific percentage of the path's length
                const point = path.getPointAtLength((train.position / 100) * totalLength);
                positions[trainId] = { x: point.x, y: point.y };
            }
        }
        return positions;
    }, [trains, pathElements]);

    return (
        <div className="bg-gray-800 rounded-xl p-4 relative h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-white">Live Railway Network</h2>
            <div className="flex-grow relative">
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1000 350">
                    {/* Station A (Start) */}
                    <rect x="0" y="20" width="50" height="310" fill="#374151" rx="5" />
                    <text x="25" y="180" fill="white" textAnchor="middle" transform="rotate(-90, 25, 180)" fontSize="18">STATION A</text>

                    {/* Station B (End) */}
                    <rect x="950" y="120" width="50" height="110" fill="#374151" rx="5" />
                    <text x="975" y="175" fill="white" textAnchor="middle" transform="rotate(-90, 975, 175)" fontSize="18">STATION B</text>

                    {/* Render the track paths */}
                    {Object.entries(trackPaths).map(([id, d]) => (
                        <path
                            key={id}
                            id={id}
                            d={d}
                            stroke="#555"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            fill="none"
                        />
                    ))}
                    
                    {/* Render platform numbers next to Station A */}
                    {Object.keys(trackPaths).map((id, index) => (
                         <text key={`label-${id}`} x="60" y={50 + index * 50} fill="#9CA3AF" dy="0.35em" fontSize="14">{`P${index + 1}`}</text>
                    ))}

                    {/* Render each train onto the SVG canvas */}
                    {Object.values(trains).map(train => (
                        <Train key={train.id} train={train} position={trainPositions[train.id]} />
                    ))}
                    
                    {/* --- Simulation Overlay --- */}
                    {simulationTarget && (
                        <g>
                            <rect width="1000" height="350" fill="rgba(23, 37, 84, 0.7)" className="backdrop-blur-sm" />
                            <text x="500" y="160" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" className="animate-pulse">SIMULATION MODE</text>
                            <text x="500" y="200" textAnchor="middle" fill="#BFDBFE" fontSize="18">Visualizing scenario for Recommendation #{simulationTarget}</text>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};

export default LiveRailwayNetwork;
