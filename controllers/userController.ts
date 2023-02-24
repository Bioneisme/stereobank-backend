import logger from "../config/logger";
import {DI} from "../index";
import {NextFunction, Request, Response} from "express";
import {UserRequest} from "../types";
import {Tokens, Users, Wallets} from "../entities";
import tokenService from "../services/tokenService";
import {hash, compare} from "bcryptjs";
import {wrap} from "@mikro-orm/core";

class UserController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, phone, name, password} = req.body;
            if (!phone || !email || !name || !password) {
                res.status(400).json({error: true, message: "missing_fields"});
                return next();
            }
            const existingUser = await DI.em.findOne(Users, {
                $or: [{phone}, {email}]
            });
            if (existingUser) {
                res.status(400).json({error: true, message: "user_exists"});
                return next();
            }
            const hashedPassword = await hash(password, 12);
            const user = DI.em.create(Users, {
                name,
                phone,
                email,
                caller_id: "",
                password: hashedPassword
            });
            await DI.em.persistAndFlush(user);

            const wallet = DI.em.create(Wallets, {
                user_id: user.id
            });
            await DI.em.persistAndFlush(wallet);

            const tokens = tokenService.generateTokens(user.id);
            await tokenService.saveToken(user.id, tokens.refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });
            res.json({error: false, ...tokens, user});
            return next();
        } catch (e) {
            logger.error(`register: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async findUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, phone} = req.body;
            const user = await DI.em.findOne(Users, {
                $or: [{phone}, {email}]
            });
            if (user) {
                res.status(400).json({error: true, message: "user_exists"});
                return next();
            }

            res.json({error: false, message: "user_not_found"});
            return next();
        } catch (e) {
            logger.error(`findUser: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {log, password} = req.body;
            const user = await DI.em.findOne(Users, {
                $or: [{phone: log}, {email: log}]
            });
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }
            const isMatch = await compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({error: true, message: "invalid_password"});
                return next();
            }
            const tokens = tokenService.generateTokens(user.id);
            await tokenService.saveToken(user.id, tokens.refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });

            res.json({error: false, ...tokens, user});
            return next();
        } catch (e) {
            logger.error(`login: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies;
            await tokenService.removeToken(refreshToken);
            res.clearCookie("refreshToken");
            res.json({error: false, message: "logout_success"});
            return next();
        } catch (e) {
            logger.error(`logout: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                res.status(401).json({error: true, message: "unauthorized"});
                return next();
            }
            const userData: any = tokenService.verifyRefreshToken(refreshToken);
            const token = await DI.em.findOne(Tokens, {token: refreshToken});
            if (!token || !userData) {
                res.status(401).json({error: true, message: "unauthorized"});
                return next();
            }
            const user = await DI.em.findOne(Users, {id: userData.id});
            if (user) {
                const tokens = tokenService.generateTokens(user.id);
                await tokenService.saveToken(user.id, tokens.refreshToken);
                res.cookie("refreshToken", tokens.refreshToken, {
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                });
                res.json({error: false, message: "refresh_success", ...tokens, user});
                return next();
            }

            res.status(401).json({error: true, message: "unauthorized"});
            return next();
        } catch (e) {
            logger.error(`refresh: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const {user} = req as UserRequest;
            res.json({error: false, message: "get_me_success", user});
            return next();
        } catch (e) {
            logger.error(`getMe: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }
}

export default new UserController();