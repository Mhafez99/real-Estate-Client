import {combineReducers, configureStore} from "@reduxjs/toolkit";
import useReducer from "./users/userSlice";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import {persistStore} from "redux-persist";

const rootReducer = combineReducers({user: useReducer});

const persistConfig = {
    key: "root",
    storage,
    version: 1
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});


export const persistor = persistStore(store);