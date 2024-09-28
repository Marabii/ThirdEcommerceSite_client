import axiosInstance from '../../../../utils/verifyJWT'

const UploadData = ({
  productDetailsForm,
  setProductDetailsForm,
  thumbnail,
  setThumbnail,
  images,
  setImages
}) => {
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

  const deleteProductImage = async (fileName) => {
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_SERVER}/api/deleteItem`,
        {
          fileName
        }
      )
    } catch (e) {
      console.error('something went wrong: ', e)
    }
  }

  const validateForm = () => {
    const {
      name,
      price,
      stock,
      category,
      description,
      delivery,
      productDetails
    } = productDetailsForm

    if (
      !name ||
      !price ||
      !stock ||
      !category ||
      !description ||
      !delivery ||
      !productDetails
    ) {
      alert('Please fill in all the required fields')
      return false
    }

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return false
    }

    if (isNaN(stock) || stock < 0) {
      alert('Please enter a valid stock quantity')
      return false
    }

    if (!thumbnail || thumbnail.length === 0) {
      alert('Please upload a thumbnail image')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate the form
    if (!validateForm()) {
      return
    }

    // Destructure values from productDetailsForm
    const {
      name,
      price,
      stock,
      category,
      newCategory,
      description,
      delivery,
      specification,
      materials,
      productDetails,
      tags
    } = productDetailsForm

    const finalCategory = category === 'new-category' ? newCategory : category

    try {
      // Handle the thumbnail upload
      const thumbnailLink = await handleThumbnailUpload()
      if (!thumbnailLink) return

      // Handle the additional images upload
      const additionalImages = await handleAdditionalImages()

      // Prepare data to send in JSON format
      const productData = {
        name,
        price,
        stock,
        category: finalCategory, // Use the final category here
        description,
        delivery,
        productDetails,
        specification,
        materials: materials.map((m) => m.trim()).filter((m) => m !== ''),
        tags: tags.map((tag) => tag.trim()).filter((tag) => tag !== ''),
        productThumbnail: thumbnailLink,
        additionalImages
      }

      console.log

      // Send product data to the server as JSON
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_SERVER}/api/addProduct`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Product added successfully:', response.data)

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

      // Show success message
      alert('Product added successfully!')
    } catch (error) {
      // Clean up in case of an error
      await deleteProductImage(`assets/products/${thumbnail[0].name}`)
      for (const image of images) {
        await deleteProductImage(`assets/additionalImages/${image.name}`)
      }

      console.error('Error:', error)
      alert('Failed to add product. Please try again.')
    }
  }

  return {
    handleSubmit
  }
}

export default UploadData
