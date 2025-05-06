import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { useUserStore } from "../../store/useUserStore";

type Ride = {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  completedAt: Date;
  driver?: {
    fullName: string;
  };
};

const RideHistory: React.FC = () => {
  const { user } = useUserStore();
  const { get } = useApi();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      if (!user?.id) return;
      try {
        const data = await get(`/ride/user/${user.id}`);
        setRides(data);
      } catch (err) {
        console.error("Failed to fetch rides:", err);
      }
    };

    fetchRides();
  }, [user]);

  return (
    rides.length > 0 && (
      <div className="overflow-x-auto rounded-lg border border-gray-200 mt-10 mb-10">
        <h2 className="text-xl font-bold mb-4 text-center">
          Your Ride History
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
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
                    {ride.driver?.fullName || "No driver assigned"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm text-gray-900">
                    {new Date(ride.completedAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};
export default RideHistory;
