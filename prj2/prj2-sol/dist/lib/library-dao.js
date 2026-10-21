import { Errors } from 'cs544-js-utils';
//TODO: define any DB specific types if necessary
export async function makeLibraryDao(dbUrl) {
    return await LibraryDao.make(dbUrl);
}
//options for new MongoClient()
const MONGO_OPTIONS = {
    ignoreUndefined: true, //ignore undefined fields in queries
};
export class LibraryDao {
    //called by below static make() factory function with
    //parameters to be cached in this instance.
    constructor(todo) {
    }
    //static factory function; should do all async operations like
    //getting a connection and creating indexing.  Finally, it
    //should use the constructor to return an instance of this class.
    //returns error code DB on database errors.
    static async make(dbUrl) {
        try {
            return Errors.okResult(new LibraryDao('TODO'));
        }
        catch (error) {
            return Errors.errResult(error.message, 'DB');
        }
    }
    /** close off this DAO; implementing object is invalid after
     *  call to close()
     *
     *  Error Codes:
     *    DB: a database error was encountered.
     */
    async close() {
        return Errors.errResult('TODO');
    }
} //class LibDao
//# sourceMappingURL=library-dao.js.map