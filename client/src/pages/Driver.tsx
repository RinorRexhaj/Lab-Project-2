import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUserStore } from "../store/useUserStore";
import { MapPin, Flag, CheckCircle, Inbox } from "lucide-react";
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
  const [rideRequest, setRideRequest] = useState<RideRequest[]>([]);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null); //To keep the ride request when accepted
  const socket = useRef(
    io(prod ? "https://lab-project-2.onrender.com" : "http://localhost:5000", {
      transports: [prod ? "polling" : "websocket"],
    })
  ).current;

  useEffect(() => {
    socket.emit("joinDriverRoom", driverId);

    socket.on("receiveNewRideRequest", (rideDetails) => {
      setTimeout(() => {
        if (!rideAccepted) {
          setRideRequest((prev) => [...prev, rideDetails]);
          console.log("Received ride request:", rideDetails);
        }
      }, 5000);
    });
    socket.on("rideNoLongerAvailable", ({ rideId }) => {
      setRideRequest((prev) => prev.filter((ride) => ride.rideId !== rideId));
    });
    socket.on("rideAlreadyAccepted", ({ rideId }) => {
      alert("This ride has already been accepted by another driver.");
      setRideRequest((prev) => prev.filter((r) => r.rideId !== rideId));
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
      setRideRequest((prev) =>
        prev.filter((ride) => ride.userSocketId !== userSocketId)
      );
      console.log("User cancelled the ride. Removing request.");
      setRideAccepted(false);
    });

    return () => {
      socket.off("rideRequestCancelled");
    };
  }, [rideRequest]);

  const acceptRide = (rideId: string) => {
    if (rideAccepted) return;
    const selectedRide = rideRequest.find((r) => r.rideId === rideId);
    if (!selectedRide) return;

    setRideAccepted(true);
    setAcceptedRide(selectedRide);
    setRideRequest([]);

    socket.emit("acceptRide", {
      rideId: selectedRide.rideId,
      driverName: user?.fullName,
      userSocketId: selectedRide.userSocketId,
    });
    startLocationTracking(selectedRide.userSocketId);
  };

  const completeRide = () => {
    if (!acceptedRide) return;

    socket.emit("completeRide", { rideId: acceptedRide.rideId });
    setAcceptedRide(null);
    setRideAccepted(false);
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
    <>
      {acceptedRide ? (
        <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-screen bg-gray-100 px-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" /> Accepted Ride
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="text-base font-medium text-gray-700">
                    {acceptedRide.pickupLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Flag className="text-red-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Dropoff</p>
                  <p className="text-base font-medium text-gray-700">
                    {acceptedRide.dropoffLocation}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                className="w-full py-2 px-4 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-150"
                onClick={completeRide}
              >
                Ride Completed
              </button>
            </div>
          </div>
        </div>
      ) : rideRequest.length > 0 ? (
        <div className="flex flex-wrap gap-4 p-4 items-center justify-center min-h-screen bg-gray-100 px-4">
          {rideRequest.map((request) => (
            <div
              key={request.rideId}
              className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-4 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" /> New Ride Request
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="text-base font-medium text-gray-700">
                      {request.pickupLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Flag className="text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Dropoff</p>
                    <p className="text-base font-medium text-gray-700">
                      {request.dropoffLocation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition duration-150 ${
                    rideAccepted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                  onClick={() => acceptRide(request.rideId)}
                  disabled={rideAccepted}
                >
                  {rideAccepted ? "Ride Accepted" : "Accept Ride"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl shadow-md max-w-md w-full">
          <Inbox className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            No ride requests
          </h2>
          <p className="text-gray-500 mt-2">
            You're all caught up! We'll notify you when a new ride request
            arrives.
          </p>
        </div>
      )}
    </>
  );
};

export default Driver;
