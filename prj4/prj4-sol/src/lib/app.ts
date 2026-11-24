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

  //display the book at url; to be implemented (steps 17-20 of project)
  private async showBookDetails(url: string) {
    console.log(url);
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
    const id = err.options.widget ?? err.options.path;
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
