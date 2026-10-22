import * as mongo from 'mongodb';
import { Errors } from 'cs544-js-utils';
import * as Lib from './library.js';
type BookDoc = {
    _id: string;
    isbn: string;
    title: string;
    authors: string[];
    pages: number;
    year: number;
    publisher: string;
    nCopies: number;
};
type LendDoc = {
    isbn: string;
    patronId: string;
};
export declare function makeLibraryDao(dbUrl: string): Promise<Errors.Result<LibraryDao>>;
export declare class LibraryDao {
    client: mongo.MongoClient;
    books: mongo.Collection<BookDoc>;
    lends: mongo.Collection<LendDoc>;
    constructor(client: mongo.MongoClient, books: mongo.Collection<BookDoc>, lends: mongo.Collection<LendDoc>);
    static make(dbUrl: string): Promise<Errors.Result<LibraryDao>>;
    /** close off this DAO; implementing object is invalid after
     *  call to close()
     *
     *  Error Codes:
     *    DB: a database error was encountered.
     */
    close(): Promise<Errors.Result<void>>;
    clear(): Promise<Errors.Result<void>>;
    getBook(isbn: string): Promise<Errors.Result<Lib.XBook | undefined>>;
    addBook(book: Lib.XBook): Promise<Errors.Result<Lib.XBook>>;
    addCopies(isbn: string, nCopies: number): Promise<Errors.Result<Lib.XBook>>;
    findBooks(search: string, index: number, count: number): Promise<Errors.Result<Lib.XBook[]>>;
    countLends(isbn: string): Promise<Errors.Result<number>>;
    hasLend(isbn: string, patronId: string): Promise<Errors.Result<boolean>>;
    addLend(isbn: string, patronId: string): Promise<Errors.Result<void>>;
    removeLend(isbn: string, patronId: string): Promise<Errors.Result<void>>;
}
export {};
//# sourceMappingURL=library-dao.d.ts.map