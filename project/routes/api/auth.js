require("dotenv/config");
var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');

router.post("/auth", (req, res) => {
    const { email, password } = req.body;

    const data = fs.readFileSync('users.json', 'utf8');
    const users = JSON.parse(data);
    const user = users.find(usr => usr.email === email);

    if (!user) return res.status(400).json({ msg: 'User not found' });

    if(user.password != password) return res.status(400).json({ msg: 'Password is wrong' });
    else {
        const accessToken = jwt.sign(
            { id: user.id },
            process.env.JWT_ACCESS_TOKEN,
            {expiresIn: '24h'}
        );

        res.cookie('jwt', accessToken);
        res.redirect('/dashboard');
    }
});

router.get('/logout', function(req, res) {
    res.cookie('jwt', null);
    res.redirect('/');
});

module.exports = router;