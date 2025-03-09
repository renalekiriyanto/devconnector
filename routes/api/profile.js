const express = require('express');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const router = express.Router();

// @route       GET /api/profile/me
// @desc        Get logged in profile user
// @access      Authenticated
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg: 'User tidak memiliki profile'});
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;