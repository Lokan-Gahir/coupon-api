const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Update MongoDB Atlas Connection
mongoose .connect("mongodb+srv://root1:root@cluster0.wcoq4.mongodb.net/couponsDB?retryWrites=true&w=majority&appName=Cluster0") .then(() => console.log("✅ Connected to MongoDB Atlas")) .catch((err) => console.error("❌ MongoDB Atlas connection error:", err));

// 📌 Health Check Route (Test if Server is Working)
app.get("/", (req, res) => {
    res.send("✅ Server is working!");
});

// 📌 Coupon Schema
const couponSchema = new mongoose.Schema({
  code: String,
  isClaimed: { type: Boolean, default: false }
});

const Coupon = mongoose.model("Coupon", couponSchema);

// 🚀 API Route: Claim a Coupon
app.post("/claim", async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ isClaimed: false });

        if (!coupon) {
            return res.status(400).json({ message: "❌ No coupons available." });
        }

        coupon.isClaimed = true;
        await coupon.save();

        return res.json({ message: "🎉 Coupon claimed successfully!", coupon: coupon.code });
    } catch (error) {
        console.error("Error claiming coupon:", error);
        res.status(500).json({ message: "❌ Internal server error." });
    }
});

// 📌 API Route: Reset Coupons (Admin Only)
app.post("/reset", async (req, res) => {
    await Coupon.updateMany({}, { isClaimed: false });
    res.json({ message: "🔄 Coupons reset successfully!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
