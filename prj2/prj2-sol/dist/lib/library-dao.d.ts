import { Errors } from 'cs544-js-utils';
export declare function makeLibraryDao(dbUrl: string): Promise<Errors.Result<LibraryDao>>;
export declare class LibraryDao {
    constructor(todo: string);
    static make(dbUrl: string): Promise<Errors.Result<LibraryDao>>;
    /** close off this DAO; implementing object is invalid after
     *  call to close()
     *
     *  Error Codes:
     *    DB: a database error was encountered.
     */
    close(): Promise<Errors.Result<void>>;
}
//# sourceMappingURL=library-dao.d.ts.map