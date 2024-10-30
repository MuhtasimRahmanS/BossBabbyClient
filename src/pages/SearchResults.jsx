import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useAxiosPublic from "../hook/useAxiosPublic";
import ShoeCard from "../component/ShoeCard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const { data } = await axiosPublic.get(`/search?q=${query}`);
        setResults(data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    if (query) fetchSearchResults();
  }, [query, axiosPublic]);

  return (
    <div className="container mx-auto">
      <h2>Search Results for &quot;{query}&quot;</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-5">
        {results.map((shoe) => (
          <ShoeCard key={shoe._id} shoe={shoe} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
