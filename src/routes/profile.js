import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();

// Log all requests to profile routes
router.use((req, res, next) => {
  console.log(`=== PROFILE ROUTE MIDDLEWARE ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Full URL: ${req.originalUrl}`);
  console.log(`Path: ${req.path}`);
  console.log(`Headers:`, req.headers.authorization ? 'Has Auth Token' : 'No Auth Token');
  next();
});



// Get user profile data
router.get("/", async (req, res) => {
  try {
    console.log("=== PROFILE ROUTE ACCESSED ===");
    console.log("req.user:", req.user);
    
    if (!req.user || !req.user.id) {
      console.log("❌ No user found in request");
      return res.status(401).json({ 
        error: "Unauthorized: user not found in request." 
      });
    }

    const user = req.user;
    console.log("✅ User found:", user.id, user.email);

    // Return only basic user information - no stats needed
    const profileData = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isVerified: true,
      joinedAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
      avatar: user.avatar || null,
      bio: user.bio || "",
      institution: user.institution || "",
      location: user.location || "",
      role: user.role || "Student",
      website: user.website || "",
      major: user.major || null,
      graduationYear: user.graduationYear || null,
    };

    console.log("✅ Sending profile data:", profileData);

    // Simple response with just user data
    res.json({
      success: true,
      user: profileData,
    });

  } catch (error) {
    console.error("❌ Error in profile route:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// Update user profile
router.put("/edit", async (req, res) => {
  try {
    
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: "Unauthorized: user not found in request." 
      });
    }

    const userId = req.user.id;
    const { 
      name,
      bio, 
      location, 
      institution, 
      website, 
      major,
      graduationYear,
      phoneNumber,
      academicLevel,
      fieldOfStudy,
      interests,
      avatar 
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined) {
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          error: "Name must be at least 2 characters long",
        });
      }
      updateData.name = name?.trim() || "";
    }
    
    if (bio !== undefined) updateData.bio = bio || "";
    if (location !== undefined) updateData.location = location || "";
    if (institution !== undefined) updateData.institution = institution || "";
    if (website !== undefined) updateData.website = website || "";
    if (major !== undefined) updateData.major = major || "";
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear ? parseInt(graduationYear) : null;
    if (avatar !== undefined) updateData.avatar = avatar;

    console.log("✅ Update data:", updateData);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log("✅ Profile updated successfully for user:", userId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        institution: updatedUser.institution,
        website: updatedUser.website,
        major: updatedUser.major,
        graduationYear: updatedUser.graduationYear,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });

  } catch (error) {
    console.error("❌ Error updating profile:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

router.put("/change-password", async (req, res) => {
  try {
    console.log("=== CHANGE PASSWORD ROUTE ACCESSED ===");
    console.log("req.user:", req.user?.id, req.user?.email);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: "Unauthorized: user not found in request." 
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    console.log("Password change request for user:", userId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Current password and new password are required." 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: "New password must be at least 6 characters long." 
      });
    }

    // Validate current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ 
        error: "User not found." 
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Current password is incorrect." 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    console.log("✅ Password changed successfully for user:", userId);

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("❌ Error changing password:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

export default router;

