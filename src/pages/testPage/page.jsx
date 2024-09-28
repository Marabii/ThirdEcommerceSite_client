import React, { useState } from 'react'
import axios from 'axios'
import convertCurrency from '../../utils/convertCurrency'
import { useEffect } from 'react'

const FileUpload = () => {
  const [files, setFiles] = useState([])

  useEffect(() => {
    const getCurrencyRate = async () => {
      const result = await convertCurrency(50)
      console.log(result)
    }

    getCurrencyRate()
  }, [])

  const handleFileChange = (e) => {
    setFiles([...e.target.files]) // Handle multiple file selection
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()

    files.forEach((file) => {
      console.log(file)
      formData.append('files', file) // Note the name 'files' for each file
    })

    try {
      const response = await axios.post(
        'http://localhost:3001/api/upload/additionalImages',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      console.log('Uploaded', response.data)
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }

  return (
    <div>
      <h2>Upload Files</h2>
      <form onSubmit={handleFileUpload}>
        <input type="file" multiple onChange={handleFileChange} />
        <button type="submit">Upload Files</button>
      </form>
    </div>
  )
}

export default FileUpload
