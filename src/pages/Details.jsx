import { useEffect, useState } from "react";
import useAxiosPublic from "../hook/useAxiosPublic";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ReactImageMagnify from "react-image-magnify";
import ShoeCard from "../component/ShoeCard";
import { useNavigate } from "react-router-dom";
import useCartStore from "../hook/useCartStore";
import Size1 from "../component/Size1";

const Details = () => {
  const { id } = useParams();
  const [shoes, setShoes] = useState([]); // related shoes
  const [shoe, setShoe] = useState(null); // shoe details
  const [selectedSize, setSelectedSize] = useState(null); // selected size
  const [price, setPrice] = useState(null); // price of selected size
  const [discountPrice, setDiscountPrice] = useState(null); // price of selected size
  const [stock, setStock] = useState(null); // stock for selected size
  const [quantity, setQuantity] = useState(1); // quantity to add
  const axiosPublic = useAxiosPublic();
  const [activeImage, setActiveImage] = useState(null); // active image for magnify
  const [isMobile, setIsMobile] = useState(false); // check mobile size
  const [filter, setFilter] = useState(null);
  const [sizeError, setSizeError] = useState(""); // To show error when no size is selected
  const navigate = useNavigate();

  // Handle size change
  const handleSizeChange = (sizeInfo) => {
    setSelectedSize(sizeInfo.size);
    setPrice(sizeInfo.price);
    setStock(sizeInfo.stock);
    setDiscountPrice(sizeInfo.discountPrice || 0); // Include discount price
    setQuantity(1); // Reset quantity when size changes
    setSizeError(""); // Clear error when size is selected
  };

  // Handle quantity change (increase or decrease)
  const handleQuantityChange = (operation) => {
    if (operation === "increase" && quantity < stock) {
      setQuantity(quantity + 1);
    }
    if (operation === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Add to Cart functionality using Zustand store
  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError("Please select a size before adding to cart.");
      return; // Prevent adding to cart if size is not selected
    }

    // Use discountPrice if it exists, otherwise use the regular price
    const finalPrice = discountPrice > 0 ? discountPrice : price;

    const selectedShoe = {
      id: id,
      image: shoe.images[0], // Assuming the first image is the main one
      name: shoe.name,
      selectedSize,
      price: finalPrice,
      quantity,
      stock,
    };

    // Add to cart using Zustand store
    useCartStore.getState().addToCart(selectedShoe);
    alert("Added to cart!");
  };

  // Order Now functionality
  const handleOrderNow = () => {
    if (!selectedSize) {
      setSizeError("Please select a size before ordering.");
      return; // Prevent ordering if size is not selected
    }

    // Use discountPrice if it exists, otherwise use the regular price
    const finalPrice = discountPrice > 0 ? discountPrice : price;

    const selectedShoe = {
      id: id,
      name: shoe.name,
      image: activeImage, // Add product image to the checkout
      selectedSize,
      price: finalPrice,
      quantity,
    };

    navigate("/checkout-order", { state: selectedShoe });
  };

  // Detect mobile screen size on load and window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Define mobile as 768px or less
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize); // Listen for window resizing
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setSelectedSize(null);
        setPrice(null);
        setStock(null);
        setDiscountPrice(null); // Reset discount price
        setQuantity(1); // Reset quantity

        const { data } = await axiosPublic.get(`/product/${id}`);
        setShoe(data);
        if (data.sizes?.length > 0) {
          setPrice(data.sizes[0].price);
          setStock(data.sizes[0].stock);
          setDiscountPrice(data.sizes[0].discountPrice || 0); // Set the discount price for the first size, if available
        }
        if (data.images?.length > 0) {
          setActiveImage(data.images[0]); // Set the first image as the active image
        }
        if (data.category) {
          setFilter(data.category); // Set category filter for related products
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id, axiosPublic]);
  // Fetch related products
  useEffect(() => {
    if (filter && shoe?._id) {
      const fetchProducts = async () => {
        try {
          const { data } = await axiosPublic.get(
            `/related/${filter}/${shoe._id}`
          );
          setShoes(data);
        } catch (error) {
          console.error("Error fetching related products:", error);
        }
      };

      fetchProducts();
    }
  }, [filter, shoe?._id, axiosPublic]);

  if (!shoe) {
    return <div>Loading...</div>; // Loading state until shoe data is fetched
  }

  return (
    <div className="container mx-auto mt-10">
      <div className="flex flex-col lg:flex-row px-4">
        {/* Product Image and Swiper */}
        <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
          <div className="w-full sm:w-[400px] lg:w-[500px] mx-auto mb-5">
            {activeImage && (
              <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: "Product Image",
                    isFluidWidth: true,
                    src: activeImage,
                  },
                  largeImage: {
                    src: activeImage,
                    width: 1000,
                    height: 1200,
                  },
                  enlargedImagePosition: isMobile ? "over" : "beside",
                  isHintEnabled: !isMobile,
                  shouldUsePositiveSpaceLens: !isMobile,
                  enlargedImageContainerDimensions: isMobile
                    ? { width: "100%", height: "100%" }
                    : { width: "150%", height: "120%" },
                }}
              />
            )}
          </div>

          <Swiper
            spaceBetween={10}
            slidesPerView={3}
            className="w-full lg:w-[500px]"
          >
            {shoe.images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`product-${idx}`}
                  className="cursor-pointer w-full h-auto object-cover"
                  style={{
                    padding: "5px",
                    transition: "transform 0.2s ease",
                    transform: activeImage === img ? "scale(1.1)" : "scale(1)",
                  }}
                  onClick={() => setActiveImage(img)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-bold mb-4">{shoe.name}</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            {shoe.sizes.map((size) => (
              <div
                key={size.size}
                onClick={() => handleSizeChange(size)}
                className={`px-4 py-2 border-2 cursor-pointer ${
                  selectedSize === size.size
                    ? "border-blue-500"
                    : "border-gray-500"
                }`}
              >
                {size.size}
              </div>
            ))}
          </div>

          {sizeError && <p className="text-red-500 mb-4">{sizeError}</p>}

          <Size1 />

          {price !== null && (
            <>
              {discountPrice > 0 ? (
                <p className="text-xl mb-2">
                  <span className="line-through text-red-500 mr-2">
                    {price}৳
                  </span>
                  <span className="text-green-500">{discountPrice}৳</span>
                </p>
              ) : (
                <p className="text-xl mb-2">{price}৳</p>
              )}

              {/* Display stock only when a size is selected */}
              {selectedSize && (
                <p
                  className={`text-xl mb-4 ${
                    stock === 0 ? "text-red-500" : ""
                  }`}
                >
                  {stock === 0 ? "Out of stock" : `Stock: ${stock}`}
                </p>
              )}

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={quantity >= stock || stock === 0} // Disable when stock is 0
                >
                  +
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className={`px-6 py-2 bg-blue-500 text-white rounded ${
                    stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={stock === 0}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleOrderNow}
                  className={`px-6 py-2 bg-green-500 text-white rounded ${
                    stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={stock === 0}
                >
                  Order Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Related Products */}
      <h3 className="text-2xl font-bold mt-10 mb-4">Related Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shoes.map((relatedShoe) => (
          <ShoeCard key={relatedShoe._id} shoe={relatedShoe} />
        ))}
      </div>
    </div>
  );
};

export default Details;
