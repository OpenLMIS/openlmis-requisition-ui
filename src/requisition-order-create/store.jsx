/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

import { configureStore} from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'
import { combineReducers } from "redux";
import { persistStore, persistReducer } from 'redux-persist'
import orderReducer from "./reducers/orders.reducer";

const reducers = combineReducers({
    orders: orderReducer
});

const persistConfig = {
    key: 'requisition',
    storage
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: persistedReducer
});

export default () => {
    return {
        store: store,
        persistor: persistStore(store)
    }
}
