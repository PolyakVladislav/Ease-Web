import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../models/Users';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { Document } from 'mongoose';

const CLIENT_CONNECT = process.env.CLIENT_CONNECT;

type tTokens = {
  accessToken: string,
  refreshToken: string
}

const generateToken = (userId: string): tTokens | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }

  const random = Math.random().toString();

  const accessToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET as Secret, 
    { expiresIn: process.env.TOKEN_EXPIRES as string } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { _id: userId, random },
    process.env.TOKEN_SECRET as Secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES as string } as jwt.SignOptions 
  );

  return { accessToken, refreshToken };
};

//
// =============== REGISTER ===============
//
const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password,phoneNumber,gender, } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
      return;
    }

    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({ message: 'Email is already registered' });
        return;
      }
      if (existingUser.username === username) {
        res.status(409).json({ message: 'Username is already taken' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePictureUrl = '';
    if (req.file) {
      const SERVER_CONNECT = process.env.SERVER_CONNECT;
      profilePictureUrl = `${SERVER_CONNECT}/uploads/${req.file.filename}`;
    } else {
      const SERVER_CONNECT = process.env.SERVER_CONNECT;
      profilePictureUrl = `${SERVER_CONNECT}/uploads/1741781673180-376059482.jpg`;
    }

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      gender,
      profilePicture: profilePictureUrl
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: user.username,
        email: user.email,
        _id: user._id,
        profilePicture: user.profilePicture,
        role: user.role
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//
// =============== LOGIN ===============
//
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Wrong email or password' });
      return;
    }

    const validPassword = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!validPassword) {
      res.status(400).json({ message: 'Wrong email or password' });
      return;
    }

    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).json({ message: 'Failed to generate tokens' });
      return;
    }

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
      username: user.username,
      role: user.role,
      isAuthenticated: true,
      likedPosts: user.likedPosts,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//
// =============== REFRESH ===============
//
type tUser = Document<unknown, {}, IUser> & IUser & Required<{
  _id: string;
}> & {
  __v: number;
};

const verifyRefreshToken = (refreshToken: string | undefined) => {
  return new Promise<tUser>((
    resolve,
    reject
  ) => {
    if (!refreshToken) {
      reject('fail');
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      reject('fail');
      return;
    }
    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
      if (err) {
        reject('fail');
        return;
      }
      const userId = payload._id;
      try {
        const user = await userModel.findById(userId);
        if (!user) {
          reject('fail');
          return;
        }
        if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
          user.refreshToken = [];
          await user.save();
          reject('fail');
          return;
        }
        user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
        resolve(user);
      } catch (err) {
        reject('fail');
      }
    });
  });
};

const refresh = async (req: Request, res: Response) => {
  try {
    const tokenFromBody = req.body.refreshToken;
    const tokenFromCookie = req.cookies?.refreshToken;
    const usedRefreshToken = tokenFromBody || tokenFromCookie;
    if (!usedRefreshToken) {
      res.status(400).send('fail');
      return;
    }
    const user = await verifyRefreshToken(usedRefreshToken);
    if (!user) {
      res.status(400).send('fail');
      return;
    }
    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).send('Server Error');
      return;
    }
    await userModel.findByIdAndUpdate(
      user._id,
      { $push: { refreshToken: tokens.refreshToken } },
      { new: true }
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id
    });
  } catch (err) {
    res.status(400).send('fail');
  }
};

//
// =============== LOGOUT ===============
//
const logout = async (req: Request, res: Response) => {
  try {
    const tokenFromBody = req.body.refreshToken;
    const tokenFromCookie = req.cookies?.refreshToken;
    const usedRefreshToken = tokenFromBody || tokenFromCookie;
    if (!usedRefreshToken) {
      res.status(400).send('fail');
      return;
    }
    const user = await verifyRefreshToken(usedRefreshToken);
    user.refreshToken = []; 
    await user.save();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).send('success');
  } catch (err) {
    res.status(400).send('fail');
  }
};


//
// =============== GOOGLE CALLBACK ===============
//
const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser & Document;
    if (!user._id) {
      res.status(500).json({ message: 'User ID is undefined' });
      return;
    }

    if (!user.profilePicture) {
      const SERVER_CONNECT = process.env.SERVER_CONNECT;
      user.profilePicture = `${SERVER_CONNECT}/uploads/1741781673180-376059482.jpg`; 
    }
    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).json({ message: 'No token' });
      return;
    }

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${CLIENT_CONNECT}/oauth/callback?token=${tokens.accessToken}&userId=${user._id}&username=${encodeURIComponent(user.username)}&role=${user.role}`);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

//
// =============== AUTH MIDDLEWARE ===============
//
type Payload = { _id: string };
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.header('authorization');
  const token = authorization && authorization.split(' ')[1];

  if (!token) {
    res.status(401).send('Access Denied');
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500).send('Server Error');
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err || !payload) {
      res.status(401).send('Access Denied');
      return;
    }
    const userId = (payload as Payload)._id;
    userModel.findById(userId)
      .then(user => {
        if (!user) {
          res.status(401).send('Access Denied');
          return;
        }
        (req as any).user = user;  
        next();
      })
      .catch(error => {
        res.status(500).send('Server Error');
      });
  });
};

export default {
  register,
  login,
  refresh,
  authMiddleware,
  googleCallback,
  logout
};
