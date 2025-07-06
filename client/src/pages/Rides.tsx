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
import RideHistory from "../components/RideHistory/RideHistory";
import useApi from "../hooks/useApi";
import { useUserStore } from "../store/useUserStore";
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
    googleMapsApiKey: "AIzaSyC5UGX3H1ZbhUU0o96JwG1vt_p0gQzDLfs",
    libraries,
  });
  const { post } = useApi();
  const { user } = useUserStore();
  const prod = import.meta.env.PROD === true;
  const socket = useRef(
    io(prod ? "https://lab-project-2.onrender.com" : "http://localhost:5000", {
      transports: [prod ? "polling" : "websocket"],
    })
  ).current;
  const [showModal, setShowModal] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [buttonText, setButtonText] = useState("Book Ride");
  const [rideBooked, setRideBooked] = useState(false);
  const [rideId, setRideId] = useState();

  // const socket = useRef(io("https://lab-project-2.onrender.com")).current;

  useEffect(() => {
    socket.on("driverLocationUpdate", ({ lat, lng }) => {
      setDriverCoords({ lat, lng });
      console.log("driver location", lat, lng);
    });

    socket.on("rideAccepted", ({ driverUsername }) => {
      toast.success(`${driverUsername} accepted your ride!`);
      setWaitingForDriver(false);
      setButtonText("Driver on your way");
    });

    socket.on("rideCompleted", () => {
      setButtonText("Ride has ended.");
      setWaitingForDriver(false);
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
          componentRestrictions: { country: "xk" }, // Kosova
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
          setPickupSuggestions([]);
        } else {
          setDropoff(place.formatted_address || "");
          setDropoffCoords(loc);
          setDropoffSuggestions([]);
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

  const handleBookRide = async () => {
    if (!pickup || !dropoff || !pickupCoords || !dropoffCoords) {
      alert("Please fill in both pickup and dropoff locations.");
      return;
    }

    const response = await post("/ride/booked", {
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      userId: user?.id,
    });
    try {
      socket.emit("newRideRequest", {
        response,
        userSocketId: socket.id,
      });
      const rideId = response.id;
      setRideId(rideId);
      socket.emit("booked", { rideId });
      setTimeout(() => {
        setShowModal(true);
      }, 1000);
      setTimeout(() => {
        setWaitingForDriver(true);
        setButtonText("Waiting For a Driver to Accept your Ride ");
        setRideBooked(true);
      }, 3000);
    } catch (e) {
      console.error("error:", e);
    }
  };
  const handleCancelRide = () => {
    if (!rideId) return;
    socket.emit("cancelRideRequest", { userSocketId: socket.id, rideId });
    setRideBooked(false);
    setWaitingForDriver(false);
    setShowModal(false);
    setButtonText("Book Ride");
    toast.error("Ride request has been cancelled.");
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
    <>
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
              className={`pl-8 pr-10 py-3 w-full bg-gray-100 rounded-md focus:outline-none ${
                (waitingForDriver || buttonText == "Driver on your way") &&
                "cursor-not-allowed"
              }`}
              disabled={waitingForDriver || buttonText == "Driver on your way"}
            />
            {pickup ? (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setPickup("")}
                disabled={
                  waitingForDriver || buttonText == "Driver on your way"
                }
              >
                <FaTimes />
              </button>
            ) : (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={getCurrentLocation}
                disabled={
                  waitingForDriver || buttonText == "Driver on your way"
                }
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
              className={`pl-8 pr-10 py-3 w-full bg-gray-100 rounded-md focus:outline-none ${
                (waitingForDriver || buttonText == "Driver on your way") &&
                "cursor-not-allowed"
              }`}
              disabled={waitingForDriver || buttonText == "Driver on your way"}
            />
            {dropoff && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setDropoff("")}
                disabled={
                  waitingForDriver || buttonText == "Driver on your way"
                }
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
              className={`py-3 px-4 bg-gray-100 rounded-md w-full ${
                (waitingForDriver || buttonText == "Driver on your way") &&
                "cursor-not-allowed"
              }`}
              disabled={waitingForDriver || buttonText == "Driver on your way"}
            />

            <select
              className={`py-3 px-4 bg-gray-100 rounded-md w-full ${
                (waitingForDriver || buttonText == "Driver on your way") &&
                "cursor-not-allowed"
              }`}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={waitingForDriver || buttonText == "Driver on your way"}
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
              waitingForDriver && "cursor-not-allowed bg-black/80 text-gray-700"
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
          {rideBooked && waitingForDriver && (
            <button
              className="bg-red-600 text-white px-6 py-3 mt-2 rounded-md"
              onClick={handleCancelRide}
            >
              Cancel Ride
            </button>
          )}
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
                placesService.current = new google.maps.places.PlacesService(
                  map
                );
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

      <RideHistory buttonText={buttonText} />
    </>
  );
};

export default Rides;
