import fs from "fs";
import path from "path";
import { Report } from "@/types";
import { v4 as uuidv4 } from "uuid";

const REPORTS_FILE = path.join(process.cwd(), "data", "reports.json");

const ensureDataDir = () => {
  const dataDir = path.dirname(REPORTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2));
  }
};

export const readReports = (): Report[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(REPORTS_FILE, "utf-8");
    const reports = JSON.parse(data);
    // Convert createdAt strings to Date objects
    return reports.map((report: any) => ({
      ...report,
      createdAt: new Date(report.createdAt),
    }));
  } catch (error) {
    return [];
  }
};

export const saveReport = (reportData: Omit<Report, "id" | "createdAt">): Report => {
  ensureDataDir();
  const reports = readReports();
  const report: Report = {
    ...reportData,
    id: uuidv4(),
    createdAt: new Date(),
  };
  reports.push(report);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  return report;
};

export const getReportById = (id: string): Report | undefined => {
  const reports = readReports();
  return reports.find((r) => r.id === id);
};

export const updateReport = (id: string, updates: Partial<Report>): Report | undefined => {
  ensureDataDir();
  const reports = readReports();
  const index = reports.findIndex((r) => r.id === id);

  if (index === -1) {
    return undefined;
  }

  reports[index] = {
    ...reports[index],
    ...updates,
  };
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  return reports[index];
};

export const getReportsByStatus = (status: Report["status"]): Report[] => {
  const reports = readReports();
  return reports.filter((r) => r.status === status);
};

