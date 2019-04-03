
// Node js data route routes/CustomerUsersRoute.js';
const express = require('express');

const router = express.Router();
const Controller = require('./CustomerUsersController');

router.get('/getList', Controller.getEntityList );
router.options('/getList', Controller.crossOrigin);

router.post('/add', Controller.createEntity);
router.options('/add', Controller.crossOrigin);

router.post('/delete', Controller.deleteEntity);
router.options('/delete', Controller.crossOrigin);

router.get('/getKey', Controller.getKey );
router.options('/getKey', Controller.crossOrigin);

module.exports = router;