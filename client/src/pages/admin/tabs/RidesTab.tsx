import React, { useState, useEffect } from "react";
import useApi from "../../../hooks/useApi";
import { useUserStore } from "../../../store/useUserStore";
import { Trash2 } from "lucide-react";

type Ride = {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  completedAt: Date;
  user?: { fullName: string; email: string };
  driver?: { fullName: string };
};

const RidesTab: React.FC = () => {
  const { get, del } = useApi();
  const { user } = useUserStore();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const data = await get(`/ride/all`);
        setRides(data);
      } catch (err) {
        console.error("Failed to fetch rides:", err);
      }
    };

    fetchRides();
  }, [user]);

  const handleDelete = async (rideId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ride?"
    );
    if (!confirmed) return;

    try {
      await del(`/ride/${rideId}`);
      setRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (err) {
      console.error("Failed to delete ride", err);
      alert("Failed to delete ride. Check console for details.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
          Rides Management
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {rides.length} {rides.length === 1 ? "ride" : "rides"} found
          </span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Users Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                From
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                To
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Driver
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Completed At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.user?.fullName || "No user name"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.user?.email || "No user email"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.pickupLocation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.dropoffLocation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-xs text-center font-medium px-2 py-1 rounded-full ${
                      ride.status == "completed" &&
                      "bg-green-100 text-green-800 "
                    } ${
                      ride.status == "pending" && "bg-red-100 text-red-800 "
                    }`}
                  >
                    {ride.status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.driver?.fullName || "No driver name"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(ride.completedAt).toLocaleString()}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(ride.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RidesTab;
