import React, { useState, useEffect } from "react";

function App() {
    const [uploadUrl, setUploadUrl] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const handleChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
  
        // Use FileReader to read the file and display it
        const reader = new FileReader();
        reader.onload = (e) => {
          // Set the loaded file's data URL as the imagePreview state
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    const setCloudFlareUploadURL = async () => {
      const result = await fetch("/api/getuploadurl", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
      })
      const response = await result.json(); // Parse the JSON response body
      if (response.uploadURL) {
        setUploadUrl(response.uploadURL);
      }
    }

    useEffect(() => {
      setCloudFlareUploadURL();
    }, []); // The empty array ensures this effect runs only once

    const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      await setCloudFlareUploadURL(); // Make sure storeImage has already set the new upload URL in state
      if (!uploadUrl) {
        console.log('No upload URL');
        return; // Exit if there's no upload URL
      }

      const formData = new FormData();
      if (event.target.file.files.length > 0) {
        const file = event.target.file.files[0];
        formData.append('file', file);
      } else {
        console.log('No file selected');
        return; // Exit the function if no file is selected
      }
      console.log('Preparing to upload file...');
      try {
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData, // Send the form data as the request body
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Upload successful, image public url:', data.result.variants[0]);

  
      } catch (error) {
        console.error('Upload failed:', error);
      }
    };

    return (
      <div>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <input type="file" id="myFile" name="file" onChange={handleChange} />
          <input type="text" id="textInput" name="textInput" placeholder="Enter text here" />
          <input type="submit" />
        </form>
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
      </div>
      
    
    );
}
 
export default App;