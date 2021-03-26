const verifyToken = {};
const jwt = require('jsonwebtoken');


verifyToken.verificarToken = async (req, res, next) => {

    try {
        let { authorization } = req.headers;
        
        const user = jwt.verify(authorization, 'secret_token');
        if(user){
            req.usu = user.data;
            next();
        }
    } catch (error) {
        return res.status(400).json({
            status: false,
            error
        });
    }
    //next();
}

module.exports = verifyToken;