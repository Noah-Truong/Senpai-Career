import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { 
  saveReview,
  getReviewsByUserId,
  getReviewByReviewerAndReviewed,
  getAverageRating
} from "@/lib/reviews";

// GET - Fetch reviews for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const reviews = await getReviewsByUserId(userId);
    const averageRating = await getAverageRating(userId);

    return NextResponse.json({ 
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewedUserId, rating, comment } = body;

    if (!reviewedUserId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: reviewedUserId, rating" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (reviewedUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot review yourself" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await getReviewByReviewerAndReviewed(session.user.id, reviewedUserId);
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this user" },
        { status: 409 }
      );
    }

    const review = await saveReview({
      reviewerUserId: session.user.id,
      reviewedUserId,
      rating,
      comment: comment || "",
    });

    return NextResponse.json(
      { review, message: "Review submitted successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

