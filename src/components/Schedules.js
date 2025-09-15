import React from 'react';

const Schedules = () => (
    <>
        <div className="flex w-full bg-blue-200 shadow-lg overflow-hidden min-h-[500px]">
            {/* Container for the lag line and the text content */}
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

            {/* Image Container (takes up one-third of the space) */}
            <div className="hidden sm:block sm:w-1/3">
                <img
                    src="/images/penta-sathwik-l6t1ixFldOo-unsplash.jpg"
                    alt="Indian passenger train"
                    className="w-full h-full object-cover rounded-tl-full rounded-bl-full border-l-8 border-white"
                />
                
            </div>
        </div>

        <div className="flex-1 p-3 lg:p-6">
            <div className="bg-blue-50  rounded-xl p-3 lg:p-6">
                <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Train Schedules</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-slate-800">
                        <thead>
                            <tr className="border-b border-blue-200">
                                <th className="text-left py-3 px-4 font-semibold">Train ID</th>
                                <th className="text-left py-3 px-4 font-semibold">Route</th>
                                <th className="text-left py-3 px-4 font-semibold">Scheduled</th>
                                <th className="text-left py-3 px-4 font-semibold">Actual</th>
                                <th className="text-left py-3 px-4 font-semibold">Status</th>
                                <th className="text-left py-3 px-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T123</td>
                                <td className="py-3 px-4">Station A → Terminal</td>
                                <td className="py-3 px-4">14:30</td>
                                <td className="py-3 px-4">14:30</td>
                                <td className="py-3 px-4"><span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">On Time</span></td>
                                <td className="py-3 px-4"><button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs">Track</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T456</td>
                                <td className="py-3 px-4">Junction B → Central</td>
                                <td className="py-3 px-4">14:45</td>
                                <td className="py-3 px-4">14:50</td>
                                <td className="py-3 px-4"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Delayed +5m</span></td>
                                <td className="py-3 px-4"><button className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 rounded text-xs">Adjust</button></td>
                            </tr>
                            {/* START: Added 8 new train entries */}
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T789</td>
                                <td className="py-3 px-4">Airport Link → Downtown</td>
                                <td className="py-3 px-4">15:00</td>
                                <td className="py-3 px-4">15:10</td>
                                <td className="py-3 px-4"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Delayed +10m</span></td>
                                <td className="py-3 px-4"><button className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 rounded text-xs">Adjust</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T101</td>
                                <td className="py-3 px-4">North Cross → South Hub</td>
                                <td className="py-3 px-4">15:15</td>
                                <td className="py-3 px-4">15:15</td>
                                <td className="py-3 px-4"><span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">On Time</span></td>
                                <td className="py-3 px-4"><button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs">Track</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T212</td>
                                <td className="py-3 px-4">West End → Central Plaza</td>
                                <td className="py-3 px-4">15:20</td>
                                <td className="py-3 px-4">--</td>
                                <td className="py-3 px-4"><span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span></td>
                                <td className="py-3 px-4"><button className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded text-xs">Reroute</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T334</td>
                                <td className="py-3 px-4">Industrial Park → Metro East</td>
                                <td className="py-3 px-4">15:30</td>
                                <td className="py-3 px-4">15:28</td>
                                <td className="py-3 px-4"><span className="bg-cyan-200 text-cyan-800 px-2 py-1 rounded-full text-xs font-medium">Early -2m</span></td>
                                <td className="py-3 px-4"><button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs">Track</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T556</td>
                                <td className="py-3 px-4">University → Junction B</td>
                                <td className="py-3 px-4">15:45</td>
                                <td className="py-3 px-4">15:45</td>
                                <td className="py-3 px-4"><span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">On Time</span></td>
                                <td className="py-3 px-4"><button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs">Track</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T876</td>
                                <td className="py-3 px-4">Central → Harbor View</td>
                                <td className="py-3 px-4">16:00</td>
                                <td className="py-3 px-4">16:05</td>
                                <td className="py-3 px-4"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Delayed +5m</span></td>
                                <td className="py-3 px-4"><button className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 rounded text-xs">Adjust</button></td>
                            </tr>
                            <tr className="border-b border-blue-200 hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T901</td>
                                <td className="py-3 px-4">Stadium → North Cross</td>
                                <td className="py-3 px-4">16:10</td>
                                <td className="py-3 px-4">16:10</td>
                                <td className="py-3 px-4"><span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">On Time</span></td>
                                <td className="py-3 px-4"><button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs">Track</button></td>
                            </tr>
                            <tr className="hover:bg-blue-100">
                                <td className="py-3 px-4 font-medium">T112</td>
                                <td className="py-3 px-4">Downtown → Airport Link</td>
                                <td className="py-3 px-4">16:25</td>
                                <td className="py-3 px-4">16:40</td>
                                <td className="py-3 px-4"><span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Delayed +15m</span></td>
                                <td className="py-3 px-4"><button className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-1 rounded text-xs">Adjust</button></td>
                            </tr>
                             {/* END: Added 8 new train entries */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>
);

export default Schedules;