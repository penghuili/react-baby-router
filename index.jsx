import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

let renderPage = () => {};
let checkIsBrowserNavigate = () => {};
let historyStack = [];
let currentPosition = 0;
let scrollPositions = {};
let isProgramGoBack = false;

export const navigateTo = (to) => {
  if (isUrlChanged(to)) {
    scrollPositions[window.location.pathname] = window.scrollY;
    historyStack = historyStack.slice(0, currentPosition + 1);
    historyStack.push(window.location.pathname);
    currentPosition++;
    window.history.pushState({ position: currentPosition }, "", to);
    renderPage("forward");
    checkIsBrowserNavigate(false);
    isProgramGoBack = false;
  }
};

export const replaceTo = (to) => {
  if (isUrlChanged(to)) {
    window.history.replaceState({ position: currentPosition }, "", to);
    renderPage("forward");
    checkIsBrowserNavigate(false);
    isProgramGoBack = false;
  }
};

export const goBack = () => {
  window.history.back();
  checkIsBrowserNavigate(false);
  isProgramGoBack = true;
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

/**
 * Main component to organize the routes
 * @param {{[route: string]: React.Component}} routes
 * @param {string} defaultRoute
 * @param {boolean} enableAnimation - Enable page transition animation
 */
export const BabyRoutes = React.memo(
  ({ routes, defaultRoute = "/", enableAnimation = true }) => {
    const [page, setPage] = useState(null);
    const [location, setLocation] = useState(window.location.pathname);
    const [direction, setDirection] = useState("forward");
    const [isBrowserNavigate, setIsBrowserNavigate] = useState(false);

    useEffect(() => {
      const handlePopState = (event) => {
        if (!isProgramGoBack) {
          setIsBrowserNavigate(true);
          isProgramGoBack = false;
        }
        const newPosition = event.state?.position ?? 0;
        let newDirection;

        if (newPosition > currentPosition) {
          newDirection = "forward";
        } else if (newPosition < currentPosition) {
          newDirection = "backward";
        } else {
          newDirection = "forward"; // Default to forward if we can't determine
        }

        currentPosition = newPosition;
        renderPage(newDirection);
      };

      renderPage = (newDirection) => {
        const newPage = getPageComponent(routes);
        setPage(newPage);
        setLocation(window.location.pathname);
        setDirection(newDirection);

        setTimeout(() => {
          const scrollPosition = scrollPositions[window.location.pathname] || 0;
          window.scrollTo(0, scrollPosition);
        }, 300);
      };

      checkIsBrowserNavigate = setIsBrowserNavigate;

      window.addEventListener("popstate", handlePopState);

      // Initialize the history stack with the current page
      historyStack = [window.location.pathname];
      currentPosition = 0;
      window.history.replaceState(
        { position: 0 },
        "",
        window.location.pathname
      );

      renderPage("forward");

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, [routes]);

    useEffect(() => {
      if (!page) {
        navigateTo(defaultRoute);
      }
    }, [defaultRoute, page]);

    if (!enableAnimation || (isBrowserNavigate && isIOSBrowser())) {
      return page;
    }

    const pageVariants = {
      initial: (direction) => ({
        opacity: 0,
        x: direction === "forward" ? "100%" : "-100%",
      }),
      in: {
        opacity: 1,
        x: 0,
      },
      out: (direction) => ({
        opacity: 0,
        x: direction === "forward" ? "-100%" : "100%",
      }),
    };
    const pageTransition = {
      type: "tween",
      ease: [0.4, 0, 0.2, 1],
      duration: 0.15,
    };

    return (
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={location}
          custom={direction}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {page}
        </motion.div>
      </AnimatePresence>
    );
  }
);

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
