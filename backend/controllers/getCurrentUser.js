import User from "../models/User.js";

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userid).select("-password");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Failed to load user" });
    }
};

export default getCurrentUser;
