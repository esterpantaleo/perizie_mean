var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var periziaSchema = new Schema({
    CRIF: {type : Schema.ObjectId, ref:'CRIF'},
    Data_Evasione_Perizia: Date,
    Valore_di_mercato_del_lotto: Number,
    Comune: String,
    Provincia: String,
    CAP: Number,
    Indirizzo: String,
    N_civico: String,
    Interno: String,
    Scala: String,
    Piano: String,
    Particella: Number,
    Categoria: String,
    Consistenza: Number,
    RC: Number,
    Descrizione_unita_di_stima: String,
    Foglio: Number,
    Tipologia_edilizia: String,
    Totale_superficie_principale: Number,
    SUPERFICI_SECONDARIE_ANNESSE_E_COLLEGATE:
    [{Descrizione: String,
      Misura_mq: Number,
      Rapporto_mercantile: Number,
      Sup_Rap: Number
     }],
    SUPERFICIE_COMMERCIALE_MQ: Number,
    Anno_di_costruzione:Number,
    Impianto_elettrico_anni:Number,
    Impianto_idraulico_anni:Number
},{
    collection: "perizie"
});

var Perizia =  mongoose.model('Perizia', periziaSchema);  
module.exports = Perizia;
