
import React from "react";
import { Syringe } from "lucide-react";

const VaccinationNoti = ({ notification }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-green-50 border border-green-500 shadow-lg rounded-2xl p-4 w-96 flex items-center gap-4">
      <div className="bg-green-100 p-3 rounded-full">
        <Syringe className="text-green-600" size={24} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-800">
          Vaccination Record
        </h3>
        <p className="text-sm text-green-700">
          {notification.student} received <b>{notification.vaccineName}</b> on{" "}
          <b>{formatDate(notification.dateAdministered)}</b>.
        </p>
        <p className="text-sm text-gray-600">
          Status: <b>{notification.status || 'Completed'}</b>
        </p>
      </div>
    </div>
  );
};

export default VaccinationNoti;