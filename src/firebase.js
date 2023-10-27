import {initializeApp} from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API,
    authDomain: "mern-estate-f2da2.firebaseapp.com",
    projectId: "mern-estate-f2da2",
    storageBucket: "mern-estate-f2da2.appspot.com",
    messagingSenderId: "352404679870",
    appId: "1:352404679870:web:f856cd9394bace43e982ef"
};

export const app = initializeApp(firebaseConfig);