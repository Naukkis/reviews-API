const express = require('express');
const q = require('../queries/queries');

const router = express.Router();

router.get('/artists/', q.getArtists);
router.get('/albums/', q.getAlbums);
router.get('/artist/:name', q.getArtist);
router.get('/album/:name', q.getAlbum);
router.get('/latest/', q.getLatest);
router.get('/reviewer/:name', q.getReviewer);
router.post('/save-review/', q.saveReview);

module.exports = router;