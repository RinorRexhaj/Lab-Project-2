import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUserStore } from "../store/useUserStore";
const prod = import.meta.env.PROD === true;

interface RideRequest {
  userSocketId: string;
  pickupLocation: string;
  dropoffLocation: string;
  // etc.
}

const Driver = () => {
  const { user } = useUserStore();
  const driverId = user?.id;
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const socket = useRef(
    io(prod ? "https://lab-project-2.onrender.com" : "http://localhost:5000", {
      transports: [prod ? "polling" : "websocket"],
    })
  ).current;

  useEffect(() => {
    socket.emit("joinDriverRoom", driverId);

    socket.on("receiveNewRideRequest", (rideDetails) => {
      console.log("ok");
      setRideRequest(rideDetails);
      console.log("new ride reuquest: ", rideDetails);
    });

    return () => {
      socket.off("newRideRequest");
    };
  }, []);

  const acceptRide = () => {
    // Check if rideRequest is not null before proceeding
    if (rideRequest) {
      console.log(rideRequest);
      socket.emit("acceptRide", {
        userSocketId: rideRequest.userSocketId,
        driverName: user?.fullName,
      });

      // Optionally start sending location
      startLocationTracking(rideRequest.userSocketId);
    } else {
      // Handle the case where rideRequest is null
      console.error("No ride request available");
    }
  };

  const startLocationTracking = (userSocketId: unknown) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit("driverLocation", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          userSocketId,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  };

  return (
    <div>
      {rideRequest && (
        <div className="ride-popup">
          <p>New ride request</p>
          <p>{rideRequest.pickupLocation}</p>
          <p>{rideRequest.dropoffLocation}</p>
          <button
            className="text-white font-bold p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 rounded-lg"
            onClick={acceptRide}
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default Driver;
