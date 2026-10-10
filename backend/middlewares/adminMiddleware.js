import User from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userid).select("role");

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: "Admin access required" });
    }
};

export default adminMiddleware;
