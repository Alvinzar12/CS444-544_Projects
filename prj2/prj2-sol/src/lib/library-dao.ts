import * as mongo from 'mongodb';

import { Errors } from 'cs544-js-utils';

import * as Lib from './library.js';

//books: one document per book, with _id set to the isbn.
//lends: one document per checked out book.
type BookDoc = {
  _id: string,
  isbn: string,
  title: string,
  authors: string[],
  pages: number,
  year: number,
  publisher: string,
  nCopies: number,
};

type LendDoc = {
  isbn: string,
  patronId: string,
};

export async function makeLibraryDao(dbUrl: string) {
  return await LibraryDao.make(dbUrl);
}

//options for new MongoClient()
const MONGO_OPTIONS = {
  ignoreUndefined: true,  //ignore undefined fields in queries
};


export class LibraryDao {

  client: mongo.MongoClient;
  books: mongo.Collection<BookDoc>;
  lends: mongo.Collection<LendDoc>;

  //called by below static make() factory function with
  //parameters to be cached in this instance.
  constructor(client: mongo.MongoClient,
              books: mongo.Collection<BookDoc>,
              lends: mongo.Collection<LendDoc>) {
    this.client = client;
    this.books = books;
    this.lends = lends;
  }

  //static factory function; should do all async operations like
  //getting a connection and creating indexing.  Finally, it
  //should use the constructor to return an instance of this class.
  //returns error code DB on database errors.
  static async make(dbUrl: string) : Promise<Errors.Result<LibraryDao>> {
    try {
      const client = new mongo.MongoClient(dbUrl, MONGO_OPTIONS);
      await client.connect();
      const db = client.db();
      const books = db.collection<BookDoc>('books');
      const lends = db.collection<LendDoc>('lends');
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
  async close() : Promise<Errors.Result<void>> {
    try {
      await this.client.close();
      return Errors.VOID_RESULT;
    }
    catch (e) {
      return Errors.errResult(e.message, 'DB');
    }
  }

  async clear() : Promise<Errors.Result<void>> {
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
  async getBook(isbn: string) : Promise<Errors.Result<Lib.XBook|undefined>> {
    return Errors.errResult('TODO');
  }

  async addBook(book: Lib.XBook) : Promise<Errors.Result<Lib.XBook>> {
    return Errors.errResult('TODO');
  }

  //adds nCopies to the book and returns the updated book
  async addCopies(isbn: string, nCopies: number)
    : Promise<Errors.Result<Lib.XBook>>
  {
    return Errors.errResult('TODO');
  }

  //search is the words in quotes, like '"javascript" "flanagan"'
  async findBooks(search: string, index: number, count: number)
    : Promise<Errors.Result<Lib.XBook[]>>
  {
    return Errors.errResult('TODO');
  }

  async countLends(isbn: string) : Promise<Errors.Result<number>> {
    return Errors.errResult('TODO');
  }

  async hasLend(isbn: string, patronId: string)
    : Promise<Errors.Result<boolean>>
  {
    return Errors.errResult('TODO');
  }

  async addLend(isbn: string, patronId: string)
    : Promise<Errors.Result<void>>
  {
    return Errors.errResult('TODO');
  }

  async removeLend(isbn: string, patronId: string)
    : Promise<Errors.Result<void>>
  {
    return Errors.errResult('TODO');
  }

} //class LibDao
