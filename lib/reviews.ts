import fs from "fs";
import path from "path";
import { Review } from "@/types";
import { v4 as uuidv4 } from "uuid";

const REVIEWS_FILE = path.join(process.cwd(), "data", "reviews.json");

const ensureDataDir = () => {
  const dataDir = path.dirname(REVIEWS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([], null, 2));
  }
};

export interface ReviewData {
  id: string;
  reviewerUserId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const readReviews = (): ReviewData[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveReview = (reviewData: Omit<ReviewData, "id" | "createdAt">): ReviewData => {
  ensureDataDir();
  const reviews = readReviews();

  const newReview: ReviewData = {
    ...reviewData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));

  return newReview;
};

export const getReviewsByUserId = (userId: string): ReviewData[] => {
  const reviews = readReviews();
  return reviews.filter(r => r.reviewedUserId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getReviewByReviewerAndReviewed = (reviewerUserId: string, reviewedUserId: string): ReviewData | undefined => {
  const reviews = readReviews();
  return reviews.find(r => r.reviewerUserId === reviewerUserId && r.reviewedUserId === reviewedUserId);
};

export const getAverageRating = (userId: string): number => {
  const reviews = getReviewsByUserId(userId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
};

