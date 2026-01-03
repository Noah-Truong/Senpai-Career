import fs from "fs";
import path from "path";
import { Application } from "@/types";

const APPLICATIONS_FILE = path.join(process.cwd(), "data", "applications.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(APPLICATIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([], null, 2));
  }
};

export interface ApplicationData extends Omit<Application, "createdAt"> {
  createdAt: string;
}

export const readApplications = (): ApplicationData[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(APPLICATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveApplication = (applicationData: Omit<ApplicationData, "id" | "createdAt">): ApplicationData => {
  ensureDataDir();
  const applications = readApplications();

  const newApplication: ApplicationData = {
    ...applicationData,
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  applications.push(newApplication);
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));

  return newApplication;
};

export const getApplicationById = (id: string): ApplicationData | undefined => {
  return readApplications().find(a => a.id === id);
};

export const getApplicationsByListingId = (listingId: string): ApplicationData[] => {
  return readApplications().filter(a => a.listingId === listingId);
};

export const getApplicationsByApplicantId = (applicantId: string): ApplicationData[] => {
  return readApplications().filter(a => a.applicantId === applicantId);
};

export const updateApplication = (applicationId: string, updates: Partial<Omit<ApplicationData, "id" | "createdAt" | "listingId" | "applicantId">>): ApplicationData => {
  ensureDataDir();
  const applications = readApplications();
  const applicationIndex = applications.findIndex(a => a.id === applicationId);

  if (applicationIndex === -1) {
    throw new Error("Application not found");
  }

  applications[applicationIndex] = {
    ...applications[applicationIndex],
    ...updates,
  };

  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
  return applications[applicationIndex];
};

