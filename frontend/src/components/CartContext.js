import React, { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize state with cart from localStorage if it exists
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage', error);
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cart]);

  const addToCart = (product) => {
    if (product.isBundle) {
      // Add bundle as single cart item
      const bundleItem = {
        ...product,
        _id: `bundle_${product._id}`,
        quantity: product.quantity || 1,
        isBundle: true,
        bundleProducts: product.products,
        price: product.bundlePrice,
        discountedPrice: product.bundlePrice // Use bundle price
      };
      
      setCart(prevCart => {
        const existingBundle = prevCart.find(item => item._id === bundleItem._id);
        if (existingBundle) {
          const updatedCart = prevCart.map(item =>
            item._id === bundleItem._id
              ? { ...item, quantity: item.quantity + bundleItem.quantity }
              : item
          );
          return updatedCart;
        } else {
          return [...prevCart, bundleItem];
        }
      });
    } else {
      // Regular product logic
      setCart(prevCart => {
        const existingItem = prevCart.find(item => 
          item._id === product._id && 
          item.selectedSize === product.selectedSize && 
          item.selectedColor === product.selectedColor
        );

        if (existingItem) {
          const updatedCart = prevCart.map(item =>
            (item._id === product._id && 
             item.selectedSize === product.selectedSize && 
             item.selectedColor === product.selectedColor)
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
          return updatedCart;
        } else {
          return [...prevCart, { ...product, quantity: product.quantity || 1 }];
        }
      });
    }
  };



  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + ((item.discountedPrice || item.price) * item.quantity),
    0
  );

  const cartCount = cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};