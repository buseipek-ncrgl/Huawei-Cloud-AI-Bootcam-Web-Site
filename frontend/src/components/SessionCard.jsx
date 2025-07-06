import React from 'react';

const SessionCard = ({ week, attended, active, onAttend }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200">
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Hafta {week}</h3>
  <p className="text-sm text-gray-600 mb-2">
    {attended ? (
      <span className="text-green-600 font-medium">✔ Katıldı</span>
    ) : active ? (
      <button
        onClick={() => onAttend(week)}
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
      >
        Katıldım
      </button>
    ) : (
      <span className="text-red-500">✖ Katılmadı</span>
    )}
  </p>
</div>

  );
};

export default SessionCard;
