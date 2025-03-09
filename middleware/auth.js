const jwt = require('jsonwebtoken');
const config = require('config')

module.exports = function(req, res, next){
    // get token from header
    const token = req.header('x-auth-token');

    // check not token
    if(!token) return res.status(401).send('Access denied. No token provided.');

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}