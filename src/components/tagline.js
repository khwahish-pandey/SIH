import React from 'react';

function Tagline() {
  return (
    // MODIFIED: Replaced min-h-screen with a fixed height and added centering classes
    <div 
      className="w-full px-6 lg:px-16 relative bg-cover bg-center min-h-[700px] flex justify-center items-center text-center"
      style={{ backgroundImage: `url('/images/shivansh-singh-0BA7vWhhpCE-unsplash (1).jpg')` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* MODIFIED: Removed grid layout to allow for centering */}
      <div className="max-w-4xl relative z-10 text-white">
        
        {/* Left side - Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl lg:text-5xl font-bold">
            AI-Powered
          </h1> 
          <h1 className="text-4xl lg:text-5xl font-bold text-blue-300">
            Precision Control
          </h1> 
          <h1 className="text-4xl lg:text-5xl font-bold">
            for Smarter, Safer, and Faster Railways
          </h1>
          
          <p className="text-lg text-gray-200 mt-8">
            Enhancing efficiency, punctuality, and utilization of Indian Railways with intelligent, real-time decision support.
          </p>
        </div>

        {/* MODIFIED: The empty right-side column div has been removed */}
      </div>
    </div>
  );
}

export default Tagline;