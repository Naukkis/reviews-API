if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const express     = require('express');
const path        = require('path');
const bodyParser  = require('body-parser');
const q = require('./queries');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('port', process.env.PORT || 3002);

app.use(express.static('public'));

app.get('/reviews/', (req, res) => {
    console.log("oujeaa");
    res.status(200);
});

app.get('/artists/', q.getArtists);
app.get('/albums/', q.getAlbums);
app.get('/artist/:name', q.getArtist);
app.get('/album/:name', q.getAlbum);
app.get('/latest/', q.getLatest);
app.get('/reviewer/:name', q.getReviewer);
app.post('/save-review/', q.saveReview);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});