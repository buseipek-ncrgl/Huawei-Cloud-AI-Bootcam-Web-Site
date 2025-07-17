import React from 'react';
import { FaMedium, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Navbar = ({ fullName }) => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center justify-between w-full md:w-auto">
        <h1 className="text-lg font-bold">AI Bootcamp Paneli</h1>
        <span className="text-sm md:hidden mt-2">👤 {fullName}</span>
      </div>

      <div className="flex items-center mt-2 md:mt-0 gap-4">
        <a
          href="https://medium.com/huawei-developers-tr"
          target="_blank"
          rel="noopener noreferrer"
          title="Medium"
        >
          <FaMedium size={20} className="hover:text-gray-300 transition-colors" />
        </a>

        <a
          href="https://www.linkedin.com/company/hsdturkiye/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <FaLinkedin size={20} className="hover:text-gray-300 transition-colors" />
        </a>

        <a
          href="https://www.instagram.com/hsdturkiye/"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
        >
          <FaInstagram size={20} className="hover:text-gray-300 transition-colors" />
        </a>

        <span className="text-sm hidden md:inline">👤 {fullName}</span>
      </div>
    </nav>
  );
};

export default Navbar;

