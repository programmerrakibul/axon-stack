import { connectDB, User } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { signupSchema } from "@/modules/auth/schemas";
import { hashPassword } from "@/modules/auth/password";
import { ConflictError } from "@/shared/server/errors";

/**
 * POST /api/auth/signup
 * Register a new user account with email and password
 * Body: { email, password, confirmPassword }
 */
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  const body = await request.json();

  // Validate input using shared schema (auto-converts to ValidationError)
  const { email, password } = signupSchema.parse(body);

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user (default role is CUSTOMER)
  const user = await User.create({
    email,
    passwordHash,
  });

  // Return success response with user data (no sensitive info)
  return jsonOk(
    {
      id: user._id?.toString(),
      email: user.email,
      role: user.role,
    },
    { status: 201 },
  );
});
