'use strict';

require('./config');
var _CustomerUsers = require('./CustomerUsersRoute');
// const language = require('@google-cloud/language');
// const client = new language.LanguageServiceClient();
const express = require('express');
const app = express();

app.use('/CustomerUsers/', _CustomerUsers);

// Expose the API as a function
// exports.api = functions.https.onRequest(app);
