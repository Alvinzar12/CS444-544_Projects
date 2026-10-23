//will run the project DAO using an in-memory mongodb server
import { MemDao, makeMemDao } from './mem-dao.js';

import { LibraryDao, makeLibraryDao, } from '../lib/library-dao.js';

import * as Lib from '../lib/library.js';

import { BOOKS, } from './test-data.js';

import { assert, expect } from 'chai';

describe('library DAO', () => {

  //mocha will run beforeEach() before each test to set up these variables
  let memDao : MemDao;
  let dao: LibraryDao;
  
  beforeEach(async function () {
    const daoResult = await makeMemDao();
    assert(daoResult.isOk === true);
    memDao = daoResult.val;
    dao = memDao.dao;
  });

  //mocha runs this after each test; we use this to clean up the DAO.
  afterEach(async function () {
    await memDao.tearDown();
  });

  //TODO: add test suites here as needed to test your DAO as you implement it
  //(your DAO is available as variable "dao").

  describe('clear()', () => {

    it('must clear an empty db', async () => {
      const result = await dao.clear();
      assert(result.isOk === true);
    });

    it('must allow repeated clears', async () => {
      for (let i = 0; i < 3; i++) {
        const result = await dao.clear();
        assert(result.isOk === true);
      }
    });

  });

describe('lends', () => {

    const ISBN = BOOKS[0].isbn;

    it('must report no lends in an empty db', async () => {
      const countResult = await dao.countLends(ISBN);
      assert(countResult.isOk === true);
      expect(countResult.val).to.equal(0);
      const hasResult = await dao.hasLend(ISBN, 'joe');
      assert(hasResult.isOk === true);
      expect(hasResult.val).to.equal(false);
    });

    it('must add lends and count them', async () => {
      for (const patronId of ['joe', 'sue']) {
        const result = await dao.addLend(ISBN, patronId);
        assert(result.isOk === true);
      }
      const countResult = await dao.countLends(ISBN);
      assert(countResult.isOk === true);
      expect(countResult.val).to.equal(2);
      const hasResult = await dao.hasLend(ISBN, 'joe');
      assert(hasResult.isOk === true);
      expect(hasResult.val).to.equal(true);
      const noResult = await dao.hasLend(ISBN, 'bill');
      assert(noResult.isOk === true);
      expect(noResult.val).to.equal(false);
    });

    it('must reject a repeated lend', async () => {
      assert((await dao.addLend(ISBN, 'joe')).isOk === true);
      const result = await dao.addLend(ISBN, 'joe');
      assert(result.isOk === false);
      expect(result.errors[0].options.code).to.equal('BAD_REQ');
    });

    it('must remove a lend', async () => {
      assert((await dao.addLend(ISBN, 'joe')).isOk === true);
      assert((await dao.removeLend(ISBN, 'joe')).isOk === true);
      const countResult = await dao.countLends(ISBN);
      assert(countResult.isOk === true);
      expect(countResult.val).to.equal(0);
    });

    it('must error on removing a non-existent lend', async () => {
      const result = await dao.removeLend(ISBN, 'joe');
      assert(result.isOk === false);
      expect(result.errors[0].options.code).to.equal('BAD_REQ');
    });

    it('must clear lends on clear()', async () => {
      assert((await dao.addLend(ISBN, 'joe')).isOk === true);
      assert((await dao.clear()).isOk === true);
      const hasResult = await dao.hasLend(ISBN, 'joe');
      assert(hasResult.isOk === true);
      expect(hasResult.val).to.equal(false);
    });

  });
});


describe('library DAO creation', () => {

  it('must return a DB error for a bad mongo url', async () => {
    const daoResult = await makeLibraryDao('not-a-mongo-url');
    assert(daoResult.isOk === false);
    expect(daoResult.errors[0].options.code).to.equal('DB');
  });

});


const PATRONS = [ 'joe', 'bill', 'sue', 'anne', 'karen' ];
const ISBNS = BOOKS.slice(0, 5).map(b => b.isbn);
//LENDS = ISBNS x PATRONS
const LENDS = ISBNS.reduce((acc, isbn) => 
  acc.concat(PATRONS.map(patronId => ({ isbn, patronId }))), []);

