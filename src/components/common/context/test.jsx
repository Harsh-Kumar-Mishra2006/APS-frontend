// App.js
import React from 'react';
import WelcomePage from './WelcomePage';
import UserProvider from './Context';

const Test = () => {
  return (
    <UserProvider>
      <WelcomePage />
    </UserProvider>
  );
};

export default Test;