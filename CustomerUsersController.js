
// Node js Controller controllers/CustomerUsersController.js';

const dataModel = require('./CustomerUsersModel');
const dataModelBP = require('./BusinessPartnerModel');

exports.crossOrigin = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method == 'OPTIONS') res.send(JSON.stringify({'Result':'Options'}));
    else next();      
}

exports.createEntity = async function(req,res,next){

  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  var dataError = false;
  if(!req.body.data)            dataError.push({Type:'E', Message:'Request looking for .data array of records'});
  if(!req.body.data.length)     dataError.push({Type:'E', Message:'.data record array empty'});
  if(dataError.length > 0 )     { res.send(JSON.stringify(dataError)); return false; };

  var rec = req.body.data;

// check key values and also add fields that are not passed from frontend
  rec.forEach( (lsRecFields, index) => {

	lsRecFields.ZERR_BP_KEY = 'None';
	lsRecFields.ZERR_CUSNR = 'None';
	lsRecFields.ZERR_USER_TYPE = 'None';

	if(!lsRecFields.BP_KEY)  { lsRecFields.ZERR_BP_KEY = 'Error'; dataError = true; }
	if(!lsRecFields.CUSNR)  { lsRecFields.ZERR_CUSNR = 'Error'; dataError = true; }
	if(!lsRecFields.USER_TYPE)  { lsRecFields.ZERR_USER_TYPE = 'Error'; dataError = true; }
    }) //forEach
    if(dataError === true ){
        res.status(400);
        res.send(JSON.stringify(rec));
        return false;
    }

  var entities = [];
  var entities_del = [];

  rec.forEach(lsRecFields => {
        var ls_entity = {};
        if( lsRecFields.keyFld ){
            ls_entity.key = lsRecFields.keyFld;
        } else {
            ls_entity.key =  '';
        }
        ls_entity.data = lsRecFields;
        if(lsRecFields.DelInd === true){
            entities_del.push(lsRecFields);
            return true;
        }
		delete lsRecFields.ZERR_BP_KEY;
		delete lsRecFields.ZERR_CUSNR;
		delete lsRecFields.ZERR_USER_TYPE;
        delete ls_entity.data.keyFld;
        delete lsRecFields.NewInd;
        delete lsRecFields.DelInd;
        ls_entity.excludeFromIndexes = []; //do not index non key fields
        entities.push(ls_entity);
    })

    this.createCompletedPromise  = new Promise((resolve,reject) => {

        if(entities && entities.length > 0 ){
            dataModel.createEntity(entities,function(dataOut, error){
                if(error){
                    reject('Error during save: ' + error, null, {
                            type: 0,
                            title: 'Error',
                            message: 'Update Failed'
                        }
                    );
                } else{
                    resolve(dataOut);
                }
            })
        } 
    });
    this.deleteCompletedPromise  = new Promise((resolve,reject) => {
        if(entities_del && entities_del.length > 0 ){
            dataModel.deleteEntity(entities_del,function(dataOut, error){
                if(error){
                    reject('Error during save: ' + error, null, {
                        type: 0,
                        title: 'Error',
                        message: 'Update Failed'
                    })
                } else{
                    resolve(dataOut);
                }
            })
        }  else {
            // if no records to delete then resolve the promise
            resolve([{'msg':'no records to delete'}]);
        }  
    });
    Promise.all([this.createCompletedPromise,this.deleteCompletedPromise]).then(
         (results) => {
             var dataOut = [];
             if(results && results[0] && results[0].length > 0 )  //create log
                Array.prototype.push.apply(dataOut,results[0]);    

            if(results && results[1] && results[1].length > 0 )   //delete log
                Array.prototype.push.apply(dataOut,results[1]);           
            res.send(JSON.stringify(dataOut))
        }
    ).catch( ( errMessage ) => {
        console.log(errMessage);
    } 
    );
}

exports.getEntityList = async function(req,res,next){

  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  var filterArray = [];
  if(req.query.$filter){
    filterArray = JSON.parse(req.query.$filter);
  }

  var dataIn = {};
  dataModel.getEntityList(filterArray,function(outList, error){
      if(error || outList.length < 1){

        dataModelBP.getKey(function (keys,error) {
            if(error){
                res.send('Cannot get list : ' + error, null, {
                    type: 0,
                    title: 'Error',
                    message: 'List read failed'
                });
            }
            var entities = [];
            var ls_entity = {};
            var lsRecFields = {};
            lsRecFields.CUSNR = filterArray.filter( ls_rec => ( ls_rec.fname === 'CUSNR') )[0].filterValue;
            lsRecFields.USER_TYPE = filterArray.filter( ls_rec => ( ls_rec.fname === 'USER_TYPE') )[0].filterValue;
            lsRecFields.BP_KEY = keys[0].id;
            ls_entity.key = '';
            ls_entity.data = lsRecFields;
            entities.push(ls_entity);

            dataModel.createEntity(entities, function(){});

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([entities[0].data]));
                        
        });
        
      } else {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(outList));
      }
  });    
}

exports.getKey = async function(req,res,next){
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    dataModel.getKey(function(keys,error) {
        if(error){
            res.send('Cannot get list : ' + error, null, {
                type: 0,
                title: 'Error',
                message: 'key not generated'
            });
        } else{
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(keys[0]));
        }
    });
  }

exports.deleteEntity = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    var dataOutArr = [];
    var dataError = [];
    if(!req.body.data)            dataError.push({Type:'E', Message:'Request looking for .data array of records'});
    if(!req.body.data.length)     dataError.push({Type:'E', Message:'.data record array empty'});
    if(dataError.length > 0 )     { res.send(JSON.stringify(dataError)); return false; };

    var recToProcess = req.body.data.length;
    var recs = req.body.data;
    var entities = [];
        recs.forEach(lsRecFields => {
            if( lsRecFields.keyFld ){
                entities.push(lsRecFields);
            } else {
                lsRecFields.msg = 'Key missing';
            }
        })   
        if(entities.length === 0){
            res.send(JSON.stringify(recs));
            return;
        }
        dataModel.deleteEntity(entities,function(dataOut, error){
        if(error){
            res.send('Error during save: ' + error, null, {
                type: 0,
                title: 'Error',
                message: 'Update Failed'
            });
        } else{
            dataOutArr.push(dataOut);
            if ( entities.length === dataOutArr.length )
                res.send(JSON.stringify(dataOutArr));
        }
    });    
  }