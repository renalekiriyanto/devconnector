const express = require('express');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const { compare } = require('bcryptjs');

// @route       POST /api/profile
// @desc        Create profile logged in user
// @access      Authenticated
router.post('/', auth, [
    check('status', 'Status harus diisi').not().isEmpty(),
    check('skills', 'Skill harus diisi').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors) return res.status(400).json({errors: errors.array()});

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

    //   build profile
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // social object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube
    if(twitter) profileFields.social.twitter = twitter
    if(facebook) profileFields.social.facebook = facebook
    if(linkedin) profileFields.social.linkedin = linkedin
    if(instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({user: req.user.id});

        if(profile){
            // update profile
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {
                new: true
            });

            return res.json(profile);
        } else {
            // create profile
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        }
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

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

// @route       GET /api/profile
// @desc        Get all profile
// @access      Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

// @route       GET /api/user/:user_id
// @desc        Get profile by id
// @access      Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({msg: 'Profile tidak ditemukan'});
        
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

// @route       DELETE /api/profile
// @desc        Delete user logged in
// @access      Private
router.delete('/', auth, async (req, res) => {
    try {
        // remove posts
        // remove profile
        await Profile.findOneAndDelete({user: req.user.id});
        // remove user
        await User.findOneAndDelete({_id: req.user.id});

        res.json({msg: 'User berhasil dihapus'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
        // res.status(500).send('Server error');
    }
})

module.exports = router;