import { useState } from "react";
import { Tab } from "../../types/Tab";
import UsersTab from "./tabs/UsersTab";
import RidesTab from "./tabs/RidesTab";
import EatTab from "./tabs/EatTab";
import GroceriesTab from "./tabs/GroceriesTab";
import PaymentsTab from "./tabs/PaymentsTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs: Tab[] = [
    { id: 0, name: "Users", component: <UsersTab /> },
    { id: 1, name: "Rides", component: <RidesTab /> },
    { id: 2, name: "Eat", component: <EatTab /> },
    { id: 3, name: "Groceries", component: <GroceriesTab /> },
    { id: 4, name: "Payments", component: <PaymentsTab /> },
  ];

  return (
    <div className="w-full max-w-7xl">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Tabs Navigation */}
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 mr-2 
                ${activeTab === tab.id 
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-100"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="py-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;