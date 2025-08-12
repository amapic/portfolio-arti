import React from "react";
import Script from "next/script";
// import ArtisticGallery from "../components/ArtisticGallery";
import LegoGallery from "../components/LegoGallery";

function Dev() {
  return (
    <>
      {/* Chargement de jQuery et Isotope */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js" />
      
      <div className="font-exposure">
        <LegoGallery />
      </div>
    </>
  );
}

export default Dev;
