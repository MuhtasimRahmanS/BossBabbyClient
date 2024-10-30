import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import jsPDF from "jspdf";

// Districts array with delivery charges
const districts = [
  { name: "Dhaka", charge: 70 },
  { name: "Savar", charge: 100 },
  { name: "Keraniganj", charge: 100 },
  { name: "Nawabganj", charge: 100 },
  { name: "Dhamrai", charge: 100 },
  { name: "Gazipur", charge: 100 },
  { name: "Narsingdi", charge: 100 },
  { name: "Munshiganj", charge: 100 },
  { name: "Tongi", charge: 100 },
  { name: "Rajshahi", charge: 130 },
  { name: "Joypurhat", charge: 130 },
];

const CheckoutOrder = () => {
  const location = useLocation();
  const product = location.state;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = product.price * product.quantity;
  const totalPrice = subtotal + (deliveryCharge || 0);

  const handleDistrictChange = (e) => {
    const selected = e.target.value;
    setSelectedDistrict(selected);

    const district = districts.find((d) => d.name === selected);
    if (district) {
      setDeliveryCharge(district.charge);
      setErrorMessage("");
    }
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
    setErrorMessage("");

    const orderData = {
      userDetails: {
        name,
        phone,
        address,
        district: selectedDistrict,
        note,
      },
      products: [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          selectedSize: product.selectedSize,
          quantity: product.quantity,
          price: product.price,
        },
      ],
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

        // Display modal with order number or any success message
        alert(
          `Order placed successfully!\nOrder Number: ${orderNumber}\nTotal: ${totalPrice}৳`
        );

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
          const dataURL = canvas.toDataURL(
            "https://i.ibb.co.com/wsWyt3t/bossbabby-1.png"
          ); // or 'image/png' depending on your needs
          resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
      });
    };

    // Decode base64 to get the actual URL
    const companyLogoURL = atob(
      "aHR0cHM6Ly9pLmliYi5jby5jb20vd3NXeXQzdC9ib3NzYmFiYnktMS5wbmc="
    );

    // Load the company logo as a base64 image
    const companyLogo = await getBase64ImageWithWhiteBG(companyLogoURL);

    // Add Order Summary Title on the left side and Company Name on the right
    doc.setFontSize(14);
    doc.text("Order Summary", 14, 10); // Order Summary on the left
    if (companyLogo) {
      doc.addImage(companyLogo, "PNG", 160, 5, 30, 15); // Adjust width and height of the logo
    }
    doc.setFontSize(12);

    // Add Order Number and Customer Details under the order number
    doc.text(`Order Number: ${orderNumber}`, 14, 20); // Order Number

    // Customer Details
    const { userDetails } = orderData;
    doc.text(`Name: ${userDetails.name}`, 14, 30); // Customer Name
    doc.text(`Phone: ${userDetails.phone}`, 14, 40); // Customer Phone
    doc.text(`Address: ${userDetails.address}`, 14, 50); // Customer Address
    doc.text(`District: ${userDetails.district}`, 14, 60); // Customer District

    // Prepare product data and convert images to base64
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

    // Table starting position and row height
    let startY = 70;
    const rowHeight = 32; // Adjust row height for image size

    // Draw Table Header with background color
    doc.setFillColor(200, 200, 200); // Light gray background
    doc.rect(10, startY, 190, 10, "F"); // Draw rectangle for header background

    doc.setFontSize(12);
    doc.setTextColor(0); // Black text
    doc.text("Image", 14, startY + 7); // Image Header
    doc.text("Name", 60, startY + 7); // Product Name Header
    doc.text("Size", 120, startY + 7); // Size Header
    doc.text("Quantity", 150, startY + 7); // Quantity Header
    doc.text("Price", 180, startY + 7); // Price Header

    startY += 15; // Move down for the table rows

    // Iterate over products and render each product as a row
    products.forEach((product) => {
      const imgWidth = 30; // Image width
      const imgHeight = 30; // Image height
      const textXPos = 60; // Starting position for text columns

      // Render Image
      if (product.Image) {
        doc.addImage(product.Image, "JPEG", 14, startY, imgWidth, imgHeight);
      }

      // Render Product Details: Name, Size, Quantity, and Price
      doc.text(`${product.Name}`, textXPos, startY + 10); // Name text
      doc.text(`${product.Size}`, textXPos + 60, startY + 10); // Size text
      doc.text(`${product.Quantity}`, textXPos + 90, startY + 10); // Quantity text
      doc.text(`${product.Price}`, textXPos + 120, startY + 10); // Price text

      // Move to next row
      startY += rowHeight;
    });

    // Add Delivery Charge and Total Price under all products, aligned to the right
    const deliveryCharge = orderData.deliveryCharge; // Assuming deliveryCharge is part of orderData
    const totalPriceWithDelivery = orderData.totalPrice;

    // Add a gap before the total price section
    startY += 10;

    // Set the X position for the right-aligned text (e.g., 180 for right-side alignment)
    const rightAlignX = 180;

    // Render Delivery Charge and Total Price on the right side
    doc.setFontSize(12);
    doc.setTextColor(0); // Black text for totals
    doc.text(`Delivery Charge: ${deliveryCharge}Tk`, rightAlignX, startY, {
      align: "right",
    });
    doc.text(
      `Total Price: ${totalPriceWithDelivery}Tk`,
      rightAlignX,
      startY + 10,
      { align: "right" }
    );

    // Save the PDF
    doc.save(`order-${orderNumber}.pdf`);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
    setSelectedDistrict("");
    setDeliveryCharge(0);
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Checkout Form
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Additional Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Select District</h3>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a district</option>
                {districts.map((district, index) => (
                  <option key={index} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-lg font-semibold mt-4">
              Delivery Charge:{" "}
              <span className="text-gray-700">
                {deliveryCharge ? `${deliveryCharge}৳` : "Select a district"}
              </span>
            </h3>

            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>

        {/* Product Summary */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Order Summary
          </h2>
          <div className="flex items-start gap-4 mb-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-28 h-28 object-cover rounded-md"
            />
            <div>
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">Size: {product.selectedSize}</p>
              <p className="text-gray-600">Quantity: {product.quantity}</p>
              <p className="text-gray-800 font-bold">Price: {product.price}৳</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold">Subtotal: {subtotal}৳</h3>
            <h3 className="text-lg font-semibold">
              Delivery Charge: {deliveryCharge}৳
            </h3>
            <h2 className="text-xl font-bold text-blue-600 mt-2">
              Total: {totalPrice}৳
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrder;
