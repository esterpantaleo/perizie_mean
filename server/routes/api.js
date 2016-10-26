var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var path = require('path');

var User = require('../models/user.js');
var Perizia = require('../models/perizia.js');


router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      });
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({
        status: 'Registration successful!'
      });
    });
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      res.status(200).json({
        status: 'Login successful!'
      });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});

var Perizia = require('../models/perizia');
var fs = require('fs');
var PDFParser = require('pdf2json');

var uploadDestination = 'uploads';
var SPACE = "\u00a0"

const destination = function (req, file, cb) {
    cb(null, uploadDestination)
};

const filename= function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.originalname);
    //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
};

var storage = multer.diskStorage({ //multers disk storage settings
    destination, filename
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

var ubicazioneLines = [
	    {text:"Comune", jsonId:"Comune", skip:1},
	    {text:"Provincia", jsonId:"Provincia", skip:1},
	    {text:"CAP", jsonId:"CAP", skip:1},
	    {text:"Indirizzo", jsonId:"Indirizzo", skip:1},
	    {text:"N." + SPACE + "civico", jsonId:"N_civico", skip:1},
	    {text:"Interno", jsonId:"Interno", skip:1},
	    {text:"Scala", jsonId:"Scala", skip:1},
	    {text:"Piano", jsonId:"Piano", skip:1}
	];
	var relevantLines = [
	    {text:"Codice" + SPACE + "CRIF", jsonId:"CRIF", skip:1},
	    {text:"Data" + SPACE + "Evasione" + SPACE + "Perizia", jsonId:"Data_Evasione_Perizia", skip:1},
	    {text:"Descrizione" + SPACE + "unità" + SPACE + "di" + SPACE + "stima", jsonId:"Descrizione_unita_di_stima", skip:1},
	    {text:"Valore" + SPACE + "di" + SPACE + "mercato" + SPACE + "del" + SPACE + "lotto", jsonId:"Valore_di_mercato_del_lotto", skip:2},
	    {text:"Foglio" + SPACE + "di" + SPACE + "mappa", jsonId:"Foglio", skip:1},
	    {text:"Totale" + SPACE + "superficie" + SPACE+ "principale", jsonId:"Totale_superficie_principale", skip:2},
	    {text:"Impianto" + SPACE + "elettrico", jsonId:"Impianto_elettrico_Vetustà_(anni)", skip:2},
	    {text:"Impianto" + SPACE + "idraulico", jsonId:"Impianto_idraulico_Vetustà_(anni)", skip:2},
	    {text:"Tipologia" + SPACE + "edilizia" , jsonId:"Tipologia_edilizia", skip:1},
	    {text:"COMMERCIALE", jsonId:"SUPERFICIE_COMMERCIALE_MQ", skip:2},
	    {text:"Particella", jsonId:"Particella", skip:7},
	    {text:"Categoria", jsonId:"Categoria", skip:7},
	    {text:"Consistenza", jsonId:"Consistenza", skip:7},
	    {text:"RC", jsonId:"RC", skip:7},
	    {text:"Anno" + SPACE + "di" + SPACE + "costruzione", jsonId:"Anno_di_costruzione", skip:1}
	];
	var superficiLines = [
	    {text:"Descrizione", jsonId:"Descrizione", skip:1},
	    {text:"Misura_(mq)", jsonId:"Misura_mq", skip:1},
	    {text:"Rapporto_mercantile", jsonId:"Rapporto_mercantile", skip:1},
	    {text:"Sup_Rap", jsonId:"Sup_Rap", skip:1}
	];


var parseJsonDataArray = function(arr){
    
    str = '';
    var	jsonString = '';
    for (var i = 0; i < arr.length; i ++) {
	for (var j = 0; j < arr[i].Texts.length; j ++) {
	    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
	    if (str.lastIndexOf("COLLEGATE", 0) === 0){
		jsonString = jsonString + "SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE:\n[";
		j = j + 4;
		for (var h = 1; h < 20; h ++){
		    j = j + 1
		    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
		    if (str.lastIndexOf(h.toString() + ".", 0) === 0){
			jsonString = jsonString + "{";
			for (var w = 0; w < superficiLines.length; w ++){
			    j = j + 1;
			    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			    jsonString = jsonString + superficiLines[w].text + ":" + str + ",\n";
			}
			jsonString = jsonString + "},\n";
		    } else {
			jsonString = jsonString + "]\n";
			h = 20;
		    }
		}
	    } else if (str.lastIndexOf(SPACE + "UNITA'" + SPACE + "IMMOBILIARE", 0 ) === 0){
		j = j + 1
		str = decodeURIComponent(arr[i].Texts[j].R[0].T);
		if (str.lastIndexOf("UBICAZIONE", 0) === 0){
		    for (var w = 0; w < ubicazioneLines.length; w ++){
			j = j + 1;
			str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			if (str.lastIndexOf(ubicazioneLines[w].text, 0) === 0){
			    j = j + 1;
			    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			    jsonString = jsonString + ubicazioneLines[w].text + ":" + str + "\n";
			}
		    }
		}
	    } else {
		for (var w = 0; w < relevantLines.length; w ++){
		    if (str.lastIndexOf(relevantLines[w].text, 0) === 0){
			j = j + relevantLines[w].skip;
			jsonString = jsonString + relevantLines[w].jsonId+":" + decodeURIComponent(arr[i].Texts[j].R[0].T) + "\n";
			j = j - relevantLines[w].skip;
		    }
		}
	    }
	}
    }
    return jsonString;
}

router.post('/upload', function(req, res){
    
    upload(req, res, function(err){
	if(err){
	    res.json({error_code:1, err_desc:err});
            return;
	}

	// crea una nuova perizia 
	var laMiaPerizia = new Perizia({
	    CRIF: '123456789.4567890',
	    Valore_di_mercato_del_lotto: 90000,
	    Indirizzo: "piazza umberto"
	});
	laMiaPerizia.save();

	
        res.json({error_code:0, err_desc:null});
	var pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
        pdfParser.on("pdfParser_dataReady", pdfData => {
	    var jsonDataArray = JSON.parse(JSON.stringify(pdfData, null, '\t')).formImage.Pages;
	    var jsonString = parseJsonDataArray(jsonDataArray);	    	    
	    fs.writeFile(uploadDestination + path.sep + req.file.filename + ".txt", jsonString, function(err) {
		if(err) {
		    return console.log(err);
		}
		jsonDataArray = null;
	    });	    
	});
	
	pdfParser.loadPDF(uploadDestination + path.sep + req.file.filename);
    })
});

router.get('/perizie/:CRIF', function (req, res) {
	Perizia.findOne({ CRIF: req.params.CRIF },{}, function (err, per) {
	    if (err || !per) {
		res.render('error', {});
	    } else { 
		res.json(per);//get json data
            }
	});
});

module.exports = router;
