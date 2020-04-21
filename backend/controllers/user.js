exports.createUser = (req, res, next) => {
    res.json({
        user: {
            name: "Simo",
            password: "secret"
        }
    })
}

exports.userLogin = (req, res, next) => {
    res.json({
        msg: "this is login message"
    })
}