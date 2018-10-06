require('dotenv').config();
const q = require('./queries');

console.log(process.env.DATABASE_URL)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const express     = require('express');
const path        = require('path');
const bodyParser  = require('body-parser');

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

app.get('/artist/:name', q.getArtist);
app.get('/album/:name', q.getAlbum);
app.get('/latest/', q.getLatest);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});