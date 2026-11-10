const { initializeApp } = require('firebase-admin/app');

initializeApp();
Object.assign(exports, require('./callables'));
