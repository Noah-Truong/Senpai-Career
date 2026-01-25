import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export interface ReviewData {
  id: string;
  reviewerUserId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

/**
 * Save a review to Supabase
 */
export async function saveReview(reviewData: Omit<ReviewData, "id" | "createdAt">): Promise<ReviewData> {
  const supabase = await createClient();
  
  const reviewId = `review_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      id: reviewId,
      reviewer_id: reviewData.reviewerUserId,
      reviewee_id: reviewData.reviewedUserId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error saving review:", error);
    throw new Error(error?.message || "Failed to save review");
  }

  // Transform to ReviewData format
  return {
    id: data.id,
    reviewerUserId: data.reviewer_id,
    reviewedUserId: data.reviewee_id,
    rating: data.rating,
    comment: data.comment || undefined,
    createdAt: data.created_at,
  };
}

/**
 * Get all reviews for a user (as the reviewed user)
 */
export async function getReviewsByUserId(userId: string): Promise<ReviewData[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return (data || []).map((review) => ({
    id: review.id,
    reviewerUserId: review.reviewer_id,
    reviewedUserId: review.reviewee_id,
    rating: review.rating,
    comment: review.comment || undefined,
    createdAt: review.created_at,
  }));
}

/**
 * Get a review by reviewer and reviewed user IDs
 */
export async function getReviewByReviewerAndReviewed(
  reviewerUserId: string,
  reviewedUserId: string
): Promise<ReviewData | undefined> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("reviewer_id", reviewerUserId)
    .eq("reviewee_id", reviewedUserId)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    reviewerUserId: data.reviewer_id,
    reviewedUserId: data.reviewee_id,
    rating: data.rating,
    comment: data.comment || undefined,
    createdAt: data.created_at,
  };
}

/**
 * Get average rating for a user
 */
export async function getAverageRating(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", userId);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
  return sum / data.length;
}

