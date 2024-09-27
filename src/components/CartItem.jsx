import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { globalContext } from '../App'
import convertCurrency from '../utils/convertCurrency'

const CartItem = (props) => {
  const { productID, setLoadingStates, updateItemDetails } = props
  const [productData, setProductData] = useState()
  const serverURL = import.meta.env.VITE_REACT_APP_SERVER
  const [loading, setLoading] = useState(false)
  const { setCartItems, cartItems } = useContext(globalContext)
  const [priceData, setPriceData] = useState({})
  const [bonus, setBonus] = useState(0)
  const affectedItem = cartItems.find((item) => item.productId === productID)
  const promo = productData?.promo

  useEffect(() => {
    if (promo && promo.promotionType === 'buyXget1') {
      setBonus(
        Math.floor(
          affectedItem.quantity /
            promo.discountDetails.buyXGet1Discount.buyQuantity
        )
      )
    }
  }, [priceData, affectedItem, promo, updateItemDetails])

  // In CartItem.js
  useEffect(() => {
    let buyXget1
    if (
      promo &&
      promo.promotionType === 'buyXget1' &&
      promo?.discountDetails?.buyXGet1Discount?.buyQuantity
    ) {
      buyXget1 = {
        buy: promo?.discountDetails?.buyXGet1Discount?.buyQuantity
      }
    }

    if (priceData && affectedItem) {
      const newDetails = {
        price: priceData.price,
        quantity: affectedItem.quantity
      }

      if (buyXget1) newDetails.buyXget1 = buyXget1
      updateItemDetails(productID, newDetails)
    }
  }, [priceData, affectedItem])

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/getProduct/${productID}`
        )
        setProductData(response.data)
      } catch (e) {
        alert('Error Loading Your Cart')
      }
    }
    getProduct()
  }, [productID])

  useEffect(() => {
    setLoadingStates(loading)
  }, [loading])

  useEffect(() => {
    const getCorrectPrice = async () => {
      const result = await convertCurrency(productData.price)
      setPriceData(result)
    }
    if (productData) getCorrectPrice()
  }, [productData])

  const handleQuantityChange = (quantityInput) => {
    let newQuantity = quantityInput

    if (quantityInput >= productData.stock) {
      newQuantity = productData.stock
    } else if (quantityInput < 1) {
      newQuantity = 1
    }

    // Update cartItems in localStorage
    const updatedCartItems = cartItems.map((item) => {
      if (item.productId === productID) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })

    // Update localStorage
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))

    // Update the cartItems in the context
    setCartItems(updatedCartItems)
  }

  const handleRemoveCartItem = () => {
    const updatedCartItems = cartItems.filter(
      (item) => item.productId !== productID
    )

    // Update localStorage
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))

    // Update the cartItems in the context
    setCartItems(updatedCartItems)
  }

  if (!productData || !affectedItem || !priceData) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className={loading ? 'opacity-40' : 'opacity-100'}>
        <img
          src={productData.productThumbnail}
          alt="cart-item"
          className="h-auto w-[80px]"
        />
      </div>
      <div
        className={`flex w-full items-center justify-between font-jost ${loading ? 'opacity-40' : 'opacity-100'}`}
      >
        <div>
          <h3 className="mb-2 font-bold text-gray-500">{productData.name}</h3>
          <p className="py-2 text-gray-500">
            {priceData.price?.toFixed(2)} {priceData.currency}{' '}
          </p>
          {promo && promo.promotionType === 'buyXget1' && (
            <p className="text-green-500">
              Buy {promo.discountDetails.buyXGet1Discount.buyQuantity}, Get 1
              For Free
            </p>
          )}
          <button
            onClick={handleRemoveCartItem}
            className="border-b-2 border-red-600 pb-[1px] text-red-600 transition-all duration-200 hover:font-bold"
          >
            Remove
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <p>Qt</p>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min={1}
              max={productData.stock}
              onChange={(e) => handleQuantityChange(e.target.value)}
              value={affectedItem.quantity}
              className="h-fit w-[50px] rounded-md border border-gray-400 p-2"
            />
          </div>
          {bonus > 0 && (
            <div className="flex items-center justify-between space-x-2">
              <p>Bonus</p>
              <div className="h-fit w-[50px] rounded-md border border-gray-400 p-2">
                {bonus}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartItem
