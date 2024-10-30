import { create } from "zustand";

// Helper function to get cart from localStorage
const getCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : [];
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

const useCartStore = create((set) => ({
  cart: getCartFromLocalStorage(),

  // Add item to cart
  addToCart: (shoe) => {
    set((state) => {
      const updatedCart = [...state.cart, shoe];
      saveCartToLocalStorage(updatedCart);
      return { cart: updatedCart };
    });
  },

  // Remove item from cart
  removeFromCart: (id, selectedSize) => {
    set((state) => {
      const updatedCart = state.cart.filter(
        (item) => !(item.id === id && item.selectedSize === selectedSize)
      );
      saveCartToLocalStorage(updatedCart);
      return { cart: updatedCart };
    });
  },

  // Update item in cart
  updateCartItem: (id, newSize, newQuantity) => {
    set((state) => {
      const updatedCart = state.cart.map((item) =>
        item.id === id
          ? { ...item, selectedSize: newSize, quantity: newQuantity }
          : item
      );
      saveCartToLocalStorage(updatedCart);
      return { cart: updatedCart };
    });
  },

  // Clear the cart
  clearCart: () => {
    set(() => {
      saveCartToLocalStorage([]);
      return { cart: [] };
    });
  },
}));

export default useCartStore;
