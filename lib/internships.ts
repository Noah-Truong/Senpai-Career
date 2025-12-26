import fs from "fs";
import path from "path";
import { InternshipListing } from "@/types";

const INTERNSHIPS_FILE = path.join(process.cwd(), "data", "internships.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(INTERNSHIPS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(INTERNSHIPS_FILE)) {
    fs.writeFileSync(INTERNSHIPS_FILE, JSON.stringify([], null, 2));
  }
};

export interface InternshipListingData extends Omit<InternshipListing, "createdAt"> {
  createdAt: string;
}

export const readInternships = (): InternshipListingData[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(INTERNSHIPS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveInternship = (internshipData: Omit<InternshipListingData, "id" | "createdAt">): InternshipListingData => {
  ensureDataDir();
  const internships = readInternships();

  const newInternship: InternshipListingData = {
    ...internshipData,
    id: `internship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  internships.push(newInternship);
  fs.writeFileSync(INTERNSHIPS_FILE, JSON.stringify(internships, null, 2));

  return newInternship;
};

export const updateInternship = (internshipId: string, updates: Partial<Omit<InternshipListingData, "id" | "createdAt" | "companyId">>): InternshipListingData => {
  ensureDataDir();
  const internships = readInternships();
  const internshipIndex = internships.findIndex(i => i.id === internshipId);

  if (internshipIndex === -1) {
    throw new Error("Internship listing not found");
  }

  internships[internshipIndex] = {
    ...internships[internshipIndex],
    ...updates,
  };

  fs.writeFileSync(INTERNSHIPS_FILE, JSON.stringify(internships, null, 2));
  return internships[internshipIndex];
};

export const deleteInternship = (internshipId: string): void => {
  ensureDataDir();
  const internships = readInternships();
  const filteredInternships = internships.filter(i => i.id !== internshipId);

  fs.writeFileSync(INTERNSHIPS_FILE, JSON.stringify(filteredInternships, null, 2));
};

export const getInternshipById = (id: string): InternshipListingData | undefined => {
  return readInternships().find(i => i.id === id);
};

export const getInternshipsByCompanyId = (companyId: string): InternshipListingData[] => {
  return readInternships().filter(i => i.companyId === companyId);
};

export const getInternshipsByType = (type: "internship" | "new-grad"): InternshipListingData[] => {
  return readInternships().filter(i => i.type === type);
};

