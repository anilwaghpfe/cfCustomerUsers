var env = process.env.NODE_ENV || 'development';

var local_os = process.platform;

// if ( local_os === 'darwin'){ 
//     //mac os
//     export GOOGLE_APPLICATION_CREDENTIALS="config/StdTest2-6647419c2653.json"
// } else {
//     //windows os
//     $env:GOOGLE_APPLICATION_CREDENTIALS="config\StdTest2-6647419c2653.json"
// }

var config = require('./config.json');

if (env === 'development' || env === 'test' ) {
  var envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });

  process.env.GOOGLE_APPLICATION_CREDENTIALS = "config/StdTest2-6647419c2653.json";
  console.log("Env Set GOOGLE_APPLICATION_CREDENTIALS", process.env.GOOGLE_APPLICATION_CREDENTIALS );

} else {

  require('@google-cloud/debug-agent').start({allowExpressions: true});
  // run in cloud console root gcloud debug source gen-repo-info-file
  
  var envConfig = config["qat"];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
  
}

