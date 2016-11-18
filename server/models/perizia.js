var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Perizia = new Schema({
	CRIF: { type: Schema.ObjectId, ref:'CRIF' },//validate: /\S+/
    Data_Evasione_Perizia: Date/*,
    Valore_di_mercato_del_lotto:{ type: Number, min: 0 },
    Comune: { type: String, trim: true },
    Provincia: { type: String, trim: true },
    CAP: { type: Number, min: 0, max: 100000 },
    Indirizzo: { type: String, trim: true },
    N_civico: { type: String, trim: true },
    Interno: { type: String, trim: true },
    Scala: { type: String, trim: true },
    Piano: { type: String, trim: true },
    Particella: { type: Number, min: 0 },
    Categoria: String,
    Consistenza: { type: Number, min: 0 },
    RC: Number,
    Descrizione_unita_di_stima: String,
    Foglio: { type: Number, min: 0 },
    Tipologia_edilizia: String,
    Totale_superficie_principale: { type: Number, min: 0 },
    SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE: {
      Descrizione: String,
      Misura_mq: { type: Number, min: 0 },
      Rapporto_mercantile: Number,
      Sup_Rap: { type: Number, min: 0 },
     },
    SUPERFICIE_COMMERCIALE_MQ: { type: Number, min: 0 },
    Anno_di_costruzione: { type: Number, min: 0 },
    Impianto_elettrico_anni: { type: Number, min: 0 },
    Impianto_idraulico_anni: { type: Number, min: 0 } */
    });

module.exports =  mongoose.model('perizie', Perizia);
