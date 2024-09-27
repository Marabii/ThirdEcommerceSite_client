import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ShieldCheck } from 'lucide-react'
import { globalContext } from '../../App'
import CardItem from '../../components/CardItem'
import axiosInstance from '../../utils/verifyJWT'
import Header from '../../components/Header'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select' // Add react-select for country dropdown
import countryList from 'react-select-country-list' // Add country list for react-select
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const CheckoutPage = () => {
  const [loaded, setLoaded] = useState(true)
  const [countries, setCountries] = useState([]) // State to manage country list
  const navigate = useNavigate()
  const { cartItems, setCartItems } = useContext(globalContext)
  const serverURL = import.meta.env.VITE_REACT_APP_SERVER
  const [productsData, setProductsData] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      country: '',
      address: ''
    }
  })

  useEffect(() => {
    document.body.style.overflow = 'auto'
    setCountries(countryList().getData()) // Set countries list on load
  }, [])

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productsPromises = cartItems.map((item) =>
          axiosInstance.get(`${serverURL}/api/getProduct/${item.productId}`)
        )
        const products = await Promise.all(productsPromises)
        products.forEach((product) => {
          if (product.data.stock === 0) {
            alert('Sorry, one of the items in your cart is out of stock')
            handleRemoveCartItem(product.data._id)
            if (
              !window.confirm(
                'Would you like to proceed with checkout without this item: ' +
                  product.data.name
              )
            ) {
              navigate('/')
            }
          } else if (
            product.data.stock <
            cartItems.filter((item) => item.productId === product.data._id)[0]
              .quantity
          ) {
            alert(
              `Sorry, you can only buy ${product.data.stock} items of ${product.data.name}`
            )
            if (window.confirm('Would you like to proceed with checkout?')) {
              handleChangeQuantity(product.data._id, product.data.stock)
            } else {
              handleRemoveCartItem(product.data._id)
              navigate('/')
            }
          }
        })
        setProductsData(products.map((item) => item.data))
      } catch (error) {
        console.error('Failed to get products:', error)
      }
    }

    getProducts()
  }, [cartItems])

  const handleRemoveCartItem = () => {
    const updatedCartItems = cartItems.filter(
      (item) => item.productId !== productID
    )

    // Update localStorage
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))

    // Update the cartItems in the context
    setCartItems(updatedCartItems)
  }

  const handleChangeQuantity = (quantityInput) => {
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

  const onSubmit = async (data) => {
    // Add cartItems to the form data
    const formData = { ...data, cartItems }

    try {
      // Make the API request to submit the order
      const response = await fetch(`${serverURL}/api/accept-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Send formData as JSON
      })

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to submit order:', errorData)
        alert(`Error: ${errorData.error || 'Failed to submit order'}`)
        return
      }

      const result = await response.json()
      console.log('Order submitted successfully:', result)

      alert('Order submitted successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('An error occurred while submitting the order. Please try again.')
    }
  }

  const validatePhoneNumber = (value) => {
    const phoneNumber = parsePhoneNumberFromString(value || '') // Parse the phone number
    if (phoneNumber && phoneNumber.isValid()) {
      return true // Valid phone number
    } else {
      return 'Invalid phone number' // Return error message
    }
  }

  const calculateBonus = (cartItem, promo) => {
    if (promo && promo.promotionType === 'buyXget1') {
      return Math.floor(
        cartItem.quantity / promo.discountDetails.buyXGet1Discount.buyQuantity
      )
    }
    return 0
  }

  return (
    <div className="relative grid justify-center p-3 text-center">
      <Header />
      <div className="mt-[100px] space-y-5">
        <div className="flex space-x-1">
          <ShieldCheck stroke="white" fill="rgb(88 28 135)" />
          <p>30 DAY MONEY BACK GUARANTEE</p>
        </div>
        <h1 className="text-balance text-3xl font-semibold text-purple-900">
          You're almost there! Complete your order
        </h1>
      </div>
      <p className="my-[20px]">Chosen Product{cartItems.length > 1 && 's'}:</p>
      <div className="mb-10 flex w-full flex-wrap items-start justify-between gap-5">
        {productsData.map((data) => {
          const cartItem = cartItems.find((item) => item.productId === data._id)
          const bonus = calculateBonus(cartItem, data.promo)
          return (
            <div key={data._id}>
              <CardItem data={data} display={true} />
              <p>Quantity: {cartItem.quantity}</p>
              {bonus > 0 && (
                <p className="text-green-500">
                  Bonus: {bonus} free item{bonus > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-15 max-w-[700px] space-y-5"
      >
        {/* Full Name */}
        <input
          {...register('fullName', {
            required: 'Name is required',
            pattern: {
              value: /^[\p{L} .'-]+$/u,
              message:
                'Name must contain only letters, spaces, periods, apostrophes, or hyphens'
            }
          })}
          placeholder="Full Name"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />
        {errors.fullName && (
          <p className="text-red-500">{errors.fullName.message}</p>
        )}

        {/* Phone Number */}
        <PhoneInput
          {...register('phoneNumber', {
            required: 'Phone Number is required',
            validate: validatePhoneNumber // Add validation function
          })}
          international
          defaultCountry="SA"
          placeholder="Phone Number"
          onChange={(value) => {
            if (value !== '') {
              setValue('phoneNumber', value)
            }
          }}
          onFocus={(e) => {
            e.target.style.border = 'none'
          }}
          className="w-full rounded-md border-2 border-gray-200 bg-transparent px-2 py-3 font-jost text-lg outline-none focus:border-none focus:outline-none"
        />

        {errors.phoneNumber && (
          <p className="text-red-500">{errors.phoneNumber.message}</p>
        )}

        {/* Country (Dropdown) */}
        <Select
          {...register('country', { required: 'Country is required' })}
          options={countries}
          placeholder="Select Country"
          className="w-full"
          onChange={(option) => setValue('country', option.label)}
        />
        {errors.country && (
          <p className="text-red-500">{errors.country.message}</p>
        )}

        {/* Address */}
        <input
          {...register('address')}
          placeholder="Address (Optional)"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />

        {/* Email */}
        <input
          {...register('email', {
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              message: 'Please enter a valid email address'
            }
          })}
          type="email"
          placeholder="Email (Optional)"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`text-white' w-full rounded-md border-2 border-slate-500 px-4 py-3 font-bold transition-all duration-300 hover:bg-slate-500 hover:text-white`}
        >
          ORDER
        </button>
      </form>
    </div>
  )
}

export default CheckoutPage
