import './style.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';

let renderPage = () => {};
let currentPosition = history.state?.position || 1;
let checkIsBrowserNavigate = () => {};
let isProgramGoBack = false;
const ANIMATION_DURATION = 200;

export const navigateTo = (to) => {
  if (isUrlChanged(to)) {
    currentPosition++;
    window.history.pushState({ position: currentPosition }, "", to);
    checkIsBrowserNavigate(false);
    isProgramGoBack = false;
    renderPage("forward", to);
  }
};

export const replaceTo = (to) => {
  if (isUrlChanged(to)) {
    window.history.replaceState({ position: currentPosition }, "", to);
    checkIsBrowserNavigate(false);
    isProgramGoBack = false;
    renderPage("forward", to);
  }
};

export const goBack = () => {
  checkIsBrowserNavigate(false);
  isProgramGoBack = true;
  window.history.back();
};

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

export const BabyRoutes = React.memo(
  ({ routes, defaultRoute = "/", enableAnimation = true }) => {
    const [pageStack, setPageStack] = useState(initPageStack(routes));
    const [isBrowserNavigate, setIsBrowserNavigate] = useState(false);
    const [animationState, setAnimationState] = useState("none"); // 'none', 'enter', 'active'
    const timeoutRef = useRef(null);

    renderPage = (newDirection, newPath) => {
      if (newDirection === "forward") {
        setAnimationState("enter");
        setPageStack([
          ...pageStack,
          { key: newPath, component: getPageComponent(routes, newPath) },
        ]);

        // Use requestAnimationFrame to ensure the 'enter' class is applied before 'active'
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimationState("active");
          });
        });
      } else {
        setPageStack(pageStack.slice(0, pageStack.length - 1));
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    useEffect(() => {
      const handlePopState = (event) => {
        if (!isProgramGoBack) {
          setIsBrowserNavigate(true);
        }

        const newPosition = event.state?.position ?? 0;

        renderPage(
          newPosition > currentPosition ? "forward" : "backward",
          `${window.location.pathname}${window.location.search}`
        );
      };

      window.addEventListener("popstate", handlePopState);

      checkIsBrowserNavigate = setIsBrowserNavigate;

      setPageStack(initPageStack(routes));

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, [routes]);

    useEffect(() => {
      if (!pageStack[0]) {
        replaceTo(defaultRoute);
      }
    }, [defaultRoute, pageStack, routes]);

    const isAnimationEnabled =
      enableAnimation && !(isBrowserNavigate && isIOSBrowser());

    return (
      <div className="page-container">
        {pageStack.map((page, index) => {
          const isLast = index === pageStack.length - 1;
          const isSecondLast = index === pageStack.length - 2;

          let className = "page";
          if (isAnimationEnabled) {
            if (isLast && animationState !== "none") {
              className +=
                animationState === "enter"
                  ? " page-enter"
                  : " page-enter page-enter-active";
            } else if (isSecondLast && animationState !== "none") {
              className += " page-exit page-exit-active";
            }
          }

          return (
            <div
              key={page.key}
              className={className}
              style={{
                zIndex: index,
                display: isLast || isSecondLast ? "block" : "none",
                transition: isAnimationEnabled
                  ? `transform ${ANIMATION_DURATION}ms ease`
                  : "none",
              }}
            >
              <div className="page-content">{page.component}</div>
            </div>
          );
        })}
      </div>
    );
  }
);

function initPageStack(routes) {
  return routes[window.location.pathname]
    ? [
        {
          key: `${window.location.pathname}${window.location.search}`,
          component: getPageComponent(
            routes,
            `${window.location.pathname}${window.location.search}`
          ),
        },
      ]
    : [];
}

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

function isIOSBrowser() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const iOS_devices = /iphone|ipad|ipod/;

  // Check if it's an iOS device
  if (iOS_devices.test(userAgent)) {
    return true;
  }

  // Special check for iPad on iOS 13+ (which reports as Mac)
  if (
    userAgent.includes("mac") &&
    navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2
  ) {
    return true;
  }

  return false;
}
