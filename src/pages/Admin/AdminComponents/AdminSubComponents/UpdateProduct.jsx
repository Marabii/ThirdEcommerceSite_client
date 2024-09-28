import { useState, useContext, useEffect } from 'react'
import { globalContext } from '../../../../App'
import axios from 'axios'

import DropzoneHandler from './DropzoneHandler'
import MaterialHandler from './MaterialHandler'
import TagHandler from './TagHandler'
import SpecificationHandler from './SpecificationsHandler'
import axiosInstance from '../../../../utils/verifyJWT'
import SearchHandler from './SearchHandler'

const AddProduct = () => {
  const [productDetailsForm, setProductDetailsForm] = useState({
    name: '',
    price: '',
    description: '',
    delivery: '',
    stock: '',
    category: '',
    productDetails: '',
    specification: {},
    materials: [''],
    tags: [''],
    productThumbnail: '',
    additionalImages: ['']
  })
  const [currentProduct, setCurrentProduct] = useState('')
  const serverURL = import.meta.env.VITE_REACT_APP_SERVER
  //----Get Categories----
  const categories = useContext(globalContext).exploreAll.categories

  useEffect(() => {
    if (categories)
      setProductDetailsForm((prev) => ({
        ...prev,
        category: categories[0]
      }))
  }, [categories])
  //----End Of Get Categories----

  //----Getting product data
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/getProduct/${currentProduct}`
        )
        const data = response.data
        setProductDetailsForm(data)
      } catch (e) {
        console.log(e)
      }
    }

    if (currentProduct !== '') {
      getProductDetails()
    }
  }, [currentProduct])
  //----End of getting product data----

  //----Handle dropzone----
  const [images, setImages] = useState([])
  const [thumbnail, setThumbnail] = useState([])
  const [hasThumbnailChanged, setHasThumbnailChanged] = useState(false)
  const [haveImagesChanged, setHaveImagesChanged] = useState(false)

  useEffect(() => {
    if (
      productDetailsForm.productThumbnail &&
      productDetailsForm.additionalImages
    ) {
      setThumbnail([productDetailsForm.productThumbnail])
      setImages(productDetailsForm.additionalImages)
    }
  }, [productDetailsForm])
  //----finish handle dropzone----

  const handleThumbnailUpload = async () => {
    if (!thumbnail || thumbnail.length === 0) {
      alert('Please upload a thumbnail image')
      return null
    }

    const formData = new FormData()
    try {
      formData.append('thumbnail', thumbnail[0])
      await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_SERVER}/api/upload/products`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      const storagePath = `assets/products/${thumbnail[0].name}`
      console.log(
        'thumbnail uploaded: ',
        `https://storage.googleapis.com/${import.meta.env.VITE_REACT_APP_BUCKETNAME}/${storagePath}`
      )
      return `https://storage.googleapis.com/${import.meta.env.VITE_REACT_APP_BUCKETNAME}/${storagePath}`
    } catch (e) {
      alert('Error uploading thumbnail')
      console.error(e)
      return null
    }
  }

  const handleAdditionalImages = async () => {
    const formData = new FormData()
    const imagesLinks = []
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const storagePath = `assets/additionalImages/${images[i].name}`
        imagesLinks.push(
          `https://storage.googleapis.com/${import.meta.env.VITE_REACT_APP_BUCKETNAME}/${storagePath}`
        )
        formData.append('images', images[i])
      }
    }

    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_SERVER}/api/upload/additionalImages`,
        formData
      )
      console.log('additionalImages were uploaded successfully: ', imagesLinks)
      return imagesLinks
    } catch (error) {
      alert('Failed to upload images')
      console.error(error)
      return []
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Create a local object to store form changes before updating the state
    let updatedForm = { ...productDetailsForm }

    try {
      // Check if thumbnail has changed and update the local form object
      if (hasThumbnailChanged) {
        const thumbnailLink = await handleThumbnailUpload()
        updatedForm.productThumbnail = thumbnailLink // Add thumbnail to the local object
      }

      // Check if additional images have changed and update the local form object
      if (haveImagesChanged) {
        const imagesLinks = await handleAdditionalImages()
        updatedForm.additionalImages = imagesLinks // Add images to the local object
      }

      console.log('Updated form data:', updatedForm)

      // Send the correct updated form object to the server
      const response = await axiosInstance.post(
        `${serverURL}/api/updateProduct/${currentProduct}`,
        updatedForm // Send the updated form object instead of the state
      )

      console.log('Product updated successfully:', response.data)

      // Reset the form after successful submission
      setProductDetailsForm({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        delivery: '',
        productDetails: '',
        specification: {},
        materials: [],
        tags: []
      })
      setImages([])
      setThumbnail([])
      setCurrentProduct('')

      // Show success message
      alert('Product updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add product. Please try again.')
    }
  }

  const handleProductDetailsFormChange = (e) => {
    const { name, value } = e.target

    // Limit the product name and description length
    if (name === 'name' && value.length > 20) {
      alert('Product name should not exceed 20 characters')
      return
    }

    if (name === 'description' && value.length > 360) {
      alert('Description should not exceed 360 characters')
      return
    }

    // If the user selects "Add New Category", we show an input for the new category
    if (name === 'category' && value === 'new-category') {
      setProductDetailsForm((prev) => ({
        ...prev,
        [name]: value,
        newCategory: '' // Add a new field to store the custom category
      }))
    } else if (name === 'newCategory') {
      // Update the new category field when the user types a new category
      setProductDetailsForm((prev) => ({
        ...prev,
        newCategory: value
      }))
    } else {
      // Update the form state normally
      setProductDetailsForm((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const resetProductDetailsForm = () => {
    if (window.confirm('Are you sure you want to discard these changes ?')) {
      setProductDetailsForm({
        name: '',
        price: '',
        description: '',
        delivery: '',
        stock: '',
        category: '',
        productDetails: '',
        specification: {},
        materials: [''],
        tags: ['']
      })

      setImages([])
      setThumbnail([])
      setCurrentProduct('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit w-[580px] space-y-4 rounded-xl bg-white p-4"
    >
      <h1 className="mb-5 text-2xl font-bold">Update Product</h1>
      {currentProduct === '' ? (
        <div className="relative w-full">
          <SearchHandler
            setCurrentProduct={setCurrentProduct}
            placeholder={'Enter the name of the product you want to modify'}
          />
        </div>
      ) : (
        <>
          <label className="mb-2 block text-lg font-semibold" htmlFor="name">
            Product name
          </label>
          <input
            className="w-full rounded-lg border border-slate-500 px-4 py-5"
            type="text"
            name="name"
            id="name"
            placeholder="Enter Product name"
            value={productDetailsForm.name}
            onChange={handleProductDetailsFormChange}
            required
          />
          <p className="mt-2 text-sm text-gray-600">
            Do not exceed 20 characters when entering the product name.
          </p>
          <div className="my-2 flex justify-between gap-3">
            <div>
              <label
                className="mb-2 block text-lg font-semibold"
                htmlFor="price"
              >
                Price
              </label>
              <input
                className="w-full rounded-lg border border-slate-500 px-2 py-3 text-lg"
                type="number"
                name="price"
                id="price"
                placeholder="Enter Price"
                onChange={handleProductDetailsFormChange}
                value={productDetailsForm.price}
                required
              />
            </div>
            <div>
              <label
                className="mb-2 block text-lg font-semibold"
                htmlFor="stock"
              >
                Stock
              </label>
              <input
                min={1}
                className="w-full rounded-lg border border-slate-500 px-2 py-3 text-lg"
                type="number"
                name="stock"
                id="stock"
                placeholder="Enter Stock"
                onChange={handleProductDetailsFormChange}
                value={productDetailsForm.stock}
                required
              />
            </div>
          </div>
          <div>
            <label
              className="mb-2 block text-lg font-semibold"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Enter Description"
              value={productDetailsForm.description}
              onChange={handleProductDetailsFormChange}
              className="min-h-[200px] w-full resize-none overflow-hidden rounded-lg border border-gray-500 p-3"
              required
            />
          </div>
          <div>
            <label
              htmlFor="productDetails"
              className="mb-2 block text-lg font-semibold"
            >
              Product Details
            </label>
            <textarea
              name="productDetails"
              id="productDetails"
              placeholder="Enter Product Details"
              onChange={handleProductDetailsFormChange}
              value={productDetailsForm.productDetails}
              className="min-h-[150px] w-full resize-none overflow-hidden rounded-lg border border-gray-500 p-3"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-lg font-semibold"
              htmlFor="delivery"
            >
              Delivery
            </label>
            <textarea
              name="delivery"
              id="delivery"
              placeholder="Enter Delivery"
              value={productDetailsForm.delivery}
              onChange={handleProductDetailsFormChange}
              className="min-h-[100px] w-full resize-none overflow-hidden rounded-lg border border-gray-500 p-3"
              required
            />
          </div>
          <div>
            <div>
              <label
                className="mb-2 block text-lg font-semibold"
                htmlFor="category"
              >
                Category
              </label>
              {categories ? (
                <>
                  <select
                    required
                    name="category"
                    id="category"
                    value={productDetailsForm.category}
                    onChange={handleProductDetailsFormChange}
                    className="w-full rounded-md border border-gray-500 p-2 text-lg"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="capitalize"
                      >
                        {category}
                      </option>
                    ))}
                    <option value="new-category" className="capitalize">
                      Add New Category
                    </option>
                  </select>

                  {/* Conditionally render input field for new category */}
                  {productDetailsForm.category === 'new-category' && (
                    <input
                      type="text"
                      name="newCategory"
                      placeholder="Enter new category"
                      value={productDetailsForm.newCategory || ''}
                      onChange={handleProductDetailsFormChange}
                      className="mt-2 w-full rounded-md border border-gray-500 p-2 text-lg"
                      required
                    />
                  )}
                </>
              ) : (
                <div className="w-full animate-pulse rounded-md border border-gray-500 p-2 text-lg"></div>
              )}
            </div>
            <SpecificationHandler
              productDetailsForm={productDetailsForm}
              setProductDetailsForm={setProductDetailsForm}
            />
            <div className="flex flex-wrap justify-between">
              <MaterialHandler
                productDetailsForm={productDetailsForm}
                setProductDetailsForm={setProductDetailsForm}
              />
              <TagHandler
                productDetailsForm={productDetailsForm}
                setProductDetailsForm={setProductDetailsForm}
              />
            </div>
            <DropzoneHandler
              images={images}
              setImages={setImages}
              setThumbnail={setThumbnail}
              setHasThumbnailChanged={setHasThumbnailChanged}
              setHaveImagesChanged={setHaveImagesChanged}
              thumbnail={thumbnail}
            />
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="h-24 w-full rounded-md border border-black transition-all duration-300 hover:bg-slate-800 hover:text-white"
          >
            Update Product
          </button>
          <button
            onClick={resetProductDetailsForm}
            className="rounded-md bg-red-500 p-2 text-white"
          >
            Update Another Product
          </button>
        </>
      )}
    </form>
  )
}

export default AddProduct
