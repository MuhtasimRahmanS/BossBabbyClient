import { Link } from "react-router-dom";
import { FaCartShopping } from "react-icons/fa6";
import useCartStore from "../hook/useCartStore";

const Cart = () => {
  const { cart } = useCartStore(); // use the cart store

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="flex items-center">
      <Link to="/cart" className="relative flex items-center gap-2 group">
        {/* Cart Icon with count badge */}
        <div className="relative">
          <FaCartShopping className="text-2xl text-gray-700 transition group-hover:text-blue-600" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-1.5 py-0.5 shadow-md">
              {cartItemsCount}
            </span>
          )}
        </div>

        {/* Total Price with hover effect */}
        <span className="ml-2 text-lg font-semibold text-gray-700 transition group-hover:text-blue-600">
          {cartTotalPrice}৳
        </span>
      </Link>
    </div>
  );
};

export default Cart;
