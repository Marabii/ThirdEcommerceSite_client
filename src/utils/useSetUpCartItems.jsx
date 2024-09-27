import { useEffect } from "react";

const useSetUpCartItems = (cartItems, setCartItems) => {

    // 1. Load cart items from localStorage into state when the component first mounts
    useEffect(() => {
        const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        // Only update state if localStorage has items that are not already in state
        if (storedCartItems.length > 0 && cartItems.length === 0) {
            setCartItems(storedCartItems);
        }
    }, [setCartItems]);

    // 2. Sync localStorage with cartItems whenever cartItems state changes
    useEffect(() => {
        if (cartItems.length > 0) {
            // Update localStorage with the current state of cartItems
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } else {
            // If cartItems is empty, remove it from localStorage
            localStorage.removeItem('cartItems');
        }
    }, [cartItems]); // This ensures that localStorage is updated whenever cartItems changes
};

export default useSetUpCartItems;
