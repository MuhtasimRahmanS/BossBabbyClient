import { useEffect, useState } from "react";
import useCartStore from "../hook/useCartStore";
import { useNavigate } from "react-router-dom";

const ViewCart = () => {
  const { cart, removeFromCart, updateCartItem } = useCartStore();
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    calculateTotalPrice(cart);
  }, [cart]);

  // Calculate total price
  const calculateTotalPrice = (cart) => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  // Handle size and quantity change
  const handleUpdate = (item, newSize, newQuantity) => {
    if (newQuantity <= item.stock && newQuantity >= 1) {
      updateCartItem(item.id, newSize, newQuantity);
    }
  };
  const handleCheckout = () => {
    navigate("/checkout-cart", { state: { cart } });
  };

  return (
    <div className="container mx-auto my-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Cart</h2>
      <div className="grid grid-cols-1 gap-6">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}`}
              className="border p-4 flex flex-col md:flex-row justify-between items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover mb-4 md:mb-0"
              />
              <div className="flex flex-col flex-grow md:flex-grow-0 md:flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p>Size: {item.selectedSize}</p>
                <p>Unit Price: {item.price}৳</p>
                <p>Stock: {item.stock}</p>
              </div>
              <div className="flex items-center mb-4 md:mb-0">
                <button
                  onClick={() =>
                    handleUpdate(item, item.selectedSize, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="bg-gray-300 px-2 py-1 rounded-l-md"
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdate(item, item.selectedSize, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.stock}
                  className="bg-gray-300 px-2 py-1 rounded-r-md"
                >
                  +
                </button>
              </div>
              <p className="mb-4 md:mb-0">
                Subtotal: {item.price * item.quantity}৳
              </p>
              <button
                onClick={() => removeFromCart(item.id, item.selectedSize)}
                className="bg-red-500 text-white px-4 py-2"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-center">Your cart is empty</p>
        )}
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-2xl">Total: {totalPrice}৳</h3>
        {cart.length > 0 && (
          <button
            onClick={handleCheckout}
            className="bg-green-500 text-white px-4 py-2 mt-4"
          >
            Checkout
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewCart;
