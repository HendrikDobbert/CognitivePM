import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as z from "zod";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(["Not Started", "In Progress", "On Hold", "Completed"]),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    // 2. Validate request body
    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input.", issues: validation.error.issues }, { status: 400 });
    }

    const { name, description, status } = validation.data;

    // 3. Create project in Firestore
    const projectData = {
      name,
      description,
      status,
      userId,
      createdAt: new Date(),
    };

    const projectRef = await adminDb.collection("projects").add(projectData);

    // 4. Return success response
    return NextResponse.json({ id: projectRef.id, ...projectData }, { status: 201 });

  } catch (error) {
    console.error("API /api/projects POST: Error creating project:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input.", issues: error.issues }, { status: 400 });
    }
    if ((error as any).code === 'auth/session-cookie-expired' || (error as any).code === 'auth/invalid-session-cookie') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
