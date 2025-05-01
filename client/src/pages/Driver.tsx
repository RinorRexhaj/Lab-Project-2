import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUserStore } from "../store/useUserStore";
const prod = import.meta.env.PROD === true;

interface RideRequest {
  userSocketId: string;
  pickupLocation: string;
  dropoffLocation: string;
  rideId: string;
}

const Driver = () => {
  const { user } = useUserStore();
  const driverId = user?.id;
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [rideAccepted, setRideAccepted] = useState(false);
  const socket = useRef(
    io(prod ? "https://lab-project-2.onrender.com" : "http://localhost:5000", {
      transports: [prod ? "polling" : "websocket"],
    })
  ).current;

  useEffect(() => {
    socket.emit("joinDriverRoom", driverId);

    socket.on("receiveNewRideRequest", (rideDetails) => {
      setTimeout(() => {
        setRideRequest(rideDetails);
        console.log("Now showing ride request:", rideDetails);
      }, 5000);
    });
    socket.on("rideNoLongerAvailable", ({ rideId }) => {
      if (rideRequest?.rideId === rideId) {
        setRideRequest(null);
      }
    });
    socket.on("rideAlreadyAccepted", () => {
      alert("This ride has already been accepted by another driver.");
      setRideRequest(null);
      setRideAccepted(false);
    });

    return () => {
      socket.off("newRideRequest");
      socket.off("receiveNewRideRequest");
      socket.off("rideNoLongerAvailable");
      socket.off("rideAlreadyAccepted");
    };
  }, []);

  useEffect(() => {
    socket.on("rideRequestCancelled", ({ userSocketId }) => {
      if (rideRequest?.userSocketId === userSocketId) {
        console.log("User cancelled the ride. Removing request.");
        setRideRequest(null);
        setRideAccepted(false);
      }
    });

    return () => {
      socket.off("rideRequestCancelled");
    };
  }, [rideRequest]);

  const acceptRide = () => {
    if (rideAccepted || !rideRequest) return;

    setRideAccepted(true);
    socket.emit("acceptRide", {
      rideId: rideRequest.rideId,
      driverName: user?.fullName,
      userSocketId: rideRequest.userSocketId,
    });
    startLocationTracking(rideRequest.userSocketId);
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
            disabled={rideAccepted}
          >
            {rideAccepted ? "Ride Accepted" : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Driver;
