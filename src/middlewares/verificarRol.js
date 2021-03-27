const verificaRol = {};

verificaRol.verificarRolDirectivo = async (req, res, next) => {
    try {
        if (req.usu) {
            if (req.usu.rol ===  3) {
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

verificaRol.verificarRolAdministrador = async (req, res, next) => {
    try {
        if (req.usu) {
            if (req.usu.rol === 1 ) {
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