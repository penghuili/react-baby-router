# react-baby-router

Such a simple react router. I guess this is the simplest react router in the world.

## Limitations

- No path params, you have to use query params;
- No nested route;

## Installation

```
npm install react-baby-router
```

## Usage

### Structure your router:

```
import { BabyRoutes } from 'react-baby-router';
import React from 'react';

import { Account } from './views/Account.jsx';
import { Notes } from './views/Notes.jsx';
import { NoteDetails } from './views/NoteDetails.jsx';
import { SignUp } from './views/SignUp.jsx';
import { SignIn } from './views/SignIn.jsx';
import { ResetPassword } from './views/ResetPassword.jsx';
import { Welcome } from './views/Welcome.jsx';

const loggedInRoutes = {
  '/account': Account,
  '/note-details': NoteDetails,
  '/': Notes,
};
const publicRoutes = {
  '/sign-up': SignUp,
  '/sign-in': SignIn,
  '/reset-password': ResetPassword,
  '/': Welcome,
};

export const Router = React.memo(() => {
  const isLoggedIn = useCat(isLoggedInCat);

  if (isLoggedIn) {
    return <Routes routes={loggedInRoutes} />;
  }

  return <Routes routes={publicRoutes} />;
});
```

### Navigate anywhere within your app:

```
import { navigateTo, replaceTo, goBack } from 'react-baby-router';

// This will add an item to the browser history
navigateTo('/note-details?noteId=123456');

...

// This will replace the current page, without adding an item to browser history
replaceTo('/account');

// go back
goBack();
```

### Navigate with a component:

```
import { Button } from '@radix-ui/themes';
import { BabyLink } from 'react-baby-router';
import React from 'react';

// Use your own link component
const RouteLink = React.memo(({ to, children }) => {
  return <BabyLink to={to}><Button variant="soft" size="1">{children}</Button></BabyLink>;
});

function MyComponent() {
  return (
    <>
      All my notes.
      And this is my <RouteLink to="/account">Account</RouteLink>
    </>
  )
}
```

That's everything.

See how I use **react-baby-router** in [notenote.cc](https://github.com/penghuili/notenotecc)

You may noticed the `useCat` hook above, that's my simplest react state management lib: [usecat](https://github.com/penghuili/usecat)
