if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
const express     = require('express');
const path        = require('path');
const bodyParser  = require('body-parser');


const auth = require('./routes/authentication');
const version1 = require('./routes/version1');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('port', process.env.PORT || 3002);

app.use(express.static('public'));

app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
});

app.use('/v1', version1);
app.use('/auth', auth);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});