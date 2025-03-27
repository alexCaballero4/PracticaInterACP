const handleHttpError = (res, message = 'Error interno del servidor', code = 500) => {
    return res.status(code).json({ message });
};

module.exports = { handleHttpError };
