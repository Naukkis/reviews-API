const db = require('../db');
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(5);
const jwt = require("jsonwebtoken");

function registerUser(req, res, next) {
    if (!req.body.password || !req.body.username) {
        return next(new Error("Invalid input!"));
    }
    let user = {
        username: req.body.username,
        password: req.body.password
    }
    let token = jwt.sign({ data: user }, process.env.SECRET_KEY, {
        expiresIn: 60 * 60 * 24 * 30
    });
    const psw = bcrypt.hashSync(req.body.password, salt);
    db
        .none(
            "insert into users(username, password, token)" +
            "values($1, $2, $3)",
            [
                req.body.username,
                psw,
                token
            ]
        )
        .then(function() {
            res.status(200).json({
                status: "success",
                created_at: new Date(),
                message: "created new user",
                user: req.body.username,
                apiToken: token
            });
        })
        .catch(err => next(err));
}

function login(req, res, next) {
    let submittedPsw = req.body.password;
    db
        .one("select * from users where username = $1", [req.body.username])
        .then(function(data) {
            let verified = bcrypt.compareSync(submittedPsw, data.password);
            var token = jwt.sign({ data: data }, process.env.SECRET_KEY, {
                expiresIn: 60 * 60 * 24 * 30
            });
            if (verified) {
                delete data.password;
                res.status(200).json({
                    username: req.body.username,
                    userid: data.userid,
                    token: token,
                    login_at: new Date(),
                    message: "login successful"
                });
            } else {
                res.status(400).json({
                    message: "entered wrong password"
                });
            }
        })
        .catch(err => next(err));
}

module.exports = {
    registerUser,
    login
};