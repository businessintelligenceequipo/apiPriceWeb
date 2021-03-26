const verificaRol = {};

verificaRol.verificarRol = async (req, res, next) => {
    try {
        if (req.usu) {
            if (req.usu.rol === 'administrador' || 'Directivo') {
                next();
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'The user should be admin'
                });
            }
        }

    } catch (error) {
        return res.status(400).json({
            status: false,
            error
        });
    }
}

module.exports = verificaRol;