import { useState, useEffect } from "react";
import useAxiosPublic from "../hook/useAxiosPublic";
import ShoeCard from "./ShoeCard";

const AllProduct = ({ filter, category_title }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosPublic = useAxiosPublic();

  // Reset products and page when component mounts
  useEffect(() => {
    setProducts([]);
    setPage(1);
  }, []);

  // Fetch products function
  const fetchProducts = async () => {
    setLoading(true);
    setError(null); // Reset the error state before making the request
    try {
      const { data } = await axiosPublic.get(
        `/all-product?filter=${filter}&page=${page}&limit=10`
      );

      setProducts((prevProducts) => {
        const newProducts = data.filter(
          (newProduct) =>
            !prevProducts.some((product) => product._id === newProduct._id)
        );
        return [...prevProducts, ...newProducts];
      });

      if (data.length < 10) {
        setHasMore(false); // No more products to load
      }
    } catch (err) {
      console.error("Error fetching boys' products:", err);
      setError("Failed to load products. Please try again.");
    }
    setLoading(false);
  };

  // UseEffect to fetch initial data and subsequent pages
  useEffect(() => {
    if (hasMore && !loading) {
      fetchProducts();
    }
  }, [page]);

  // Debounce the scroll handler
  let debounceTimeout;
  const handleScroll = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 10 &&
        hasMore &&
        !loading
      ) {
        setPage((prevPage) => prevPage + 1); // Increase page number when reaching the bottom
      }
    }, 200);
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{category_title}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-5">
        {products.map((shoe) => (
          <ShoeCard key={shoe._id} shoe={shoe} />
        ))}
      </div>

      {/* Loading spinner */}
      {loading && <div className="text-center mt-4">Loading...</div>}

      {/* Error message */}
      {error && <div className="text-red-500 text-center mt-4">{error}</div>}

      {/* No more products */}
      {!hasMore && !loading && (
        <div className="text-center mt-4">No more products to show.</div>
      )}
    </div>
  );
};

export default AllProduct;
