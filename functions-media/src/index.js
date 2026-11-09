const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getStorage}=require('firebase-admin/storage');
const {onCall}=require('firebase-functions/v2/https');
const {defineString}=require('firebase-functions/params');
const {handleMedia}=require('./service');
initializeApp();const bucketName=defineString('CREATOR_MEDIA_BUCKET');
exports.creatorMedia=onCall({region:'asia-south1',timeoutSeconds:120,memory:'512MiB',maxInstances:3,serviceAccount:'creator-media@life-by-adichimp.iam.gserviceaccount.com'},request=>handleMedia(request,{db:getFirestore(),bucket:getStorage().bucket(bucketName.value())}));
