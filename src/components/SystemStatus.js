import React from 'react';

const SystemStatus = () => (
    <div className="bg-gray-800 rounded-xl p-3 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">System Status</h3>
        <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div className="text-center bg-gray-900/50 rounded-lg p-2 lg:p-3"><div className="text-lg lg:text-2xl font-bold text-green-400">98.2%</div><div className="text-xs text-gray-400">On-Time Performance</div></div>
            <div className="text-center bg-gray-900/50 rounded-lg p-2 lg:p-3"><div className="text-lg lg:text-2xl font-bold text-blue-400">24</div><div className="text-xs text-gray-400">Trains/Hour</div></div>
            <div className="text-center bg-gray-900/50 rounded-lg p-2 lg:p-3"><div className="text-lg lg:text-2xl font-bold text-yellow-400">2.1</div><div className="text-xs text-gray-400">Avg Delay (min)</div></div>
            <div className="text-center bg-gray-900/50 rounded-lg p-2 lg:p-3"><div className="text-lg lg:text-2xl font-bold text-purple-400">87%</div><div className="text-xs text-gray-400">Track Utilization</div></div>
        </div>
    </div>
);

export default SystemStatus;
