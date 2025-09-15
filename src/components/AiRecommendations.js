import React from 'react';

// The component now accepts props: a list of recommendations and functions to handle actions
const AIRecommendations = ({ recommendations, onAccept, onOverride }) => {
    return (
        <div className="bg-white rounded-xl p-6 h-full shadow-md border border-gray-200 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Live AI Recommendations</h2>
            <div className="space-y-4 overflow-y-auto">
                {recommendations.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        <p>No active recommendations.</p>
                    </div>
                )}
                {recommendations.map((rec) => (
                    <div key={rec.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">{rec.icon}</span>
                            <div>
                                <h3 className="font-bold text-gray-900">{rec.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>

                                <div className="mt-4 flex space-x-2">
                                    <button onClick={() => onAccept(rec.id)} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-green-600">
                                        Accept
                                    </button>
                                    <button onClick={() => onOverride(rec.id)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors hover:bg-gray-300">
                                        Override
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIRecommendations;