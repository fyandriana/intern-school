// server/routes/auth.routes.js
import {Router} from "express";
import {getUserByEmailSvc, createUserSvc} from "../users/users.service.js";
import {hashPassword, verifyPassword} from "./password.js";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;
router.post("/signup", async (req, res, next) => {
    try {
        const {name, email, password, confirmPassword, role} = req.body;
        console.log(role);
        // Minimal validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({error: "name, email, password required, confirm password required"});
        }
        // Match password
        if (password !== confirmPassword) return res.status(422).json({error: "Passwords do not match"});

        // Ensure unique email
        // const existing = await getUserByEmailSvc(email);
        // if (existing) return res.status(409).json({error: "Email already used"});

        const passwordHash = await hashPassword(password);

        // create new user
        const user = await createUserSvc({name, email, passwordHash, role});
        // Never send passwordHash
        res.status(201).json({user: {id: user.id, name: user.name, email: user.email, role: user.role}});
    } catch (e) {
        return res.status(400).json({error: e.message});
        // next(e);
    }
});

// POST /api/login
router.post("/login", async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password)
            return res.status(400).json({error: "email, password required"});

        const user = await getUserByEmailSvc(email);
        if (!user) return res.status(401).json({error: "Invalid credentials"});

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return res.status(401).json({error: "Invalid credentials"});

        const token = jwt.sign(
            {sub: user.id, role: user.role, email: user.email},           // payload
            JWT_SECRET,                                         // secret
            {expiresIn: JWT_EXPIRES || "1d"}                  // options
        );

        res.status(201).json({user: {id: user.id, name: user.name, email: user.email, role: user.role}, token});

    } catch (e) {
        return res.status(400).json({error: e.message});
    }
});

export default router;
