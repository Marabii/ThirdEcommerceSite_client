import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ShieldCheck } from 'lucide-react';
import { globalContext } from '../../App';
import CardItemId from '../../components/CardItemId';
import axiosInstance from '../../utils/verifyJWT';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [loaded, setLoaded] = useState(true);
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useContext(globalContext);
  const serverURL = import.meta.env.VITE_REACT_APP_SERVER;
  const items = cartItems.map((item) => ({
    id: item.productId,
    quantity: item.quantity
  }));

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      country: '',
      address: ''
    }
  });

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productsPromises = cartItems.map((item) =>
          axiosInstance.get(`${serverURL}/api/getProduct/${item.productId}`)
        )
        const products = await Promise.all(productsPromises)
        products.forEach((product) => {
          if (product.data.stock == 0) {
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
      } catch (error) {
        console.error('Failed to get products:', error)
      }
    }

    getProducts()
  }, [cartItems])

  const handleRemoveCartItem = () => {
    const updatedCartItems = cartItems.filter(item => item.productId !== productID)

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
    const updatedCartItems = cartItems.map(item => {
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

  const onSubmit = async () => {};

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
      <div className="flex flex-col items-center">
        {cartItems.map((item) => (
          <CardItemId
            key={item.productId}
            productId={item.productId}
            display={false}
            width={250}
            setLoaded={setLoaded}
            loading={loaded}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-15 max-w-[700px] space-y-5">
        <input
          {...register("name", {
            required: "Name is required",
            pattern: {
              value: /^[\p{L} .'-]+$/u,
              message:
                "Name must contain only letters, spaces, periods, apostrophes, or hyphens",
            },
          })}
          placeholder="Full Name"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />
        {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}
        <PhoneInput
          {...register('phoneNumber', { required: 'Phone Number is required' })}
          international
          defaultCountry="SA"
          placeholder="Phone Number"
          onChange={value => setValue('phoneNumber', value)}
          value={watch('phoneNumber')}
          className="w-full"
        />
        {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
        <input
          {...register('country', { required: 'Country is required' })}
          placeholder="Country"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />
        {errors.country && <p className="text-red-500">{errors.country.message}</p>}
        <input
          {...register('address')}
          placeholder="Address (Optional)"
          className="w-full rounded-md border-2 border-gray-200 px-2 py-3 font-jost text-lg"
        />
        <button
          type="submit"
          className="my-5 rounded-lg bg-purple-900 py-4 text-xl font-semibold text-white transition-all duration-300 hover:bg-purple-800"
        >
          PAY
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
