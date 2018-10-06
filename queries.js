const db = require('./db');

function getArtist(req, res, next) {
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

module.exports = {
  getArtist,
  getAlbum,
  getLatest,
}


