var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var PDFParser = require('pdf2json');
var moment = require('moment');
const util = require('util'); 
var Nominatim = require('node-nominatim2');

var Perizia = require('../models/perizia');
var uploadDestination = 'uploads';
var SPACE = "\u00a0";
var options = {
    useragent: 'MyApp',
    referer: 'https://github.com/xbgmsharp/node-nominatim2',
    timeout: 1000
};
var nominatim = new Nominatim(options);

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

var ubicazioneLines = [{text:"Comune", jsonId:"Comune", skip:1},
	    {text:"Provincia", jsonId:"Provincia", skip:1},
	    {text:"CAP", jsonId:"CAP", skip:1},
	    {text:"Indirizzo", jsonId:"Indirizzo", skip:1},
	    {text:"N." + SPACE + "civico", jsonId:"N_civico", skip:1},
	    {text:"Interno", jsonId:"Interno", skip:1},
	    {text:"Scala", jsonId:"Scala", skip:1},
	    {text:"Piano", jsonId:"Piano", skip:1}
	];
	
var relevantLines = [
	    {text:"Codice" + SPACE + "CRIF", jsonId:"_id", skip:1},
	    {text:"Data" + SPACE + "Evasione" + SPACE + "Perizia", jsonId:"Data_Evasione_Perizia", skip:1, date: true},
	    {text:"Descrizione" + SPACE + "unità" + SPACE + "di" + SPACE + "stima", jsonId:"Descrizione_unita_di_stima", skip:1},
	    {text:"Valore" + SPACE + "di" + SPACE + "mercato" + SPACE + "del" + SPACE + "lotto", jsonId:"Valore_di_mercato_del_lotto", skip:2, number:true},
	    {text:"Foglio" + SPACE + "di" + SPACE + "mappa", jsonId:"Foglio", skip:1},
	    {text:"Totale" + SPACE + "superficie" + SPACE + "principale", jsonId:"Totale_superficie_principale", skip:2, number:true},
	    {text:"Impianto" + SPACE + "elettrico", jsonId:"Impianto_elettrico_anni", skip:2},
	    {text:"Impianto" + SPACE + "idraulico", jsonId:"Impianto_idraulico_anni", skip:2},
	    {text:"Tipologia" + SPACE + "edilizia" , jsonId:"Tipologia_edilizia", skip:1},
	    {text:"COMMERCIALE", jsonId:"SUPERFICIE_COMMERCIALE_MQ", skip:2, number:true},
	    {text:"Particella", jsonId:"Particella", skip:7},
	    {text:"Categoria", jsonId:"Categoria", skip:7},
	    {text:"Consistenza", jsonId:"Consistenza", skip:7, number:true},
	    {text:"RC", jsonId:"RC", skip:7, number:true},
	    {text:"Anno" + SPACE + "di" + SPACE + "costruzione", jsonId:"Anno_di_costruzione", skip:1}
	];
	
var superficiLines = [
	    {text:"Descrizione", jsonId:"Descrizione", skip:1},
	    {text:"Misura (mq)", jsonId:"Misura_mq", skip:1, number:true},
	    {text:"Rapporto mercantile", jsonId:"Rapporto_mercantile", skip:1, number:true},
	    {text:"Sup Rap", jsonId:"Sup_Rap", skip:1, number:true}
	];


var parseJsonPdf = function(arr){
    
    var str = '';
    var	jsonString = '{';
    for (var i = 0; i < arr.length; i ++) {
	for (var j = 0; j < arr[i].Texts.length; j ++) {
	    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
	    if (str.lastIndexOf('COLLEGATE', 0) === 0){
                
		jsonString = jsonString + '\"SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE\":\n[';
		j = j + 4;
		for (var h = 1; h < 20; h ++){
		    j = j + 1
		    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
		    if (str.lastIndexOf(h.toString() + '.', 0) === 0){
                        if (h != 1){
			    jsonString += ',';
			}
			jsonString = jsonString + '{';
			for (var w = 0; w < superficiLines.length; w ++){
			    j = j + 1;
			    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			    if (superficiLines[w].number){
                                str = str.replace('.','').replace(',','.');
			    }
			    jsonString = jsonString + '\"' + superficiLines[w].jsonId + '\":\"' + str + '\"';
                            if (w != superficiLines.length - 1) {
			        jsonString += ',';
			    }
			    jsonString += '\n';
			}
			jsonString += '}\n';
                        //jsonString = jsonString + '},\n';
		    } else {
			jsonString += '],\n';
			h = 20;
		    }
		}
	    } else if (str.lastIndexOf(SPACE + 'UNITA\'' + SPACE + 'IMMOBILIARE', 0 ) === 0){
		j = j + 1
		str = decodeURIComponent(arr[i].Texts[j].R[0].T);
		if (str.lastIndexOf('UBICAZIONE', 0) === 0){
		    for (var w = 0; w < ubicazioneLines.length; w ++){
			j = j + 1;
			str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			if (str.lastIndexOf(ubicazioneLines[w].text, 0) === 0){
			    j = j + 1;
			    str = decodeURIComponent(arr[i].Texts[j].R[0].T);
			    jsonString += '\"' + ubicazioneLines[w].jsonId + '\":\"' + str + '\",\n';
			}
		    }
		}
	    } else {
		for (var w = 0; w < relevantLines.length; w ++){
		    if (str.lastIndexOf(relevantLines[w].text, 0) === 0){
			j = j + relevantLines[w].skip;
                        var text = decodeURIComponent(arr[i].Texts[j].R[0].T);
                        //trasforma un numero in formato italiano in un numero in formato json standard
			//e.g. 1,23 -> 1.23
			if (relevantLines[w].number){
			    text = text.replace('.','').replace(',','.');
			} else if (relevantLines[w].date){
			    //trasforma una data in formato italiano dd/mm/yyyy in una data in formato json standard
			    text = moment(text, 'DD/MM/YYYY').format('MM/DD/YYYY');
			}
			
                        jsonString += '\"' + relevantLines[w].jsonId + '\":\"' + text + '\"';
			j = j - relevantLines[w].skip;
                        if (w != ubicazioneLines.length - 1) {
			    jsonString += ',';
			}
			jsonString += '\n';
		    } 
		}
	    }
	}
    }
    jsonString += '}';

    return jsonString;
}

