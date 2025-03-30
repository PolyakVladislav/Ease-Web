import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import userModel, { IUser } from '../models/Users';
import dotenv from 'dotenv';

dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!, 
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
  callbackURL: "/auth/google/callback"
},
  async (accessToken, refreshToken, profile: Profile, done) => {
    try {
      let user = await userModel.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      const email = profile.emails && profile.emails[0].value;
      if (email) {
        user = await userModel.findOne({ email });
        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }
      }

      const newUser = new userModel({
        username: profile.displayName,
        email: email,
        googleId: profile.id,
        profileImage: profile.photos && profile.photos[0].value,
      });

      await newUser.save();
      done(null, newUser);
    } catch (err) {
      done(err, false);
    }
  }
));
