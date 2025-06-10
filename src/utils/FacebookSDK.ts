/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any; // Define a more specific type for FB if needed
  }
}

export const initFacebookSdk = () => {
  return new Promise<void>((resolve) => {
    // Load the Facebook SDK asynchronously
    window.fbAsyncInit = () => {
      console.log(window.FB);
      window.FB.init({
        appId: process.env.FACEBOOK_ID,
        xfbml: true,
        version: "v22.0",
      });
      // Resolve the promise when the SDK is loaded
      resolve();
    };
  });
};

export const getFacebookLoginStatus = () => {
  return new Promise((resolve) => {
    window.FB.getLoginStatus((response: any) => {
      resolve(response);
    });
  });
};

export const fbLogin = () => {
  return new Promise((resolve) => {
    window.FB.login((response: any) => {
      resolve(response);
    });
  });
};
