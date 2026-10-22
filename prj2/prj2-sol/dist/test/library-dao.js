//will run the project DAO using an in-memory mongodb server
import { makeMemDao } from './mem-dao.js';
import { makeLibraryDao, } from '../lib/library-dao.js';
import { BOOKS, } from './test-data.js';
import { assert, expect } from 'chai';
describe('library DAO', () => {
    //mocha will run beforeEach() before each test to set up these variables
    let memDao;
    let dao;
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
});
describe('library DAO creation', () => {
    it('must return a DB error for a bad mongo url', async () => {
        const daoResult = await makeLibraryDao('not-a-mongo-url');
        assert(daoResult.isOk === false);
        expect(daoResult.errors[0].options.code).to.equal('DB');
    });
});
const PATRONS = ['joe', 'bill', 'sue', 'anne', 'karen'];
const ISBNS = BOOKS.slice(0, 5).map(b => b.isbn);
//LENDS = ISBNS x PATRONS
const LENDS = ISBNS.reduce((acc, isbn) => acc.concat(PATRONS.map(patronId => ({ isbn, patronId }))), []);
//# sourceMappingURL=library-dao.js.map