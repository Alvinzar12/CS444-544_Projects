import { Errors } from 'cs544-js-utils';
 
//types defined in library.ts in earlier projects
import * as Lib from 'library-types';
 
 
import { NavLinks, LinkedResult, PagedEnvelope, SuccessEnvelope }
  from './response-envelopes.js';
 
import { makeLibraryWs, LibraryWs } from './library-ws.js';
 
import { makeElement, makeQueryUrl } from './utils.js';
 
export default function makeApp(wsUrl: string) {
  return new App(wsUrl);
}
 
 
class App {
  private readonly wsUrl: string;
  private readonly ws: LibraryWs;
 
  private readonly result: HTMLElement;
  private readonly errors: HTMLElement;
 
  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
    this.ws = makeLibraryWs(wsUrl);
    this.result = document.querySelector('#result');
    this.errors = document.querySelector('#errors');
    //TODO: add search handler
    const search = document.querySelector('#search') as HTMLInputElement;
    search.addEventListener('blur', () => this.searchBooks(search.value));
    //pressing enter in the search widget should search, not reload the page
    document.querySelector('form')!.addEventListener('submit', ev => {
      ev.preventDefault();
      this.searchBooks(search.value);
    });
  }
 
  //TODO: add private methods as needed
 
  //search for books matching search and display the results
  private async searchBooks(search: string) {
    const url = makeQueryUrl(`${this.wsUrl}/api/books`, { search });
    await this.showSearchResults(url);
  }
 
  //fetch the search results at url and display them in #result
  private async showSearchResults(url: string|URL) {
    this.clearErrors();
    this.result.innerHTML = '';
    const envelope = this.unwrap(await this.ws.findBooksByUrl(url));
    if (!envelope) return;
    const top = this.makeScroll(envelope.links);
    const bottom = this.makeScroll(envelope.links);
    const items = envelope.result.map(book => this.makeBookItem(book));
    if (top) this.result.append(top);
    this.result.append(makeElement('ul', { id: 'search-results' }, ...items));
    if (bottom) this.result.append(bottom);
  }
 
  //return a scroll section having only the prev/next links which exist or undefined if there are neither
  private makeScroll(links: NavLinks) {
    if (!links.prev && !links.next) return undefined;
    const scroll = makeElement('div', { class: 'scroll' });
    if (links.prev) {
      const prev = makeElement('a', { rel: 'prev' }, '<<');
      prev.addEventListener('click', ev => {
	ev.preventDefault();
	this.showSearchResults(links.prev.href);
      });
      scroll.append(prev);
    }
    if (links.next) {
      const next = makeElement('a', { rel: 'next' }, '>>');
      next.addEventListener('click', ev => {
	ev.preventDefault();
	this.showSearchResults(links.next.href);
      });
      scroll.append(next);
    }
    return scroll;
  }
 
  //return an <li> for one search result
  private makeBookItem(book: LinkedResult<Lib.XBook>) {
    const details = makeElement('a', { class: 'details' }, 'details...');
    details.addEventListener('click', ev => {
      ev.preventDefault();
      this.clearErrors();
      this.showBookDetails(book.links.self.href);
    });
    const title = makeElement('span', { class: 'content' }, book.result.title);
    return makeElement('li', {}, title, details);
  }
 
  //fetch the book at url (its self link) and display its details,
  //its borrowers and a checkout form in #result
  private async showBookDetails(url: string) {
    this.clearErrors();
    this.result.innerHTML = '';
    const envelope = this.unwrap(await this.ws.getBookByUrl(url));
    if (!envelope) return;
    const book = envelope.result;
    const details = makeElement('dl', { class: 'book-details' },
      makeElement('dt', {}, 'ISBN'),
      makeElement('dd', {}, book.isbn),
      makeElement('dt', {}, 'Title'),
      makeElement('dd', {}, book.title),
      makeElement('dt', {}, 'Authors'),
      makeElement('dd', {}, book.authors.join('; ')),
      makeElement('dt', {}, 'Number of Pages'),
      makeElement('dd', {}, String(book.pages)),
      makeElement('dt', {}, 'Publisher'),
      makeElement('dd', {}, book.publisher),
      makeElement('dt', {}, 'Number of Copies'),
      makeElement('dd', {}, String(book.nCopies)),
      makeElement('dt', {}, 'Borrowers'),
      makeElement('dd', { id: 'borrowers' }, 'None'));
    this.result.append(details, this.makeCheckoutForm(book.isbn));
    await this.showBorrowers(book.isbn);
  }
 
  //return the checkout form for the book having isbn
  private makeCheckoutForm(isbn: string) {
    const input = makeElement('input', { id: 'patronId' }) as HTMLInputElement;
    const form = makeElement('form', { class: 'grid-form' },
      makeElement('label', { for: 'patronId' }, 'Patron ID'),
      makeElement('span', {},
        input,
        makeElement('br'),
        makeElement('span', { class: 'error', id: 'patronId-error' })),
      makeElement('button', { type: 'submit' }, 'Checkout Book'));
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      this.clearErrors();
      const result =
        await this.ws.checkoutBook({ isbn, patronId: input.value });
      if (result.isOk === false) {
        displayErrors(result.errors);
      }
      else {
        await this.showBorrowers(isbn);
      }
    });
    return form;
  }
 
  //look up the current lendings for isbn and display them in #borrowers
  //(shows None if there are no lendings)
  private async showBorrowers(isbn: string) {
    const lends = this.unwrap(await this.ws.getLends(isbn));
    if (!lends) return;
    const borrowers = this.result.querySelector('#borrowers')!;
    borrowers.innerHTML = '';
    if (lends.length === 0) {
      borrowers.append('None');
      return;
    }
    const items = lends.map(lend => this.makeBorrowerItem(lend));
    borrowers.append(makeElement('ul', {}, ...items));
  }
 
  //return an <li> for one borrower with a Return Book button
  private makeBorrowerItem(lend: Lib.Lend) {
    const button =
      makeElement('button', { class: 'return-book' }, 'Return Book');
    button.addEventListener('click', ev => {
      ev.preventDefault();
      this.clearErrors();
      this.returnBook(lend.isbn, lend.patronId);
    });
    return makeElement('li', {},
      makeElement('span', { class: 'content' }, lend.patronId), button);
  }
 
  //TODO (teammate 3): return book isbn for patronId using this.ws.returnBook()
  //(already implemented in library-ws.ts), displaying any errors, and then
  //refresh the borrowers list by calling this.showBorrowers(isbn).
  private async returnBook(isbn: string, patronId: string) {
    console.log('returnBook not implemented yet', isbn, patronId);
  }
 
  /** unwrap a result, displaying errors if !result.isOk, 
   *  returning T otherwise.   Use as if (unwrap(result)) { ... }
   *  when T !== void.
   */
  private unwrap<T>(result: Errors.Result<T>) {
    if (result.isOk === false) {
      displayErrors(result.errors);
    }
    else {
      return result.val;
    }
  }
 
  /** clear out all errors */
  private clearErrors() {
    this.errors.innerHTML = '';
    document.querySelectorAll(`.error`).forEach( el => {
      el.innerHTML = '';
    });
  }
 
} //class App
 
/** Display errors. If an error has a widget or path widgetId such
 *  that an element having ID `${widgetId}-error` exists,
 *  then the error message is added to that element; otherwise the
 *  error message is added to the element having to the element having
 *  ID `errors` wrapped within an `<li>`.
 */  
function displayErrors(errors: Errors.Err[]) {
  for (const err of errors) {
    const id = err.options?.widget ?? err.options?.path;
    const widget = id && document.querySelector(`#${id}-error`);
    if (widget) {
      widget.append(err.message);
    }
    else {
      const li = makeElement('li', {class: 'error'}, err.message);
      document.querySelector(`#errors`)!.append(li);
    }
  }
}
 
//TODO: add functions as needed
 
