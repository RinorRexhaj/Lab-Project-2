import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useUserStore } from "../store/useUserStore";
const socket = io("https://lab-project-2.onrender.com");

const Driver = () => {
  const { user } = useUserStore();
  const driverId = user?.id;
  const [rideRequest, setRideRequest] = useState(null);

  useEffect(() => {
    socket.emit("joinDriverRoom", driverId);

    socket.on("newRideRequest", (rideDetails) => {
      setRideRequest(rideDetails);
    });

    return () => {
      socket.off("newRideRequest");
    };
  }, []);

  const acceptRide = () => {
    socket.emit("acceptRide", {
      userSocketId: rideRequest.userSocketId,
      driverName: user?.fullName,
    });

    // Optionally start sending location
    startLocationTracking(rideRequest.userSocketId);
  };

  const startLocationTracking = (userSocketId) => {
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
          <button onClick={acceptRide}>Accept</button>
        </div>
      )}
    </div>
  );
};

export default Driver;
