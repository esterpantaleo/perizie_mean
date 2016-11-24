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

//data needed by openstreemaps
var options = {
    useragent: 'MyApp',
    referer: 'https://github.com/xbgmsharp/node-nominatim2',
    timeout: 1000
};
var nominatim = new Nominatim(options);

var uploadDestination = 'uploads';
var SPACE = "\u00a0";
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

var salvaPerizia = function (json){    
    console.log("salvo la perizia");
    var uploadedPerizia = new Perizia(json);
    uploadedPerizia.save(function(err) {
	    if (err) {
		//console.log(err.code); 
		if (err.code === 11000){//duplicate key
		    console.log(err.message);
		    return;
		} else {
		    console.log(err);
		}
	    } else {
		console.log('La perizia CRIF ' + json.Nome_File + ' è stata salvata in mongo');
	    }
	});
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
			jsonMongo.Nome_File = req.file.filename;
			//salvaPerizia(jsonMongo);

			//usa Nominatim per ottenere longitudine e latitudine associate al luogo della perizia 
			//quindi salva la perizia in mongo                               
			var indirizzo = jsonMongo.Indirizzo + " " + jsonMongo.N_civico + ", " + jsonMongo.Comune + ", " + jsonMongo.Provincia + ", " + jsonMongo.CAP;
			nominatim.search({q: indirizzo}, function (err, res, data) {
				console.log(indirizzo);
				if (err) {
				    throw err;
				}
				var loc = new Array();
                                if (data != undefined && data[0] != undefined){
                                    loc = [data[0].lon, data[0].lat];
				    jsonMongo.loc = loc;  
				    salvaPerizia(jsonMongo);
				} else {
				    var indirizzo2 = jsonMongo.Indirizzo + " " + jsonMongo.N_civico + ", " + jsonMongo.Comune + ", " + jsonMongo.Provincia;
                                    console.log(indirizzo2);
				    nominatim.search({q: indirizzo2}, function (err2, res2, data2) {
                                            if (err2) {
						throw err2;
					    }
                                            if (data2 != undefined && data2[0] != undefined) {
                                                loc = [data2[0].lon, data2[0].lat];
						jsonMongo.loc = loc;
						salvaPerizia(jsonMongo);      
                                            } else {
						salvaPerizia(jsonMongo); 
					    }
                                        });
				}
			    });
		    });
		pdfParser.loadPDF(uploadDestination + path.sep + req.file.filename);
	    })
	    });

router.get('/id/:_id', function (req, res) {
	Perizia.findOne({ CRIF: req.params._id }, function (err, perizia) {
		if (err || !perizia) {
		    res.render('error', {});
		} else { 
		    res.json(perizia);//get json data
		    console.log(perizia);
		}
	    });
    });

router.get('/file/:Nome_File', function (req, res) {
	Perizia.findOne({ Nome_File: req.params.Nome_File }, function (err, perizia){
		console.log("la perizia: " + perizia + ".");
		if (err || !perizia || perizia == null) {
		    res.render('error', {});      
		} else {     
		    res.json(perizia);//get json data
		} 
	    });     
    });

//need req.query.limit, req.query.DISTANZA, req.query.loc
router.get('/distanza/:DISTANZA/limite/:limite/data_min/:DATA_MIN/indirizzo/:indirizzo', function (req, res) {
	console.log('distanza=' + req.params.DISTANZA + ' limite =' + req.params.limite + ' indirizzo=' + req.params.indirizzo);
	// convert the distance to radians                                    
	// the radius of Earth is approximately 6371 kilometers
        var maxDistance = req.params.DISTANZA * 100 / 111.2;

	nominatim.search({q: req.params.indirizzo}, function (err, resp, data) {
		console.log(req.params.indirizzo);
		if (err) {
		    throw err;
		}
		console.log(data);
		if (data != undefined && data[0] != undefined){
		    var loc = new Array();
		    loc = [data[0].lon, data[0].lat];
		    Perizia.find({ 'loc': { $near: loc, $maxDistance: maxDistance }, "Data_Evasione_Perizia": {'$gt': req.params.DATA_MIN }})
			.limit(Number(req.params.limite))
			.exec(function(err, perizie) {
				if (err) {
				    return res.json(err);
				}
				console.log('perizie ' + perizie);				console.log(perizie.length);
				res.json(perizie);
			    });
		}
	    });
    })
    
 module.exports = router;
