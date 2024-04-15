
const { app } = require('@azure/functions');
const axios = require('axios');
const FormData = require('form-data');
app.http('validateCloudFlare', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'validate',
  handler: async (request, context) => {
    try {
      const response = await axios.get('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, // Replace with secure token access
          'Content-Type': 'application/json'
        }
      });
      // Process the response from CloudFlare API
      if (response.data && response.data.success) {
        // Token is valid, proceed with your logic
        return {
          success: true,
          message: 'CloudFlare token validated successfully.'
        };
      } else {
        // Token is invalid or verification failed
        return {
          success: false,
          message: 'Failed to validate CloudFlare token.'
        };
      }
    } catch (error) {
      // Handle potential errors
      console.error('Error validating CloudFlare token:', error);
      return {
        success: false,
        message: 'An error occurred during CloudFlare token validation.'
      };
    }
  },
});

app.http('uploadImageToCloudFlare', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (request, context) => {
  const body = await request.json();
  const imageUrl = body.imageUrl;
  console.log(imageUrl);
  console.log("Here");
  if (!imageUrl) {
      console.log("No imageURL");
      return {
      success: false,
      message: 'No image URL provided.'
      };
  }


  console.log("Have imageURL");
  const formData = new FormData();
  formData.append('url', imageUrl);
  formData.append('metadata', JSON.stringify({ key: 'value' }));
  formData.append('requireSignedURLs', 'false');

  try {
      const response = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`, formData, {
      headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, // Replace <API_TOKEN> with your actual Cloudflare API token
      },
      });

      // Process the response from CloudFlare
      if (response.data && response.data.success) {
      // Image upload was successful
      return {
          jsonBody: {
              success: true,
              message: 'Image uploaded successfully to CloudFlare.',
              imageURL: response.data.result.variants[0]
          }
      };
      } else {
      // Upload failed
      return {
          success: false,
          message: 'Failed to upload image to CloudFlare.'
      };
      }
  } catch (error) {
      // Handle potential errors
      console.error('Error uploading image to CloudFlare:', error);
      return {
      success: false,
      message: 'An error occurred during image upload to CloudFlare.'
      };
  }
  },
});


app.http('obtainCloudFlareUploadURL', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'getuploadurl',
  handler: async (request, context) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`;
    const formData = new FormData();
    formData.append('metadata', JSON.stringify({ key: 'value' }));
    formData.append('requireSignedURLs', 'false');

    try {
      const response = await axios.post(url, formData, {
      headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 
      },
      });

      if (response.statusText !== "OK") {
        console.log(response);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(response.data);
      const uploadURL = await response.data.result.uploadURL; 
      console.log('Upload successful:', uploadURL);
      return {
        jsonBody: {uploadURL: uploadURL}
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        message: `An error occurred during the image upload: ${error.message}`
      };
    }
  },
});