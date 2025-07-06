import React from 'react';

const Navbar = ({ fullName }) => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">AI Bootcamp Paneli</h1>
      <span className="text-sm">👤 {fullName}</span>
    </nav>
  );
};

export default Navbar;
