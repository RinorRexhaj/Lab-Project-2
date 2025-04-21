import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

type AutocompletePrediction = google.maps.places.AutocompletePrediction;

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = { lat: 42.6629, lng: 21.1655 }; // Prishtina

const libraries: "places"[] = ["places"];

const Rides: React.FC = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffCoords, setDropoffCoords] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<
    AutocompletePrediction[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    AutocompletePrediction[]
  >([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("Now");
  const [distance, setDistance] = useState<string | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const pickupService = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const dropoffService = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDHotvjtYR_l_pRRJrg3yTg7boOx9LT_k0", // Replace with your key
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google && google.maps.places) {
      pickupService.current = new google.maps.places.AutocompleteService();
      dropoffService.current = new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (pickup && pickupService.current) {
      pickupService.current.getPlacePredictions(
        {
          input: pickup,
          componentRestrictions: { country: "xk" }, // Kosovo
        },
        (predictions) => {
          setPickupSuggestions(predictions || []);
        }
      );
    } else {
      setPickupSuggestions([]);
    }
  }, [pickup]);

  useEffect(() => {
    if (dropoff && dropoffService.current) {
      dropoffService.current.getPlacePredictions(
        {
          input: dropoff,
          componentRestrictions: { country: "xk" },
        },
        (predictions) => {
          setDropoffSuggestions(predictions || []);
        }
      );
    } else {
      setDropoffSuggestions([]);
    }
  }, [dropoff]);

  const geocodePlaceId = (placeId: string, isPickup: boolean) => {
    if (!placesService.current) return;
    placesService.current.getDetails({ placeId }, (place, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        place?.geometry?.location
      ) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        if (isPickup) {
          setPickup(place.formatted_address || "");
          setPickupCoords(loc);
          setPickupSuggestions([]); // Clear suggestions
        } else {
          setDropoff(place.formatted_address || "");
          setDropoffCoords(loc);
          setDropoffSuggestions([]); // Clear suggestions
        }
      }
    });
  };

  const fetchDirections = () => {
    if (!pickupCoords || !dropoffCoords) return;
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupCoords,
        destination: dropoffCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance?.text || null);
          setEta(leg.duration?.text || null);
        }
      }
    );
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) fetchDirections();
  }, [pickupCoords, dropoffCoords]);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const loc = { lat: coords.latitude, lng: coords.longitude };
      setPickupCoords(loc);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: loc }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setPickup(results[0].formatted_address);
        }
      });
    });
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl p-3 w-11/12 flex justify-between gap-5">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-6">Get a Ride</h1>

        {/* Pickup Input */}
        <div className="relative">
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-2 h-2 rounded-full bg-black"></div>
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Pickup location"
            className="pl-8 pr-10 py-3 w-full bg-gray-100 rounded-md focus:outline-none"
          />
          {pickup ? (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setPickup("")}
            >
              <FaTimes />
            </button>
          ) : (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={getCurrentLocation}
            >
              <FaLocationArrow />
            </button>
          )}
          {pickupSuggestions.length > 0 && (
            <ul className="absolute z-30 bg-white w-full border mt-1 rounded shadow">
              {pickupSuggestions.map((sug) => (
                <li
                  key={sug.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => geocodePlaceId(sug.place_id, true)}
                >
                  {sug.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vertical Line */}
        <div className="absolute top-[140px] left-[113px] z-20 border-l-[1.5px] border-black ml-[10px] h-[42px]"></div>

        {/* Dropoff Input */}
        <div className="relative">
          <div className="absolute top-1/2 left-3 -translate-y-1/2 w-2 h-2 bg-black"></div>
          <input
            type="text"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="Dropoff location"
            className="pl-8 pr-10 py-3 w-full bg-gray-100 rounded-md focus:outline-none"
          />
          {dropoff && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setDropoff("")}
            >
              <FaTimes />
            </button>
          )}
          {dropoffSuggestions.length > 0 && (
            <ul className="absolute z-30 bg-white w-full border mt-1 rounded shadow">
              {dropoffSuggestions.map((sug) => (
                <li
                  key={sug.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => geocodePlaceId(sug.place_id, false)}
                >
                  {sug.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date/Time Pickers */}
        <div className="flex gap-4 z-50">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
            className="py-3 px-4 bg-gray-100 rounded-md w-full"
          />
          <select
            className="py-3 px-4 bg-gray-100 rounded-md w-full"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option>Now</option>
            <option>In 15 minutes</option>
            <option>In 30 minutes</option>
            <option>In 1 hour</option>
          </select>
        </div>

        <button className="bg-black text-white px-6 py-3 mt-4 rounded-md">
          See prices
        </button>

        {/* Distance/ETA */}
        {distance && eta && (
          <div className="mt-4 text-gray-700">
            <p>Distance: {distance}</p>
            <p>ETA: {eta}</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="w-1/2 z-10 h-[410px]">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={pickupCoords || center}
          zoom={13}
          onLoad={(map) => {
            mapRef.current = map;
            if (window.google) {
              placesService.current = new google.maps.places.PlacesService(map);
            }
          }}
        >
          {pickupCoords && <Marker position={pickupCoords} />}
          {dropoffCoords && <Marker position={dropoffCoords} />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
};

export default Rides;