router.post('/upload', function(req, res){
    
    upload(req, res, function(err){
	if (err){
	    res.json({error_code:1, err_desc:err});
            return;
	}
	
        res.json({error_code:0, err_desc:null});
	var pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
        pdfParser.on("pdfParser_dataReady", pdfData => {
	    var jsonPdf = JSON.parse(JSON.stringify(pdfData, null, '\t')).formImage.Pages;
	    var jsonString = parseJsonPdf(jsonPdf);	    	    
	    fs.writeFile(uploadDestination + path.sep + req.file.filename + '.txt', jsonString, function(errf) {
		if (errf) {
		    return console.log(errf);
		}
		jsonPdf = null;
	    });	    
            var jsonMongo = JSON.parse(jsonString);
            var indirizzo = jsonMongo.Indirizzo + " " + jsonMongo.N_civico + ", " + jsonMongo.Comune + ", " + jsonMongo.CAP + " " + jsonMongo.Provincia;
	    console.log(indirizzo);

            //usa Nominatim per ottenere longitudine e latitudine associateal luogo della perizia
	    var lat, lon;
	    //nominatim.search({q: "135 pilkington, avenue birmingham"}, function (err, res, data) {
	    nominatim.search({q: indirizzo}, function (errn, res, data) { 
		    if (errn) throw errn;
		    if (data[0] != undefined){
			jsonMongo.lat = util.inspect(data[0].lat);  
			jsonMongo.lon = util.inspect(data[0].lon); 
			console.log('lat: ' + jsonMongo.lat);  
			console.log('lon: ' + jsonMongo.lon);   
		    } else {
			var indirizzo2 = jsonMongo.Indirizzo + " " + jsonMongo.N_civico + ", " + jsonMongo.Comune + ", " + jsonMongo.Provincia; 
			nominatim.search({q: indirizzo2}, function (err2, res2, data2) {       
				if (err2) throw err2;    
				if (data2[0] == undefined) {
				    throw "L'indirizzo specificato nel file non è stato trovato. Modifica l'indirizzo e prova di nuovo a caricare il file. Inserisci le coordinate gps. Per trovare le cordinate GPS usa google maps, clicca con il tasto destro sulla posizione dell'immobile, cliacca su: cosa c'è qui. Esempio: inserisci \" 40.173288, 18.020035\"";
				} else {
				    jsonMongo.lat = util.inspect(data2[0].lat);
				    jsonMongo.lon = util.inspect(data2[0].lon);
				    console.log('lat2: ' + jsonMongo.lat);    
				    console.log('lon2: ' + jsonMongo.lon);
				}  
				});
			    } 
		});
	    console.log(jsonMongo);
            var uploadedPerizia = new Perizia(jsonMongo);
	    uploadedPerizia.save(function(errm) {
		    if (errm) {
                        //console.log(err.code);
                        if (errm.code === 11000){//duplicate key   
                            console.log(errm.message);
			    //res.send({message: 'La perizia ' + req.file.filename + ' è già presente nel database.'})
                            //req.flash('error', 'La perizia ' + req.file.filename + ' è già presente nel database.');
                            //res.redirect('/upload');
                            return;
                        } else {
			    console.log(errm);
                        }
		    } else {
			console.log('La perizia CRIF ' + req.file.filename + ' è stata salvata in mongo');
		    }
		});
	});
	
	pdfParser.loadPDF(uploadDestination + path.sep + req.file.filename);
    })
});

router.get('/upload/:CRIF', function (req, res) {
	Perizia.findOne({ CRIF: req.params.CRIF },{}, function (err, per) {
	    if (err || !per) {
		res.render('error', {});
	    } else { 
		res.json(per);//get json data
            }
	});
});

module.exports = router;
