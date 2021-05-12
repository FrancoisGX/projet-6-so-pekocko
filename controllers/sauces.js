const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce =  (req,res,next) => {
    console.log(req.body)
    const saucesObject = JSON.parse(req.body.sauce);// On stocke les données envoyées par le front-end en les transformant en objet js
    delete saucesObject._id;// On supprime l'id généré automatiquement et envoyé par le front-end.
    const sauce = new Sauce({
      ...saucesObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
    });
    sauce.save()
      .then(() => res.status(201).json({message: 'Objet enregistré'}))
      .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req,res,next) => {
  let sauceObject = {};
  req.file ? (
    // Si la modification contient une image => Utilisation de l'opérateur ternaire comme structure conditionnelle.
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
      // On supprime l'ancienne image du serveur
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlinkSync(`images/${filename}`)
    }),
    sauceObject = {
      // On modifie les données et on ajoute la nouvelle image
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,})
      :(sauceObject = {...req.body});/*si l'image ne change pas*/
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject,_id: req.params.id})
      .then(() => res.status(200).json({message: 'Objet modifié'}))
      .catch(error => res.status(400).json({error}));
}

exports.deleteSauce = (req,res,next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce =>{
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`,() =>{
          Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({message: 'Objet supprimé'}))
      .catch(error => res.status(400).json({error}));
      })
    })
    .catch(error => res.status(500).json({error}));
};

exports.getOneSauce = (req,res,next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}));
}

exports.getAllSauce = (req,res,next) => {
  Sauce.find()
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
}

// Permet de "liker"ou "disliker" une sauce

exports.likeDislike = (req, res, next) => {
  // Pour la route READ = Ajout/suppression d'un like / dislike à une sauce

  if (req.body.like === 1) { // Si il s'agit d'un like
    Sauce.updateOne({_id: req.params.id}, {$push: {usersLiked: req.body.userId},$inc: {likes: +1}})
      .then(() => res.status(200).json({message: 'j\'aime ajouté !'}))
      .catch((error) => res.status(400).json({error}))
  }
  if (req.body.like === -1) {// Si il s'agit d'un Dislike
    Sauce.updateOne({_id: req.params.id}, {$push: {usersDisliked: req.body.userId},$inc: {dislikes: +1}})
      .then(() => res.status(200).json({message: 'je n\'aime pas ajouté !'}))
      .catch((error) => res.status(400).json({error}))
  }

  if (req.body.like === 0) {// Retirer like ou dislike
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        if(sauce.usersLiked.includes(req.body.userId)) { // Retirer like
          Sauce.updateOne({_id: req.params.id},{$pull:{usersLiked:req.body.userId},$inc:{likes:-1}})
          .then(() => res.status(200).json({message: 'Like retiré !'}))
          .catch((error) => res.status(400).json({error}))
        }
        if(sauce.usersDisliked.includes(req.body.userId)) {// Retirer dislike
          Sauce.updateOne({_id: req.params.id},{$pull:{usersDisliked:req.body.userId},$inc:{dislikes:-1}})
          .then(() => res.status(200).json({message: 'Dislike retiré !'}))
          .catch((error) => res.status(400).json({error}))
        }
      })
      .catch((error) => res.status(404).json({error}))
  }
}