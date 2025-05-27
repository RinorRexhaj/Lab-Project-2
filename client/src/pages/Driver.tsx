import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useUserStore } from "../store/useUserStore";
import { MapPin, Flag, CheckCircle, Inbox } from "lucide-react";
import useApi from "../hooks/useApi";
const prod = import.meta.env.PROD === true;

interface RideRequest {
  userId: number;
  pickupLocation: string;
  dropoffLocation: string;
  rideId: number;
}

const Driver = () => {
  const { user } = useUserStore();
  const driverId = user?.id;
  const [rideRequest, setRideRequest] = useState<RideRequest[]>([]);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [acceptedRide, setAcceptedRide] = useState<RideRequest | null>(null); //To keep the ride request when accepted
  const { post } = useApi();

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
        }
      }, 5000);
    });
    socket.on("rideNoLongerAvailable", ({ rideId }) => {
      setRideRequest((prev) => prev.filter((ride) => ride.rideId !== rideId));
    });
    socket.on("rideAlreadyAccepted", ({ rideId }) => {
      alert("Ride already accepted by another driver.");
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
    socket.on("rideRequestCancelled", ({ rideId }) => {
      setRideRequest((prev) => prev.filter((ride) => ride.rideId !== rideId));
      setRideAccepted(false);
    });

    return () => {
      socket.off("rideRequestCancelled");
    };
  }, [rideRequest]);

  const acceptRide = (rideId: number) => {
    if (rideAccepted) return;
    const selectedRide = rideRequest.find((r) => r.rideId === rideId);
    if (!selectedRide) return;

    setRideAccepted(true);
    setAcceptedRide(selectedRide);
    setRideRequest([]);

    socket.emit("acceptRide", {
      rideId: selectedRide.rideId,
      driverName: user?.fullName,
      // userSocketId: socket.id,
    });
    startLocationTracking(selectedRide.rideId);
  };

  const completeRide = async () => {
    if (!acceptedRide) return;

    const { rideId, pickupLocation, dropoffLocation, userId } = acceptedRide;

    socket.emit("completeRide", { rideId });
    try {
      await post("/ride/complete", {
        userId,
        driverId,
        pickupLocation,
        dropoffLocation,
        rideId,
      });

      setAcceptedRide(null);
      setRideAccepted(false);
    } catch (err) {
      console.error("Error completing the ride:", err);
    }
  };

  const startLocationTracking = (rideId: number) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit("driverLocation", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          rideId,
          // rideId: acceptedRide.rideId,
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
        <div className="w-11/12 mx-auto p-4 items-center px-4">
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
                className="w-full py-2 px-4 text-white font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 transition duration-150"
                onClick={completeRide}
              >
                Finish Ride
              </button>
            </div>
          </div>
        </div>
      ) : rideRequest.length > 0 ? (
        <div className="w-11/12 flex flex-wrap gap-4 p-4 items-center px-4 mx-auto">
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
