import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Package, Save, User } from "lucide-react";
import { apiFetch } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./Account.css";

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, checkAuth } = useAuth();
    const [form, setForm] = useState({ name: "", phone: "", profileImage: "", address: "", city: "", state: "", pincode: "" });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "", phone: user.phone || "", profileImage: user.profileImage || "",
                address: user.address?.address || "", city: user.address?.city || "",
                state: user.address?.state || "", pincode: user.address?.pincode || ""
            });
        }
    }, [user]);

    const save = async e => {
        e.preventDefault();
        setSaving(true); setMessage("");
        const response = await apiFetch("/api/profile", {
            method: "PUT",
            body: JSON.stringify({
                name: form.name, phone: form.phone, profileImage: form.profileImage,
                address: { address: form.address, city: form.city, state: form.state, pincode: form.pincode }
            })
        });
        const data = await response.json();
        setSaving(false);
        setMessage(response.ok ? "Profile updated successfully." : data.message || "Update failed");
        if (response.ok) await checkAuth();
    };

    const doLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="account-page">
            <header className="account-header">
                <button onClick={() => navigate("/")}><ArrowLeft size={18}/> StyleSync</button>
                <strong>MY PROFILE</strong>
                <button onClick={doLogout}><LogOut size={17}/> Logout</button>
            </header>
            <main className="profile-container">
                <section className="profile-hero">
                    {form.profileImage ? <img src={form.profileImage} alt="Profile"/> : <div className="profile-avatar"><User size={34}/></div>}
                    <div><p className="account-eyebrow">CUSTOMER ACCOUNT</p><h1>{user?.name}</h1><span>{user?.email}</span></div>
                    <div className="profile-links"><button onClick={() => navigate("/orders")}><Package size={17}/> My Orders</button></div>
                </section>
                <form className="profile-form" onSubmit={save}>
                    <h2>Personal Information</h2>
                    <div className="profile-grid">
                        <label>Full Name<input value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></label>
                        <label>Email<input value={user?.email || ""} disabled/></label>
                        <label>Phone<input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/></label>
                        <label>Profile Image URL<input value={form.profileImage} onChange={e => setForm({...form, profileImage:e.target.value})}/></label>
                    </div>
                    <h2>Delivery Address</h2>
                    <div className="profile-grid">
                        <label className="wide">Address<textarea value={form.address} onChange={e => setForm({...form, address:e.target.value})}/></label>
                        <label>City<input value={form.city} onChange={e => setForm({...form, city:e.target.value})}/></label>
                        <label>State<input value={form.state} onChange={e => setForm({...form, state:e.target.value})}/></label>
                        <label>PIN Code<input value={form.pincode} onChange={e => setForm({...form, pincode:e.target.value})}/></label>
                    </div>
                    {message && <p className="form-message">{message}</p>}
                    <button className="save-button" disabled={saving}><Save size={17}/> {saving ? "SAVING..." : "SAVE PROFILE"}</button>
                </form>
            </main>
        </div>
    );
};

export default Profile;
