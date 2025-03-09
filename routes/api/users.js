const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// @route       POST /api/users
// @desc        Register user
// @access      Public
router.post('/', [
    check('name', 'Nama harus diisi').not().isEmpty(),
    check('email', 'Masukkan email yang valid').isEmail(),
    check('password', 'Silahkan masukkan password 6 karakter atau lebih').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        // Cari user berdasarkan email
        let user = await User.findOne({email});

        if(user){
            // Jika user sudah terdaftar, kirimkan error
            return res.status(400).json({
                errors: [{
                    msg: 'User  sudah terdaftar'
                }]
            });
        } else {
            // Jika user belum terdaftar, buat user baru
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({name, email, avatar, password});

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Simpan user ke database
            await user.save();

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