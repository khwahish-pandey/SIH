import React from 'react';
import { Link } from 'react-router-dom';

function Corosel() {
  return (
    <div className="flex justify-center mt-4">
      <div 
        id="carouselExampleCaptions" 
        className="carousel slide max-w-4xl " // max width for smaller cards
      >
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/images/free-walking-tour-salzburg-kvygogtvaHc-unsplash.jpg" className="d-block w-full" alt="..."/>
            <div className="carousel-caption d-none d-md-block">
              <h5>Live-Schedules</h5>
              <p><Link to='/schedules' className="text-white hover:text-gray-300 no-underline">Tap to view  Upcoming Train Timings</Link></p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/images/shairyar-khan-7WLTx9Y7OUk-unsplash.jpg" className="d-block w-full" alt="..."/>
            <div className="carousel-caption d-none d-md-block">
              <h5>Live-Reports</h5>
              <p><Link to='/reports' className="text-white hover:text-gray-300 no-underline">Tap to view the latest reports</Link></p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/images/wilsan-u-WUxK_YFdhQU-unsplash.jpg" className="d-block w-full" alt="..."/>
            <div className="carousel-caption d-none d-md-block">
              <h5>Live-Railway Maps</h5>
             <p><Link to='/maps' className="text-white hover:text-gray-300 no-underline">Tap to view the latest Raiway Maps</Link></p>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
}

export default Corosel;
