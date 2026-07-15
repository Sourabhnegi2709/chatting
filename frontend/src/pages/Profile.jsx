
import { ArrowLeft, Loader2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUserProfile, loading } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", bio: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [submitting, setSubmitting] = useState(false);

    const previewName = form.name.trim() || user?.name || "Your Name";
    const previewEmail = form.email.trim() || user?.email || "your@email.com";
    const previewBio = form.bio.trim() || "Add a short bio to tell people a bit about you.";

    useEffect(() => {
        setForm({
            name: user?.name || "",
            email: user?.email || "",
            bio: user?.bio || "",
        });
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            await updateUserProfile(form);
            setMessage({ type: "success", text: "Profile updated successfully." });
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Unable to update profile." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 p-4 md:p-6">
            <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name || "Profile"} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <User size={28} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900">{user?.name || "Guest User"}</h1>
                            <p className="text-sm text-zinc-500">{user?.email || "No email available"}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {loading ? "Refreshing your account..." : "Your profile is synced with your chat account."}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-zinc-700">
                            Full Name
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500"
                                placeholder="Enter your name"
                            />
                        </label>

                        <label className="text-sm font-medium text-zinc-700">
                            Email Address
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500"
                                placeholder="Enter your email"
                            />
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-zinc-700">
                        Bio
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows="4"
                            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500"
                            placeholder="Tell people a bit about yourself"
                        />
                    </label>

                    {message.text ? (
                        <div className={`rounded-2xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {message.text}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {submitting ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-800">Live preview</h2>
                        <span className="text-xs font-medium text-zinc-500">Changes appear here instantly</span>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white">
                                {(previewName || "U").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900">{previewName}</p>
                                <p className="text-sm text-zinc-500">{previewEmail}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-zinc-600">{previewBio}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;