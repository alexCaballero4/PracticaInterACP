const { uploadToPinata } = require('../utils/handleUploadIPFS');
const User = require('../models/User');
const { handleHttpError } = require('../utils/handleError');

const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return handleHttpError(res, 'No se ha proporcionado ningún archivo', 400);
    }

    const { buffer, originalname } = req.file;
    const userId = req.user.id;

    const pinataRes = await uploadToPinata(buffer, originalname);
    const ipfs = `${process.env.PINATA_GATEWAY_URL}/ipfs/${pinataRes.IpfsHash}`;

    const user = await User.findById(userId);
    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    user.logo = ipfs;
    await user.save();

    return res.status(200).json({ message: 'Logo actualizado correctamente', logo: ipfs });

  } catch (err) {
    console.error('Error al subir imagen:', err);
    return handleHttpError(res);
  }
};

module.exports = { updateLogo };
