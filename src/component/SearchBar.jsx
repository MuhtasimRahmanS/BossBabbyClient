import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../hook/useAxiosPublic";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // To manage loading state
  const [showSuggestions, setShowSuggestions] = useState(false); // To toggle visibility
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const searchBarRef = useRef(null); // Ref for search bar to detect outside click

  // Fetch suggestions from API when query is 3 or more characters
  useEffect(() => {
    if (query.length >= 3) {
      setIsLoading(true); // Set loading state when fetching suggestions
      const fetchSuggestions = async () => {
        try {
          const { data } = await axiosPublic.get(`/search?q=${query}`);
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
          setSuggestions([]); // Clear suggestions on error
        } finally {
          setIsLoading(false); // Reset loading state after fetch
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]); // Clear suggestions if less than 3 characters
    }
  }, [query, axiosPublic]);

  // Handle click outside the search bar and suggestion box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowSuggestions(false); // Hide suggestions if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProductClick = (id) => {
    navigate(`/details/${id}`);
  };

  const handleSearchClick = () => {
    if (query.length > 0) {
      navigate(`/search?query=${query}`);
    }
  };

  return (
    <div ref={searchBarRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 3) {
              setShowSuggestions(true); // Show suggestions if query is >= 3 characters
            } else {
              setShowSuggestions(false); // Hide suggestions if query is less than 3 characters
            }
          }}
          onClick={() => {
            if (query.length >= 3) setShowSuggestions(true); // Re-show suggestions on click if query is >= 3
          }}
          placeholder="Search products..."
          className="w-full border border-gray-300 rounded-full p-2 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        {/* Show message when less than 3 characters */}
        {query.length > 0 && query.length < 3 && (
          <div className="absolute z-10 w-full bg-white shadow-lg p-2 text-gray-500 text-center rounded-lg mt-1">
            Type 3 characters to get search suggestions
          </div>
        )}

        {/* Show loading state or "No products found" or suggestions */}
        {showSuggestions && query.length >= 3 && (
          <div
            className="absolute z-10 w-full bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto mt-1"
            style={{ maxHeight: "240px" }}
          >
            {isLoading ? (
              <div className="p-4 text-gray-500 text-center">Loading...</div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No products found
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  onClick={() => handleProductClick(suggestion._id)}
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-100 transition"
                >
                  <img
                    src={suggestion.images[0]}
                    alt={suggestion.name}
                    className="w-10 h-10 mr-2 object-cover rounded-md"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-gray-600">
                      {suggestion.sizes[0].price}৳
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={handleSearchClick}
          disabled={query.length === 0} // Disable button if query is empty
          className={`absolute right-0 top-0 p-2 pr-4 ${
            query.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          <span role="img" aria-label="search" className="text-gray-500">
            🔍
          </span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
