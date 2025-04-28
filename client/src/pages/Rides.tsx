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
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
// import useApi from "../hooks/useApi";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSpinner } from "@fortawesome/free-solid-svg-icons";

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
  const [driverCoords, setDriverCoords] =
    useState<google.maps.LatLngLiteral | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<
    AutocompletePrediction[]
  >([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    AutocompletePrediction[]
  >([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("Now");
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
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
  const prod = import.meta.env.PROD === true;
  const socket = useRef(
    io(prod ? "https://lab-project-2.onrender.com" : "http://localhost:5000", {
      transports: [prod ? "polling" : "websocket"],
    })
  ).current;
  const [showModal, setShowModal] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [buttonText, setButtonText] = useState("Book Ride");

  // const loading = useApi();
  // const socket = useRef(io("https://lab-project-2.onrender.com")).current;

  useEffect(() => {
    socket.on("driverLocationUpdate", ({ lat, lng }) => {
      setDriverCoords({ lat, lng });
      console.log("driver location", lat, lng);
    });

    socket.on("rideAccepted", ({ rideId, driverUsername }) => {
      console.log("ride accepted:", rideId, driverUsername);
      toast.success(`${driverUsername} accepted your ride!`);
      setWaitingForDriver(false);
      setButtonText("Driver on your way");
    });

    return () => {
      socket.off("driverLocationUpdate");
      socket.off("rideAccepted");
    };
  }, []);

  useEffect(() => {
    if (driverCoords && mapRef.current) {
      mapRef.current.panTo(driverCoords);
    }
  }, [driverCoords]);

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

  const handleBookRide = () => {
    if (!pickup || !dropoff || !pickupCoords || !dropoffCoords) {
      alert("Please fill in both pickup and dropoff locations.");
      return;
    }

    socket.emit("newRideRequest", {
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      pickupCoords,
      dropoffCoords,
      userSocketId: socket.id,
    });
    setTimeout(() => {
      setShowModal(true);
      setWaitingForDriver(true);
      setButtonText("Waiting For a Driver to Accept your Ride ");
    }, 1000);
  };

  useEffect(() => {
    generateTimeOptions();
  }, [selectedDate]);

  const generateTimeOptions = () => {
    const options: string[] = [];
    const now = new Date();

    const isToday =
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    let startHour = 0;
    let startMinute = 0;

    if (isToday) {
      startHour = now.getHours();
      startMinute = Math.ceil(now.getMinutes() / 15) * 15;
      if (startMinute === 60) {
        startHour += 1;
        startMinute = 0;
      }
    }

    for (let hour = startHour; hour < 24; hour++) {
      for (const minute of [0, 15, 30, 45]) {
        if (isToday && hour === startHour && minute < startMinute) {
          continue;
        }
        const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        options.push(formattedTime);
      }
    }

    if (isToday) {
      options.unshift("Now");
    }

    setTimeOptions(options);
    setSelectedTime(options[0] || "Now");
  };

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showModal]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-3 w-11/12 max-w-7xl mt-10 tb:mt-0 tb:flex tb:flex-col flex justify-between gap-5">
      {/* Left Panel */}
      <div className="w-full flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-4xl md:text-2xl font-bold mb-6">Get a Ride</h1>

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
          <div className="absolute top-[30px] left-[15px] z-10 border-l-[1.5px] border-black h-[50px]"></div>
        </div>

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
        <div className="flex gap-4 z-20">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
            className="py-3 px-4 bg-gray-100 rounded-md w-full"
          />

          <select
            className=" py-3 px-4 bg-gray-100 rounded-md w-full"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`bg-black text-white px-6 py-3 mt-4 rounded-md transition hover:bg-black/90 ${
            waitingForDriver &&
            "cursor-not-allowed bg-zinc-400 text-gray-700 hover:bg-zinc-400 hover:text-gray-700"
          } ${
            buttonText == "Driver on your way" &&
            "cursor-not-allowed bg-emerald-500"
          }`}
          onClick={handleBookRide}
          disabled={waitingForDriver || buttonText == "Driver on your way"}
        >
          {buttonText}
          {waitingForDriver && <FontAwesomeIcon icon={faSpinner} spin />}
        </button>

        {/* Distance/ETA */}
        {distance && eta && (
          <div className="mt-4 text-gray-700">
            <p>
              Distance: <b>{distance}</b>
            </p>
            <p>
              ETA: <b>{eta}</b>
            </p>
          </div>
        )}
      </div>
      <hr />
      {/* Map */}
      <div className="z-10 h-[410px] w-full">
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
          {driverCoords && (
            <Marker
              position={driverCoords}
              icon={{
                url: "assets/img/taxi.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>

      {/* Modal on successful booked ride*/}
      {/* loading ? (
        <FontAwesomeIcon icon={faSpinner} spinPulse className="text-lg" />
      ) : ( */}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col justify-center items-center bg-white p-8 rounded-md text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">
              Ride Request Sent Successfully!
            </h2>
            <img
              src="assets/img/success-icon2.png"
              alt=""
              className="w-20 h-20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Rides;
