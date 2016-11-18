//dependencies
var express = require('express'); 
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var hash = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;
var mongoose = require('mongoose');

var User = require('./models/user.js');
var Perizia = require('./models/perizia.js');

// create instance of express 
var app = express();

// require routes
var routes = require('./routes/authenticate.js');

// mongoose
var database = require('./config/database.js');
mongoose.connect(database.url, function(err) {
    // if we failed to connect, abort
    if (err) throw err;

    // we connected ok
    createData();
});

app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('../client'));
app.use(logger('dev'));
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
app.use('/user/', routes);

app.get('/', function(req, res) {
    res.sendFile(path.join('client', 'index.html'));
});

// error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.end(JSON.stringify({
	message: err.message,
	error: {}
    }));
});

module.exports = app;

var debug = require('debug')('passport-mongo');
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

function createData(){
    Perizia.create(
	{
            CRIF: "000534567.05423",
            Data: new Date(2016, 5, 29),
            Indirizzo: "p.zza Nanna",
            N_civico: 88,
            Piano:2,
            Particella:1217,
            Tipologia_edilizia:"appartamento",
            Categoria:"A/3",
            Consistenza:6.5,
            RC:386.05,
            Foglio:107,
            SUPERFICIE_COMMERCIALE_MQ:96.35,
            Anno_di_costruzione:1968,
            Impianto_elettrico_Vetusta_anni:15,
            Impianto_idraulico_Vetusta_anni:15,
            Provincia: "BA",
            Comune: "Modugno",
            CAP: "70131",
            SUPERFICIE_COMMERCIALE_MQ: "200",
            Valore_di_mercato_del_lotto: "700000",
            balcone:"6",
            cantina:"22",
	    portico:"3"
	}
    )
};

Perizia.find({})
    .exec(function(err, games) {
	if (err) return done(err);
            //console.log('found %d games with name %s', games.length, games[0].SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE);
    });

function done(err) {
    if (err) console.error(err);
    Perizia.remove(function() {
        mongoose.disconnect();
    });
}

//app.get('/perizie/:CRIF', function(req, res) {
//    res.send({ping:'hello this is server and I have ' + req.params.CRIF});
//});
		       
//https://modernweb.com/2014/04/21/mean-stack-a-quick-start-guide/
