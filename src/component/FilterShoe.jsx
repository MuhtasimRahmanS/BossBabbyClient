import { useEffect, useState } from "react";
import ShoeCard from "./ShoeCard";
import useAxiosPublic from "../hook/useAxiosPublic";
import { useNavigate } from "react-router-dom";

const FilterShoe = ({ filter, category_title }) => {
  const [shoes, setShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true); // Start loading
        const { data } = await axiosPublic.get(`/products/${filter}`, {
          params: {
            filter, // Apply category filter
          },
        });
        setShoes(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false); // Stop loading after data fetch
      }
    };

    fetchProducts();
  }, [filter, axiosPublic]); // Only re-fetch when filter changes

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="border shadow p-4 animate-pulse">
      <div className="bg-gray-300 h-48 mb-4"></div>
      <div className="bg-gray-300 h-4 mb-2"></div>
      <div className="bg-gray-300 h-4"></div>
    </div>
  );

  return (
    <div className="container mx-auto my-20">
      <div className="text-center font-bold text-3xl"> {category_title}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-5">
        {isLoading
          ? // Display 10 skeleton loaders during loading
            Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : // Display actual product cards when loading is complete
            shoes.map((shoe) => <ShoeCard key={shoe._id} shoe={shoe} />)}
      </div>
      {/* Show View All button only if there are more than 9 shoes */}
      {shoes.length > 9 && (
        <button
          className="mt-10 px-6 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate(`/${filter}-collection`)}
        >
          View All
        </button>
      )}
    </div>
  );
};

export default FilterShoe;
