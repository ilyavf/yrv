import Router from 'abstract-nested-router';
import { writable } from 'svelte/store';
import queryString from 'query-string';

const baseTag = document.getElementsByTagName('base');
const basePrefix = (baseTag[0] && baseTag[0].href.replace(/\/$/, '')) || '/';

export const ROOT_URL = basePrefix.replace(window.location.origin, '');

export const router = writable({
  path: '/',
  query: {},
  params: {},
});

export const CTX_ROUTER = {};
export const CTX_ROUTE = {};

// use location.hash on embedded pages, e.g. Svelte REPL
export let HASHCHANGE = window.location.origin === 'null';

export function hashchangeEnable(value) {
  if (typeof value === 'boolean') {
    HASHCHANGE = !!value;
  }

  return HASHCHANGE;
}

export function fixedLocation(path, callback) {
  const baseUri = hashchangeEnable() ? window.location.hash.replace('#', '') : window.location.pathname;

  // this will rebase anchors to avoid location changes
  if (path.charAt() !== '/') {
    path = baseUri + path;
  }

  const currentURL = baseUri + window.location.hash + window.location.search;

  // do not change location et all...
  if (currentURL !== path) {
    callback(path);
  }
}

export function navigateTo(path, options) {
  const {
    reload, replace,
    params, queryParams,
  } = options || {};

  // If path empty or no string, throws error
  if (!path || typeof path !== 'string') {
    throw new Error(`yrv expects navigateTo() to have a string parameter. The parameter provided was: ${path} of type ${typeof path} instead.`);
  }

  if (path[0] !== '/' && path[0] !== '#') {
    throw new Error(`yrv expects navigateTo() param to start with slash or hash, e.g. "/${path}" or "#${path}" instead of "${path}".`);
  }

  if (params) {
    path = path.replace(/:([a-zA-Z][a-zA-Z0-9_-]*)/g, (_, key) => params[key]);
  }

  // rebase active URL
  if (ROOT_URL !== '/' && path.indexOf(ROOT_URL) !== 0) {
    path = ROOT_URL + path;
  }

  if (queryParams) {
    const qs = queryString.stringify(queryParams);

    if (qs) {
      path += `?${qs}`;
    }
  }

  if (hashchangeEnable()) {
    window.location.hash = path.replace(/^#/, '');
    return;
  }

  // If no History API support, fallbacks to URL redirect
  if (reload || !window.history.pushState || !dispatchEvent) {
    window.location.href = path;
    return;
  }

  // If has History API support, uses it
  fixedLocation(path, nextURL => {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', nextURL);
    dispatchEvent(new Event('popstate'));
  });
}

export function isActive(uri, path, exact) {
  if (exact !== true && path.indexOf(uri) === 0) {
    return /^[#/?]?$/.test(path.substr(uri.length, 1));
  }

  if (uri.includes('*') || uri.includes(':')) {
    return Router.matches(uri, path);
  }

  return path === uri;
}
