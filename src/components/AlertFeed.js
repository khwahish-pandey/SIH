import React from 'react';

const AlertFeed = () => (
    <div className="m-3 lg:mt-6 bg-blue-200 w-80vh rounded-xl p-3 lg:p-6 order-3">
        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Live Alerts & Events</h3>
        <div className="space-y-2 lg:space-y-3 max-h-32 lg:max-h-40 overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 lg:p-3 bg-red-900/30 border border-red-600 rounded-lg alert-blink">
                <span className="text-red-400 text-base lg:text-lg">🚨</span>
                <div className="flex-1">
                    <div className="font-medium text-xs lg:text-sm">Potential Conflict Detected</div>
                    <div className="text-xs text-gray-800">Train T123 and T456 approaching Junction B - ETA conflict in 4 minutes</div>
                </div>
                <button className="bg-red-600 hover:bg-red-700 px-2 lg:px-3 py-1 rounded text-xs font-medium self-start sm:self-center">Resolve</button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 lg:p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                <span className="text-yellow-400 text-base lg:text-lg">⚠️</span>
                <div className="flex-1">
                    <div className="font-medium text-xs lg:text-sm">Signal Maintenance Window</div>
                    <div className="text-xs text-gray-800">Platform 3 signals offline for 15 minutes - rerouting active</div>
                </div>
                <button className="bg-yellow-600 hover:bg-yellow-700 px-2 lg:px-3 py-1 rounded text-xs font-medium self-start sm:self-center">Monitor</button>
            </div>
             <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-2 lg:p-3 bg-green-900/30 border border-green-600 rounded-lg">
                <span className="text-green-800 text-base lg:text-lg">✅</span>
                <div className="flex-1">
                    <div className="font-medium text-xs lg:text-sm">Schedule Optimization Applied</div>
                    <div className="text-xs text-gray-800">AI recommendation accepted - Train T789 rerouted successfully</div>
                </div>
                <span className="text-xs text-gray-400 self-start sm:self-center">2 min ago</span>
            </div>
        </div>
    </div>
);

export default AlertFeed;
