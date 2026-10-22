import * as mongo from 'mongodb';
import { Errors } from 'cs544-js-utils';
export async function makeLibraryDao(dbUrl) {
    return await LibraryDao.make(dbUrl);
}
//options for new MongoClient()
const MONGO_OPTIONS = {
    ignoreUndefined: true, //ignore undefined fields in queries
};
export class LibraryDao {
    client;
    books;
    lends;
    //called by below static make() factory function with
    //parameters to be cached in this instance.
    constructor(client, books, lends) {
        this.client = client;
        this.books = books;
        this.lends = lends;
    }
    //static factory function; should do all async operations like
    //getting a connection and creating indexing.  Finally, it
    //should use the constructor to return an instance of this class.
    //returns error code DB on database errors.
    static async make(dbUrl) {
        try {
            const client = new mongo.MongoClient(dbUrl, MONGO_OPTIONS);
            await client.connect();
            const db = client.db();
            const books = db.collection('books');
            const lends = db.collection('lends');
            await books.createIndex({ title: 'text', authors: 'text' });
            return Errors.okResult(new LibraryDao(client, books, lends));
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
        try {
            await this.client.close();
            return Errors.VOID_RESULT;
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    async clear() {
        try {
            await this.books.deleteMany({});
            await this.lends.deleteMany({});
            return Errors.VOID_RESULT;
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    //add methods as per your API
    //returns undefined if there is no book with this isbn
    async getBook(isbn) {
        try {
            const doc = await this.books.findOne({ _id: isbn });
            return Errors.okResult(doc ? toXBook(doc) : undefined);
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    async addBook(book) {
        try {
            await this.books.insertOne({ _id: book.isbn, ...book });
            return Errors.okResult(book);
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    //adds nCopies to the book and returns the updated book
    async addCopies(isbn, nCopies) {
        try {
            const doc = await this.books.findOneAndUpdate({ _id: isbn }, { $inc: { nCopies } }, { returnDocument: mongo.ReturnDocument.AFTER });
            if (!doc) {
                return Errors.errResult(`no book with isbn ${isbn}`, { code: 'BAD_REQ', widget: 'isbn' });
            }
            return Errors.okResult(toXBook(doc));
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    //search is the words in quotes, like '"javascript" "flanagan"'
    async findBooks(search, index, count) {
        if (count === 0)
            return Errors.okResult([]);
        try {
            const docs = await this.books
                .find({ $text: { $search: search } })
                .sort({ title: 1 })
                .skip(index)
                .limit(count)
                .toArray();
            return Errors.okResult(docs.map(toXBook));
        }
        catch (e) {
            return Errors.errResult(e.message, 'DB');
        }
    }
    async countLends(isbn) {
        return Errors.errResult('TODO');
    }
    async hasLend(isbn, patronId) {
        return Errors.errResult('TODO');
    }
    async addLend(isbn, patronId) {
        return Errors.errResult('TODO');
    }
    async removeLend(isbn, patronId) {
        return Errors.errResult('TODO');
    }
} //class LibDao
function toXBook(doc) {
    const { _id, ...book } = doc;
    return book;
}
//# sourceMappingURL=library-dao.js.map