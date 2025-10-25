export function validateIntParam(param = "id") {
    return (req, res, next) => {
        const n = Number(req.params[param]);
        if (!Number.isInteger(n) || n < 1) {
            return res.status(400).json({code: "VALIDATION_ERROR", message: `Invalid ${param}`});
        }
        // make parsed value available without mutating params
        req[param] = n; // e.g., req.id
        next();
    };
}