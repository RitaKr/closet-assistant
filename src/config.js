import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,

    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,

    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,

    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,

    appId: process.env.REACT_APP_FIREBASE_APP_ID,

    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  
    
  };
  //console.log(firebaseConfig)
const app = initializeApp(firebaseConfig);
const weatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;
const clipdropApiKey = process.env.REACT_APP_CLIPDROP_API_KEY;
const imaggaApiKey = process.env.REACT_APP_IMAGGA_API_KEY;
const imaggaApiSecret = process.env.REACT_APP_IMAGGA_API_SECRET;

export{firebaseConfig, weatherApiKey, clipdropApiKey, app, imaggaApiKey, imaggaApiSecret}