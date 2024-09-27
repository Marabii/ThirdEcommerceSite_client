import { useState, useContext, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { globalContext } from '../App'
import convertCurrency from '../utils/convertCurrency'

const CardItem = (props) => {
  const { data, display, width } = props
  const clientURL = import.meta.env.VITE_REACT_APP_CLIENT
  const [showAddToCart, setShowAddToCart] = useState(false)
  const { setCartItems } = useContext(globalContext)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [priceData, setPriceData] = useState({})
  const [oldPrice, setOldPrice] = useState(0)
  const promo = data?.promo

  const handleAddToCart = () => {
    if (data.stock === 0) {
      return alert('Sorry, we are out of stock')
    }

    setCartItems((prev) => {
      const itemExists = prev.find((item) => item.productId === data._id)
      if (itemExists) {
        alert('Item already exists in your cart')
        return prev
      } else {
        return [...prev, { productId: data._id, quantity: 1 }]
      }
    })
  }

  useEffect(() => {
    const getCorrectPrice = async () => {
      const result = await convertCurrency(data.price)
      setPriceData(result)

      // Calculate old price if promo is percentage-based
      if (promo && promo.promotionType === 'percentage') {
        const discount = promo?.discountDetails?.percentageDiscount?.amount
        if (discount) {
          const oldPriceValue = Number(result.price) / (1 - discount / 100)
          setOldPrice(oldPriceValue)
        }
      } else {
        setOldPrice(0)
      }
    }

    if (data.price) getCorrectPrice()
  }, [data, promo])

  return (
    <div
      style={{ width: width ? `${width}px` : 'fit-content' }}
      key={data._id}
      className="mb-5 cursor-pointer shadow-xl"
    >
      <div
        onMouseEnter={() => setShowAddToCart(true)}
        onMouseLeave={() => setShowAddToCart(false)}
        className={`relative aspect-square w-full max-w-[400px] ${
          !imageLoaded && 'h-[420px] animate-pulse rounded-md'
        } bg-gray-400`}
      >
        {/* Percentage Promotion Display */}
        {promo && promo.promotionType === 'percentage' && (
          <div className="text-playfair absolute left-2 top-2 bg-gray-100 px-4 py-2 font-semibold text-gray-600">
            Promo:{' '}
            <span className="text-red-500">
              {promo?.discountDetails?.percentageDiscount?.amount}% off
            </span>
          </div>
        )}

        {/* Buy X Get 1 Promotion Display */}
        {promo && promo.promotionType === 'buyXget1' && (
          <div className="text-playfair absolute left-2 top-2 bg-gray-100 px-4 py-2 font-semibold text-gray-600">
            Buy {promo?.discountDetails?.buyXGet1Discount?.buyQuantity} Get 1
            For Free
          </div>
        )}

        {data.stock === 0 && (
          <div className="text-playfair absolute right-2 top-2 bg-gray-100 px-4 py-2 font-semibold text-gray-600">
            Out Of Stock
          </div>
        )}
        <a href={`${clientURL}/product-page/${data._id}`}>
          <img
            className="aspect-square w-full max-w-[400px]"
            src={data.productThumbnail}
            alt="card-img"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </a>
        <AnimatePresence>
          {showAddToCart && display && (
            <motion.div
              initial={{ x: '-50%', y: -20 }}
              animate={{ x: '-50%', y: 0 }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              onClick={handleAddToCart}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-100 px-4 py-2 font-semibold text-gray-500"
            >
              Add To Cart
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <h2 className="mb-4 w-fit p-2 font-playfair text-2xl font-semibold">
        {data.name}
      </h2>
      <h3 className="w-fit p-2 text-lg font-semibold">
        {priceData.price?.toFixed(2)} {priceData.currency}{' '}
        {oldPrice !== 0 && (
          <span className="font-normal text-slate-400 line-through">
            {oldPrice?.toFixed(2)} {priceData.currency}
          </span>
        )}
      </h3>
    </div>
  )
}

export default CardItem
