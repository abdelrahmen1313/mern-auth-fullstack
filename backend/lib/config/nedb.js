
import Datastore from '@seald-io/nedb';

export const TokenStore = new Datastore({
    filename : "./data/tokens.db",
    autoload : true
})