const express = require('express');
const q = require('../queries/queries');
const jwt = require("jsonwebtoken");

const router = express.Router();

// require apitoken for saving review
router.use('/save-review', function(req, res, next) {
    var token = req.body.token || req.headers['token'];
    if(token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
            if(err) {
                res.status(401).send("Invalid token");
            } else {
                next();
            }
        })
    } else {
        res.status(401).send("please send token");
    }
});

router.get('/artists/', q.getArtists);
router.get('/albums/', q.getAlbums);
router.get('/artists/client/', q.getArtist);
router.get('/artists/:name', q.getArtist);
router.get('/albums/:name', q.getAlbum);
router.get('/albums/id/:id', q.getAlbumById);
router.get('/latest/', q.getLatest);
router.get('/reviewer/:name', q.getReviewer);
router.get('/reviews/', q.findBetweenFromReviewer);
router.get('/reviews/between/:start-:end', q.findBetween);
router.post('/save-review/', q.saveReview);
router.delete('/reviews/:reviewid', q.deleteReview);
module.exports = router;