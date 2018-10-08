const db = require('../db');
const uuid = require('uuid/v4');
const utils = require('../utils/utils');

function getArtist(req, res, next) {
    if(req.params.name) {
        db.one('select * \
           from artist \
           where name = $1', [req.params.name])
            .then(function(artist) {
                db.task('get-everything', t => {
                    return t.batch([
                        t.any('select * from album where artist = $1', [artist.id]),
                        t.any('select * from review where artist = $1', [artist.id])
                    ]);
                })
                    .then(data => {
                        res.status(200)
                            .json({
                                status: 'success',
                                artist: artist,
                                album: data[0],
                                reviews: data[1],
                                received_at: new Date(),
                                message: 'Retrieved artist with albums'
                            });
                    })
                    .catch(error => {
                        return next(error);
                    });
            })
            .catch(function(err) {
                return next(err);
            });
    } else {
        getArtists(req, res ,next);
    }

}

function getAlbum(req, res, next) {
  db.one('select * from album where name = $1', [req.params.name])
    .then(function(album) {
      db.task('get-everything', t => {
        return t.batch([
            t.any('select * from artist where id = $1', [album.artist]),
            t.any('select * from review where album = $1', [album.id])
        ]);
      })
      .then(data => {
        res.status(200)
        .json({
          status: 'success',
          album: album,
          artist: data[0],
          reviews: data[1],
          received_at: new Date(),
          message: 'Retrieved albums'
        });
      })
      .catch(error => {
        return next(error);
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getLatest(req, res, next) {
  db.any('select timestamp, r.id, r.text, al.name as album_name, ar.name as artist_name from review as r \
          join album as al on al.id = r.album \
          join artist as ar on ar.id = r.artist \
          order by timestamp desc')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          received_at: new Date(),
          message: 'Retrieved latest reviews'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAlbums(req, res, next) {
  db.any('select * from album')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          received_at: new Date(),
          message: 'Retrieved all albums'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getArtists(req, res, next) {
  db.any('select * from artist')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          received_at: new Date(),
          message: 'Retrieved all artists'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getReviewer(req, res, next) {
  db.any('select timestamp, r.id, r.text, al.name as album_name, ar.name as artist_name from review as r \
          join album as al on al.id = r.album \
          join artist as ar on ar.id = r.artist \
          where r.reviewer = $1\
          order by timestamp desc', [req.params.name])
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          received_at: new Date(),
          message: 'Retrieved latest reviews'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function saveReview(req, res, next) {
    console.log(req.body);
    db.task(t => {
        return t.oneOrNone('select username from users where token = $1', [req.body.token])
            .then(user => {
                console.log(user);
                if (user) {
                    db.none('insert into review values($1, $2, $3, $4, $5, $6)',
                        [
                            uuid(),
                            req.body.text,
                            req.body.album,
                            req.body.artist,
                            new Date(),
                            user.username
                        ])
                }
                return [];
            });
    })
      .then(function() {
        res.status(201)
          .json({
            status: 'success',
            received_at: new Date(),
            message: 'new review saved'
          });
      })
      .catch(function(err) {
        return next(err);
      });
}

function findBetween(req, res, next) {
    if (req.params.start.length != 8){
        errorResponse(res, req.params.start);
        return;
    }
    if(req.params.end.length != 8){
        errorResponse(res, req.params.end);
        return;
    }
    // format 20181224 to 2018-12-24
    let start = utils.formatDate(req.params.start);
    let end = utils.formatDate(req.params.end);

    db.any('select timestamp, r.id, r.text, al.name as album_name, ar.name as artist_name from review as r \
          join album as al on al.id = r.album \
          join artist as ar on ar.id = r.artist \
          where timestamp between $1 and $2 \
          order by timestamp desc', [start, end])
        .then(function(data) {
            res.status(200)
                .json({
                    status: 'success',
                    reviews: data,
                    received_at: new Date(),
                    message: ''
                });
        })
        .catch(function(err) {
            return next(err);
        });
}

function findBetweenFromReviewer(req, res, next) {
    const MAGIC_MAX_INTEGER = 50;
    if (invalidParametersLength(res, req.query.reviewer, MAGIC_MAX_INTEGER)
        || invalidDateParam(res, req.query.dates)) {
        return;
    }

    let reviewer = req.query.reviewer;
    let startDate = utils.formatDate(req.query.dates.slice(0,8));
    let endDate = utils.formatDate(req.query.dates.slice(9,17));
    db.any('select timestamp, r.id, r.text, al.name as album_name, ar.name as artist_name from review as r \
          join album as al on al.id = r.album \
          join artist as ar on ar.id = r.artist \
          where timestamp between $1 and $2 \
          and r.reviewer = $3 \
          order by timestamp desc', [startDate, endDate, reviewer])
        .then(function(data) {
            res.status(200)
                .json({
                    status: 'success',
                    reviews: data,
                    received_at: new Date(),
                    message: ''
                });
        })
        .catch(function(err) {
            return next(err);
        });
}

function invalidParametersLength(res, param, maxLength) {
    if(param.length < 1 || param.length > maxLength) {
        errorResponse(res, param);
        return true;
    }
    return false;
}

function invalidDateParam(res, date) {
    if (date.length != 17){
        errorResponse(res, date);
        return true;
    }
    return false;
}

function errorResponse(res, param) {
    return res.status(400)
        .json({
            status: 'failure',
            message: 'Invalid parameters: ' + param
        })
}

module.exports = {
  getArtist,
  getAlbum,
  getLatest,
  getReviewer,
  saveReview,
  getAlbums,
  getArtists,
  findBetween,
    findBetweenFromReviewer
};


