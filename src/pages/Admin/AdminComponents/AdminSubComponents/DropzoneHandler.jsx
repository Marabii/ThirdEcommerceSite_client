import { useDropzone } from 'react-dropzone'
import { useCallback, useEffect } from 'react'
import { ImagePlus, X } from 'lucide-react'
import axiosInstance from '../../../../utils/verifyJWT'

const DropzoneHandler = ({
  images,
  setImages,
  thumbnail,
  setThumbnail,
  setHasThumbnailChanged,
  setHaveImagesChanged
}) => {
  // Handle image drop for additional images
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 3) {
      alert('You can only upload up to 3 images')
      setImages([])
    } else {
      setHaveImagesChanged(true)
      setImages((prev) => [
        ...prev,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      ])
    }
  }, [])

  // Handle dropzone for images
  const useDropZoneImages = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true
  })

  const getRootPropsImages = useDropZoneImages.getRootProps
  const getInputPropsImages = useDropZoneImages.getInputProps

  // Handle thumbnail drop
  const useDropZoneThumbnail = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setHasThumbnailChanged(true)
      setThumbnail(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      )
    }
  })

  const getRootPropsThumbnail = useDropZoneThumbnail.getRootProps
  const getInputPropsThumbnail = useDropZoneThumbnail.getInputProps

  // Cleanup file object URLs
  useEffect(() => {
    return () => {
      images.forEach((file) => URL.revokeObjectURL(file.preview))
      thumbnail.forEach((file) => URL.revokeObjectURL(file.preview))
    }
  }, [images, thumbnail])

  // Handle image display (URLs or file previews)
  const renderImagePreview = (image) => {
    if (typeof image === 'string') {
      // Image is a valid URL
      return <img src={image} className="size-28" />
    } else {
      // Image is a file preview
      return <img src={image.preview} className="size-28" />
    }
  }

  const deleteProductImage = async (fileName) => {
    if (fileName.includes('products')) setHasThumbnailChanged(true)
    if (fileName.includes('additionalImages')) setHaveImagesChanged(true)
    console.log('deleting image: ', fileName)
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_SERVER}/api/deleteItem`,
        {
          data: { fileName }
        }
      )
    } catch (e) {
      console.error('something went wrong: ', e)
    }
  }

  // Thumbnails for additional images
  const thumbsForImages = images.map((file, index) => (
    <div key={file.name || index} className="my-10">
      <div className="relative flex w-fit gap-2 rounded-md border-2 border-black p-2 align-top">
        {renderImagePreview(file)}
        <X
          size={20}
          className="absolute right-1 top-1 box-content cursor-pointer rounded-full bg-red-600 stroke-white p-1"
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this image?')) {
              if (file instanceof File) {
                // If it's a file object, remove it from state
                setImages((prev) =>
                  prev.filter(
                    (image) => image.name !== file.name && image !== file
                  )
                )
              } else {
                // If it's a URL, extract the file path and delete it from the server
                const fileName = file.split(
                  `${import.meta.env.VITE_REACT_APP_BUCKETNAME}/`
                )[1]
                await deleteProductImage(fileName)
                setImages(
                  (prev) => prev.filter((image) => image !== file) // Remove from the state after deletion
                )
              }
            }
          }}
        />
      </div>
    </div>
  ))

  // Thumbnails for main thumbnail
  const thumbsForThumbnail = thumbnail.map((file, index) => (
    <div key={file.name || index} className="my-10">
      <div className="relative flex w-fit gap-2 rounded-md border-2 border-black p-2 align-top">
        {renderImagePreview(file)}
        <X
          size={20}
          className="absolute right-1 top-1 box-content cursor-pointer rounded-full bg-red-600 stroke-white p-1"
          onClick={async () => {
            if (
              window.confirm('Are you sure you want to delete this thumbnail?')
            ) {
              if (file instanceof File) {
                // If it's a file object, remove it from state
                setThumbnail((prev) =>
                  prev.filter(
                    (image) => image.name !== file.name && image !== file
                  )
                )
              } else {
                // If it's a URL, extract the file path and delete it from the server
                const fileName = file.split(
                  `${import.meta.env.VITE_REACT_APP_BUCKETNAME}/`
                )[1]
                await deleteProductImage(fileName)
                setThumbnail(
                  (prev) => prev.filter((image) => image !== file) // Remove from the state after deletion
                )
              }
            }
          }}
        />
      </div>
    </div>
  ))

  return (
    <>
      <div>
        <label
          className="my-5 block text-lg font-semibold"
          htmlFor="dropzone-file"
        >
          Upload Thumbnail Image
        </label>
        <section
          htmlFor="dropzone-file"
          className="container rounded-md border border-black"
        >
          <div
            {...getRootPropsThumbnail({ className: 'dropzone' })}
            className="grid h-[200px] w-full place-items-center"
          >
            <div className="flex cursor-pointer flex-col items-center gap-5">
              <input {...getInputPropsThumbnail()} />
              <ImagePlus size={40} />
              <p>
                Drag and drop a thumbnail image, or click to select it from your
                computer
              </p>
            </div>
          </div>
          <aside className="flex w-full flex-grow flex-wrap justify-center gap-5">
            {thumbsForThumbnail}
          </aside>
        </section>
      </div>

      <div>
        <label
          className="my-5 block text-lg font-semibold"
          htmlFor="dropzone-file"
        >
          Upload up to 3 additional images
        </label>
        <section
          htmlFor="dropzone-file"
          className="container rounded-md border border-black"
        >
          <div
            {...getRootPropsImages({ className: 'dropzone' })}
            className="grid h-[200px] w-full place-items-center"
          >
            <div className="flex cursor-pointer flex-col items-center gap-5">
              <input {...getInputPropsImages()} />
              <ImagePlus size={40} />
              <p>
                Drag and drop some images, or click to select them from your
                computer
              </p>
            </div>
          </div>
          <aside className="flex w-full flex-grow flex-wrap justify-center gap-5">
            {thumbsForImages}
          </aside>
        </section>
      </div>
    </>
  )
}

export default DropzoneHandler
