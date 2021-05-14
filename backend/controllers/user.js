const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const User = require('../models/user');
const maskdata = require("maskdata");

const emailMask2Options = {
    maskWith: "*", 
    unmaskedStartCharactersBeforeAt: 1,
    unmaskedEndCharactersAfterAt: 2,
    maskAtTheRate: false
};

exports.signup = (req, res, next) => {
    const email = req.body.email
    const maskedEmail = maskdata.maskEmail2(email, emailMask2Options);
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email : maskedEmail,
                password : hash
            });
            user.save()
                .then( () => res.status(201).json({message: 'utilisateur créé !'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    const email = req.body.email
    const maskedEmail = maskdata.maskEmail2(email, emailMask2Options);

    User.findOne({email: maskedEmail}).then(user =>{
            if (!user){
                return res.status(401).json({error: 'Utilisateur non trouvé !'});
            }
   
    bcrypt.compare(req.body.password, user.password).then(valid => {
            if(!valid){
                return res.status(401).json({error: 'Mot de passe incorrect!'});
            }
            res.status(200).json({
                userId: user._id,
                    token: jwt.sign(
                    {userId : user._id},
                    'RANDOM_TOKEN_SECRET',
                    {expiresIn: '1h'}
                    )
            });
    })
    .catch(error => res.status(500).json({error}));
})
    .catch(error => res.status(500).json({error}));
};