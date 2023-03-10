import logger from "../config/logger";
import {DI} from "../index";
import {NextFunction, Request, Response} from "express";
import {UserRequest} from "../types";
import {Tokens, TransactionHistory, Users, Wallets} from "../entities";
import tokenService from "../services/tokenService";
import {hash, compare} from "bcryptjs";
import {SERVER_URL, SMS_ALL, SMS_KZ, SMS_UK} from "../config/settings";
import axios from "axios";
import generatePromo from "../utils/promo";
import {wrap} from "@mikro-orm/core";
import {noExponents} from "../utils/noExponents";

function generateRandomCode(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const phoneNumbers = new Set();

class UserController {
    async sendCode(req: Request, res: Response, next: NextFunction) {
        try {
            let {phone} = req.body;
            if (!phone) {
                res.status(400).json({error: true, message: "phone_required"});
                return next();
            }
            phone = phone.replace(/[^0-9.]/, '');
            const API_KEY = phone.substring(0, 2) === '77' ? SMS_KZ : (phone.substring(0, 3) === '380' ? SMS_UK : SMS_ALL);
            return axios.post("https://my.ittell.com.ua/call_api/call", {
                "phone_number": phone,
                options: {
                    "callback_url": `${SERVER_URL}/api/users/callbackCode`
                }
            }, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`
                }
            }).then(async result => {
                res.json({error: false, message: "code_sent"});
                return next();
            }).catch(e => {
                logger.error(`sendCode: ${e}`);
                res.status(500).json({error: true, message: e});
                return next();
            });
        } catch (e) {
            logger.error(`sendCode: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async checkPhone(req: Request, res: Response, next: NextFunction) {
        try {
            let {phone} = req.params;
            if (!phone) {
                res.status(400).json({error: true, message: "phone_required"});
                return next();
            }
            phone = phone.replace(/[^0-9.]/, '');
            if (phoneNumbers.has(phone)) {
                phoneNumbers.delete(phone);
                res.json({error: false, message: "ok"});
                return next();
            }
            res.status(400).json({error: true, message: "phone_not_found"});
            return next();
        } catch (e) {
            logger.error(`checkPhone: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async callbackCode(req: Request, res: Response, next: NextFunction) {
        try {
            const {phone_number, select} = req.body;
            if (select === "1") {
                phoneNumbers.add(phone_number);
            }

            res.json({error: false, message: "ok"});
            return next();
        } catch (e) {
            logger.error(`callbackCode: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

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
                password: hashedPassword,
                promo_code: generatePromo()
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
                $or: [{phone: log}, {email: log}],
                is_google: false
            }, {populate: true});
            if (!user) {
                res.status(400).json({error: true, message: "user_not_found"});
                return next();
            }
            const isMatch = await compare(password, user.password || "");
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

    async googleSignIn(req: Request, res: Response, next: NextFunction) {
        try {
            const {displayName, email, photoURL, phoneNumber} = req.body;
            if (!email) {
                res.status(400).json({error: true, message: "missing_fields"});
                return next();
            }
            let user = await DI.em.findOne(Users, {
                email,
                is_google: true
            }, {populate: true});
            if (!user) {
                user = DI.em.create(Users, {
                    name: displayName,
                    email,
                    phone: phoneNumber,
                    caller_id: "",
                    is_google: true,
                    photo_url: photoURL,
                    promo_code: generatePromo()
                });
            } else {
                user.photo_url = photoURL;
                user.name = displayName;
                user.phone = phoneNumber;
                user.is_google = true;
            }

            await DI.em.persistAndFlush(user);
            const tokens = tokenService.generateTokens(user.id);
            await tokenService.saveToken(user.id, tokens.refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true
            });

            res.json({error: false, ...tokens, user});
            return next();
        } catch (e) {
            logger.error(`googleSignIn: ${e}`);
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

    async activatePromo(req: Request, res: Response, next: NextFunction) {
        try {
            const {promo_code} = req.body;
            const {user} = req as UserRequest;
            if (!user || user.referral_id) {
                res.status(401).json({error: true, message: "user_not_found"});
                return next();
            }
            if (!promo_code) {
                res.status(400).json({error: true, message: "missing_fields"});
                return next();
            }
            const promo_owner = await DI.em.findOne(Users, {promo_code});
            if (!promo_owner) {
                res.status(400).json({error: true, message: "promo_invalid"});
                return next();
            }
            if (promo_owner.id === user.id) {
                res.status(400).json({error: true, message: "user_is_owner"});
                return next();
            }
            const usdt_amount = 5;
            wrap(user).assign({referral_id: promo_owner});
            await DI.em.persistAndFlush(user);
            const owner_wallet = await DI.em.findOne(Wallets, {user_id: promo_owner.id});
            if (owner_wallet) {
                wrap(owner_wallet).assign({
                    usdt_trc20: (+noExponents(+(owner_wallet.usdt_trc20 || 0)) +
                        +noExponents(usdt_amount)).toString()
                });
                await DI.em.persistAndFlush(owner_wallet);
                const transaction = DI.em.create(TransactionHistory, {
                    user: promo_owner.id,
                    currency_amount: usdt_amount.toString(),
                    charge_amount: usdt_amount.toString(),
                    action: "bonus",
                    coin: "USDT",
                    status: "success",
                    is_fiat: false,
                    network: 'TRX',
                    okx_network: 'USDT-TRC20',
                    caller_id: " "
                });
                await DI.em.persistAndFlush(transaction);
            }
            const user_wallet = await DI.em.findOne(Wallets, {user_id: user.id});
            if (user_wallet) {
                wrap(user_wallet).assign({
                    usdt_trc20: (+noExponents(+(user_wallet.usdt_trc20 || 0)) +
                        +noExponents(usdt_amount)).toString()
                });
                await DI.em.persistAndFlush(user_wallet);
                const transaction = DI.em.create(TransactionHistory, {
                    user: user.id,
                    currency_amount: usdt_amount.toString(),
                    charge_amount: usdt_amount.toString(),
                    action: "bonus",
                    coin: "USDT",
                    status: "success",
                    is_fiat: false,
                    network: 'TRX',
                    okx_network: 'USDT-TRC20',
                    caller_id: " "
                });
                await DI.em.persistAndFlush(transaction);
            }
            res.json({error: false, user, message: "promo_activated"});
            return next();
        } catch (e) {
            logger.error(`activatePromo: ${e}`);
            res.status(500).json({error: true, message: e});
            next();
        }
    }

    async getMyReferrals(req: Request, res: Response, next: NextFunction) {
        try {
            const {user} = req as UserRequest;
            if (!user) {
                res.status(401).json({error: true, message: "user_not_found"});
                return next();
            }
            const referrals = await DI.em.find(Users, {referral_id: user.id});
            res.json({error: false, message: "get_my_referrals_success", referrals});
            return next();
        } catch (e) {
            logger.error(`getMyReferrals: ${e}`);
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