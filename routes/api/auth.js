const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route       GET /api/auth
// @desc        Test route
// @access      Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

// @route       POST /api/auth
// @desc        Authentication user & get token
// @access      Public
router.post('/', [
    check('email', 'Masukkan email yang valid').isEmail(),
    check('password', 'Silahkan masukkan password 6 karakter atau lebih').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
        // Cari user berdasarkan email
        let user = await User.findOne({email});

        if(!user){
            // Jika user tidak terdaftar, kirimkan error
            return res.status(400).json({
                errors: [{
                    msg: 'Kredensial tidak valid'
                }]
            });
        } else {
            // Cek password
            const isMatch = bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({
                    errors: [{
                        msg: 'Kredensial tidak valid'
                    }]
                });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get('jwtToken'), {expiresIn: 360000}, (err, token) => {
                if(err) throw err;
                res.json({token});
            });
        }
    } catch (error) {
        // Jika terjadi error, kirimkan pesan error
        console.error(error.message);
        res.status(500).send('Server error');
    }
})
module.exports = router;