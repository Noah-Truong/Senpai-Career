import { createClient } from "@/lib/supabase/server";
import { Report } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Helper to transform database row to Report
function transformReport(row: any): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reportedUserId: row.reported_user_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: new Date(row.created_at),
  };
}

export const readReports = async (): Promise<Report[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading reports:", error);
    return [];
  }

  return data.map(transformReport);
};

export const saveReport = async (reportData: Omit<Report, "id" | "createdAt">): Promise<Report> => {
  const supabase = await createClient();
  const reportId = uuidv4();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      id: reportId,
      reporter_id: reportData.reporterId,
      reported_user_id: reportData.reportedUserId,
      reason: reportData.reason,
      details: reportData.details,
      status: reportData.status || "pending",
      admin_notes: reportData.adminNotes,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving report:", error);
    throw new Error("Failed to create report");
  }

  return transformReport(data);
};

export const getReportById = async (id: string): Promise<Report | undefined> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return transformReport(data);
};

export const updateReport = async (id: string, updates: Partial<Report>): Promise<Report | undefined> => {
  const supabase = await createClient();

  const updateData: any = {};
  if (updates.reason !== undefined) updateData.reason = updates.reason;
  if (updates.details !== undefined) updateData.details = updates.details;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.adminNotes !== undefined) updateData.admin_notes = updates.adminNotes;

  const { data, error } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating report:", error);
    return undefined;
  }

  return transformReport(data);
};

export const getReportsByStatus = async (status: Report["status"]): Promise<Report[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading reports by status:", error);
    return [];
  }

  return data.map(transformReport);
};
