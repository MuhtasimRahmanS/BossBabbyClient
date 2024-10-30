import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useCartStore from "../hook/useCartStore";
import jsPDF from "jspdf";

const districts = [
  { name: "Dhaka", charge: 70 },
  { name: "Rajshahi", charge: 130 },
  { name: "Joypurhat", charge: 130 },
  // Add other districts here
];

const CheckoutCart = () => {
  const location = useLocation();
  const cart = location.state?.cart || [];
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if the cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalPrice = subtotal + deliveryCharge;

  const handleDistrictChange = (e) => {
    const district = districts.find((d) => d.name === e.target.value);
    setSelectedDistrict(district?.name || "");
    setDeliveryCharge(district?.charge || 0);
  };

  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Handle cross-origin images
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      };
      img.onerror = (error) => {
        console.error("Error converting image to base64:", error);
        resolve(null); // Resolve with null in case of error
      };
    });
  };

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address || !selectedDistrict) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setErrorMessage("Please enter a valid 11-digit phone number.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(""); // Clear previous error messages

    const orderData = {
      userDetails: {
        name,
        phone,
        address,
        district: selectedDistrict,
        note,
      },
      products: cart.map((product) => ({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        selectedSize: product.selectedSize,
        quantity: product.quantity,
        price: product.price,
      })),
      deliveryCharge,
      subtotal,
      totalPrice,
    };

    try {
      const response = await fetch("http://localhost:5000/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        const orderNumber = result.orderNumber;

        // Download PDF after successfully placing the order
        handleDownloadPDF(orderData, orderNumber);

        alert(
          `Order placed successfully!\nOrder Number: ${orderNumber}\nTotal: ${totalPrice}৳`
        );
        clearCart(); // Clear cart from the store
        localStorage.removeItem("cart"); // Clear local storage as well
        resetForm();
        navigate("/");
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Failed to place order. Please try again."
        );
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorMessage("An error occurred while placing the order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (orderData, orderNumber) => {
    const doc = new jsPDF();

    // Function to handle image loading and converting it to a base64 JPEG with a white background
    const getBase64ImageWithWhiteBG = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          // Fill the canvas with a white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the image on top of the white background
          ctx.drawImage(img, 0, 0);

          // Convert the canvas to base64 JPEG
          const dataURL = canvas.toDataURL("image/jpeg");
          resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
      });
    };

    const companyLogoURL = atob(
      "aHR0cHM6Ly9pLmliYi5jby5jb20vd3NXeXQzdC9ib3NzYmFiYnktMS5wbmc="
    );
    const companyLogo = await getBase64ImageWithWhiteBG(companyLogoURL);

    doc.setFontSize(14);
    doc.text("Order Summary", 14, 10); // Order Summary on the left
    if (companyLogo) {
      doc.addImage(companyLogo, "PNG", 160, 5, 30, 15);
    }
    doc.setFontSize(12);

    // Order Number and Customer Details
    doc.text(`Order Number: ${orderNumber}`, 14, 20);
    const { userDetails } = orderData;
    doc.text(`Name: ${userDetails.name}`, 14, 30);
    doc.text(`Phone: ${userDetails.phone}`, 14, 40);
    doc.text(`Address: ${userDetails.address}`, 14, 50);
    doc.text(`District: ${userDetails.district}`, 14, 60);

    // Product details
    const products = await Promise.all(
      orderData.products.map(async (product) => {
        const base64Image = await getBase64ImageFromURL(product.productImage);
        return {
          Image: base64Image,
          Name: product.productName,
          Size: product.selectedSize,
          Quantity: product.quantity,
          Price: `${product.price}Tk`,
        };
      })
    );

    let startY = 70;
    const rowHeight = 32;

    doc.setFillColor(200, 200, 200);
    doc.rect(10, startY, 190, 10, "F");

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Image", 14, startY + 7);
    doc.text("Name", 60, startY + 7);
    doc.text("Size", 120, startY + 7);
    doc.text("Quantity", 150, startY + 7);
    doc.text("Price", 180, startY + 7);

    startY += 15;

    products.forEach((product) => {
      const imgWidth = 30;
      const imgHeight = 30;
      const textXPos = 60;

      if (product.Image) {
        doc.addImage(product.Image, "JPEG", 14, startY, imgWidth, imgHeight);
      }

      doc.text(`${product.Name}`, textXPos, startY + 10);
      doc.text(`${product.Size}`, textXPos + 60, startY + 10);
      doc.text(`${product.Quantity}`, textXPos + 90, startY + 10);
      doc.text(`${product.Price}`, textXPos + 120, startY + 10);

      startY += rowHeight;
    });

    const deliveryCharge = orderData.deliveryCharge;
    const totalPriceWithDelivery = orderData.totalPrice;

    // Add totals at the end of the page
    doc.text(`Subtotal: ${subtotal}Tk`, 140, startY + 20);
    doc.text(`Delivery: ${deliveryCharge}Tk`, 140, startY + 30);
    doc.text(`Total Price: ${totalPriceWithDelivery}Tk`, 140, startY + 40);

    doc.save(`order-${orderNumber}.pdf`);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
    setSelectedDistrict("");
    setDeliveryCharge(0);
    setErrorMessage("");
  };

  return (
    <div className="container mx-auto my-10 p-5 bg-gray-50 shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Checkout</h2>
      {errorMessage && (
        <div className="bg-red-100 text-red-800 p-4 mb-4 rounded">
          {errorMessage}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checkout form */}
        <div className="border p-4 rounded-lg shadow-lg bg-white">
          <h3 className="text-xl font-semibold mb-4">Customer Details</h3>
          <form>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full mb-4 rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Your Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full mb-4 rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Your Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered w-full mb-4 rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <textarea
              placeholder="Additional Notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="textarea textarea-bordered w-full mb-4 rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            />
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="select select-bordered w-full mb-4 rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handlePlaceOrder}
              className={`btn btn-primary w-full rounded-md shadow-md ${
                isLoading ? "bg-blue-400" : "bg-blue-600"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="border p-4 rounded-lg shadow-lg bg-white">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          {cart.map((product) => (
            <div key={product.id} className="flex mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="ml-4">
                <h4 className="font-semibold">{product.name}</h4>
                <p>Size: {product.selectedSize}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Price: {product.price}৳</p>
              </div>
            </div>
          ))}
          <hr className="my-4" />
          <div className="flex justify-between">
            <p>Subtotal:</p>
            <p>{subtotal}৳</p>
          </div>
          <div className="flex justify-between">
            <p>Delivery Charge:</p>
            <p>{deliveryCharge}৳</p>
          </div>
          <div className="flex justify-between font-bold">
            <p>Total Price:</p>
            <p>{totalPrice}৳</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCart;
