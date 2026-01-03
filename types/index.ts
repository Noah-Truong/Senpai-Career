export type UserRole = "student" | "obog" | "company" | "admin";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  nickname?: string;
  profilePhoto?: string;
  credits?: number;
  createdAt: Date;
}

export interface Student extends User {
  role: "student";
  university: string;
  nationality: string;
  year: number;
  languages: string[];
  interests: string[];
  pastInternships?: string[];
  skills: string[];
  desiredIndustry?: string;
  jlptLevel?: "N1" | "N2" | "N3" | "N4" | "N5";
  desiredWorkLocation?: string;
  weeklyAvailableHours?: number;
  strikes: number;
  isBanned: boolean;
}

export interface OBOG extends User {
  role: "obog";
  type: "working-professional" | "job-offer-holder";
  university: string;
  company: string;
  nationality: string;
  languages: string[];
  topics: string[]; // career advice, life advice, interview practice, etc.
  oneLineMessage: string | MultilingualContent;
  studentEraSummary?: string | MultilingualContent;
}

export interface Company extends User {
  role: "company";
  companyName: string;
  logo?: string;
  overview?: string | MultilingualContent;
  workLocation?: string;
  hourlyWage?: number;
  weeklyHours?: number;
  weeklyDays?: number;
  minRequiredHours?: number;
  internshipDetails?: string | MultilingualContent;
  newGradDetails?: string | MultilingualContent;
  idealCandidate?: string | MultilingualContent;
  sellingPoints?: string | MultilingualContent;
  oneLineMessage?: string | MultilingualContent;
}

export interface MultilingualContent {
  en: string;
  ja: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromUserId: string;
  toUserId: string;
  content: string | MultilingualContent; // Support both legacy string and multilingual
  createdAt: Date;
  read: boolean;
}

export interface MessageThread {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "internship" | "new-grad" | "message" | "system";
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  adminNotes?: string;
}

export interface Review {
  id: string;
  reviewerUserId: string;
  reviewedUserId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface InternshipListing {
  id: string;
  companyId: string;
  title: string;
  hourlyWage: number;
  workDetails: string;
  skillsGained: string[];
  whyThisCompany: string;
  companyLogo?: string;
  type: "internship" | "new-grad";
  createdAt: Date;
  applicationQuestions?: string[];
}

export interface Application {
  id: string;
  listingId: string;
  applicantId: string;
  resumeUrl?: string;
  answers: { question: string; answer: string | MultilingualContent }[];
  status: "pending" | "reviewed" | "accepted" | "rejected";
  createdAt: Date;
}

