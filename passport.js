import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as FacebookStrategy } from "passport-facebook";

// import { Strategy as HubspotStrategy } from "passport-hubspot";
import HubspotStrategy from "passport-hubspot";
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID, // Your Credentials here from google dev site.
      clientSecret: process.env.CLIENT_SECRET, // Your Credentials here.
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

// Facebook Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: ,
//       profileFields: ['id', 'displayName', 'emails', 'photos'],
//     },
//     function (accessToken, refreshToken, profile, done) {
//       return done(null, profile);
//     }
//   )
// );
// HubSpot Strategy
// passport.use(
//   new HubspotStrategy(
//     {
//       clientID: process.env.CLIENT_ID_HUBSPOT,
//       clientSecret: process.env.CLIENT_SECRET_HUBSPOT,
//       callbackURL: process.env.CALLBACKURL_HUBSPOT
//     },
//     function (accessToken, refreshToken, profile, done) {
//       return done(null, profile);
//     }
//   )
// );

passport.use(
  new HubspotStrategy(
    {
      clientID: "21df8a3a-638b-4511-af0c-b3d0a9fd194b",
      clientSecret: "a36ab42a-3bd8-47f2-bd4c-9e7c7b32481c",
      callbackURL: 'http://localhost:3000/auth/hubspot/callback', // callback url hubspot
    },
    function (accessToken, refreshToken, profile, done) {

      console.log("✅ HubSpot Access Token:", accessToken);
      console.log("✅ HubSpot Profile:", profile);
      return done(null, profile);
    }
  )
);
