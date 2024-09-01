import React, { useCallback, useEffect, useState } from 'react';

let renderPage = () => {};

const handlePopState = () => {
  renderPage();
};
window.addEventListener("popstate", handlePopState);

// Navigate with function
export const navigateTo = (to) => {
  if (isUrlChanged(to)) {
    window.history.pushState({}, "", to);
    renderPage();
  }
};

export const replaceTo = (to) => {
  if (isUrlChanged(to)) {
    window.history.replaceState({}, "", to);
    renderPage();
  }
};

export const goBack = () => window.history.back();

// Navigate with component
export const BabyLink = React.memo(({ to, children }) => {
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      navigateTo(to);
    },
    [to]
  );

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
});

/**
 * Main component to organize the routes
 * @param {{[route: string]: React.Component}} routes
 * @param {string} defaultRoute
 */
export const BabyRoutes = React.memo(({ routes, defaultRoute = "/" }) => {
  const [page, setPage] = useState(getPageComponent(routes));

  useEffect(() => {
    renderPage = () => {
      setPage(getPageComponent(routes));
    };
    renderPage();
  }, [routes]);

  useEffect(() => {
    if (!page) {
      navigateTo(defaultRoute);
    }
  }, [defaultRoute, page]);

  return page;
});

function getPageComponent(routes) {
  const { pathname, search } = window.location;

  if (routes[pathname]) {
    const Component = routes[pathname];
    const queryParams = parseSearch(search);
    return <Component queryParams={queryParams} />;
  }

  return null;
}

function parseSearch(search) {
  const obj = {};

  if (search) {
    const searchParams = new URLSearchParams(search);
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
  }

  return obj;
}

function isUrlChanged(to) {
  const current = `${window.location.pathname}${window.location.search}`;
  return current !== to;
}
