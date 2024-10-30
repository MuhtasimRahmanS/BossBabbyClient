import { useState } from "react";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { FaBars, FaMagnifyingGlass } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Cart from "./Cart";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close dropdown when clicking outside
  const closeDropdown = () => setDropdownOpen(false);

  // Toggle drawer visibility
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  // Toggle search visibility
  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">
            Logo
          </Link>
        </div>

        {/* Middle: Links & Dropdown */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              onMouseEnter={() => setDropdownOpen(true)}
              className="hover:text-blue-600 transition"
            >
              All Products
            </button>
            {dropdownOpen && (
              <div
                className="absolute left-0 mt-2 bg-white border rounded shadow-lg w-48"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  to="/Boy-collection"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Boy's Collection
                </Link>
                <Link
                  to="/Girl-collection"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Girl's Collection
                </Link>
                <Link
                  to="/Newborn-collection"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Newborn Collection
                </Link>
              </div>
            )}
          </div>
          <Link to="/about" className="hover:text-blue-600 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </div>

        {/* Right: Search & Cart Icon */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <SearchBar />
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="relative">
            <Cart className="text-2xl text-gray-700 hover:text-blue-600 transition" />
            {/* You can add a cart counter badge here */}
          </Link>

          {/* Mobile Search Icon */}
          <FaMagnifyingGlass
            onClick={toggleSearch}
            className="text-2xl text-gray-700 md:hidden hover:text-blue-600 cursor-pointer transition"
          />
        </div>
      </div>

      {/* Search Bar for Mobile */}
      {searchOpen && <SearchBar className="md:hidden" />}

      {/* Drawer for Mobile */}
      <div className="flex items-center md:hidden">
        <FaBars
          onClick={toggleDrawer}
          className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer transition"
        />
      </div>

      {/* Drawer Menu */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleDrawer}
        >
          <div
            className="fixed left-0 top-0 bg-white w-64 h-full z-50 p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent close on clicking inside drawer
          >
            <button
              onClick={toggleDrawer}
              className="text-xl text-gray-700 hover:text-blue-600"
            >
              <FaTimes />
            </button>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/" className="block hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/all-products" className="block hover:text-blue-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="block hover:text-blue-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block hover:text-blue-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
