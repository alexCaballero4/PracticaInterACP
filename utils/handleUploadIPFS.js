const axios = require('axios');
const FormData = require('form-data');

const uploadToPinata = async (buffer, filename) => {
  const formData = new FormData();
  formData.append('file', buffer, filename);

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    maxBodyLength: 'Infinity',
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: process.env.PINATA_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET
    }
  });

  return res.data;
};

module.exports = { uploadToPinata };
