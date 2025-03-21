import { NextResponse } from "next/server";
import { findRoboUserbyUserId, generateTokenForRoboUser } from "@/server/helpers/index";
import { getUserFromRequest } from "@/server/middleware/authenticate";



export async function GET(req) {
    try {
      // Extract user ID (assuming it's in headers or middleware added it)
      const  user  = await getUserFromRequest(req); // Or use authentication middleware
      console.log(user , "userrrrrrrrr")
  
      if (!user) {
        return NextResponse.json({ error: "User ID missing" }, { status: 400 });
      }
  
      // Fetch user from DB
      const userData = await findRoboUserbyUserId(user, "authCodeHash");
  
      if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Generate token
      const token = await generateTokenForRoboUser(userData);
  
      return NextResponse.json({ userData, token });
    } catch (err) {
      return NextResponse.json(
        { error: "Server error", details: err.message },
        { status: 500 }
      );
    }
  }
