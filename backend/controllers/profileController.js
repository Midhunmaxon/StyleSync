import User from "../models/User.js";

export const getProfile = async (req, res) => {
    const user = await User.findById(req.user.userid).select("-password");
    return res.status(200).json({ user });
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, profileImage, address } = req.body;

        const user = await User.findById(req.user.userid);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name !== undefined) user.name = name.trim();
        if (phone !== undefined) user.phone = phone;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (address) {
            user.address = {
                ...user.address.toObject?.(),
                ...address
            };
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated",
            user: await User.findById(user._id).select("-password")
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};
