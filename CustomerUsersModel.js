
// Node js data model models/CustomerUsersModel.js';
const kind = 'CustomerUsers';
const namespace = 'propmanage';
const {Datastore} = require('@google-cloud/datastore');


var projectId = process.env.PROJECT;
if( process.env.GOOGLE_CLOUD_PROJECT ){
    projectId = process.env.GOOGLE_CLOUD_PROJECT;
    console.log('CustomerUsersModel: Project ID ', projectId);
}

console.log('CustomerUsers: projectId', projectId);
const datastore = new Datastore({
    projectId: projectId,
    namespace: namespace
});
exports.createEntity = async function(dataIn, callback){
    console.log('Create', kind, namespace);
    dataIn.forEach(lsData => {
        if(lsData.key === ''){
            lsData.key = datastore.key({'namespace': namespace, 'path': [kind]})
        }
    })
//update and create new together
    await datastore.upsert(dataIn).then(function(dataResult){
        dataResult[0].mutationResults.forEach( ( lsDataResult, index) => {
            if(lsDataResult.key){
                dataIn[index].key = lsDataResult.key.path[0];
                dataIn[index].key.namespace = namespace;
                delete dataIn[index].key.idType;
                console.log(lsDataResult.key.path[0].id);
            }
        })
        var dataOut = [];
        dataIn.forEach(lsEntity => {
                var outRow = {};
                outRow =  lsEntity.data;
                outRow.keyFld = lsEntity.key;
                dataOut.push(outRow);
            }
        )      
        callback(dataOut, null);
    }).catch(function(error){
        console.log(error);
        callback(null, error.errmsg);
    });
}
exports.deleteEntity = function(QueryList, callback) {
      if(!QueryList) {
      }
      QueryList.forEach(lsEntity => {
          const keyFld = lsEntity.keyFld;
          datastore.delete(keyFld)
          .then(() => {
            console.log(`${kind} ${keyFld.id} deleted.`);
			  lsEntity.msg = 'Deleted';
            callback(lsEntity, null);
          })
          .catch(err => {
            console.error('ERROR:', err);
            callback(lsEntity, err);
          });          
        });
  }
 exports.getEntityList = function(filterArray, callback){
     const query = datastore.createQuery(kind);
     if(filterArray.length > 0){
         filterArray.forEach(lsFiters => {
             query.filter(lsFiters.fname, lsFiters.operator, lsFiters.filterValue);
         });
     }
     datastore.runQuery(query)        
         .then(results => {
         // console.log(JSON.stringify(results));
         const entities = results[0];
         const info = results[1];
         if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
             // If there are more results to retrieve, the end cursor is
             // automatically set on `info`. To get this value directly, access
             // the `endCursor` property.
             return runPageQuery(info.endCursor).then(results => {
                 // Concatenate entities
                 results[0] = entities.concat(results[0]);
                 return results;
             });
         }
        entities.forEach(lsEntity => {
            const keyFld = lsEntity[datastore.KEY];
            lsEntity.keyFld        = keyFld;
            lsEntity.ZERR_BP_KEY   = 'None';
            lsEntity.ZERR_CUSNR   = 'None';
            lsEntity.ZERR_USER_TYPE   = 'None';
            lsEntity.NewInd   = false;
            lsEntity.DelInd   = false;
            }
        )
        callback(entities,null);
    }).catch(function(error){
        callback(null, error);
    });    
}
exports.getKey = function(callback){
    var incompleteKey = datastore.key({'namespace': namespace, 'path': [kind]});
    datastore.allocateIds(incompleteKey, 1, (err, keys) => {
        if(err){
            callback(null,err);
        } else {
            callback(keys,null);
        }
    });
}