import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Report } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Helper to transform database row to Report
function transformReport(row: any): Report {
  return {
    id: row.id,
    reporterUserId: row.reporter_id,
    reportedUserId: row.reported_user_id,
    reportType: undefined, // report_type column doesn't exist in schema
    reason: row.reason,
    description: row.details || row.description,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: new Date(row.created_at),
  };
}

export const readReports = async (useAdminClient: boolean = false): Promise<Report[]> => {
  try {
    const supabase = useAdminClient ? createAdminClient() : await createClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading reports:", error);
      console.error("Using admin client:", useAdminClient);
      return [];
    }

    if (!data) {
      console.warn("No data returned from reports query");
      return [];
    }

    console.log(`Successfully fetched ${data.length} reports (admin: ${useAdminClient})`);
    return data.map(transformReport);
  } catch (err: any) {
    console.error("Exception in readReports:", err);
    return [];
  }
};

export const saveReport = async (reportData: Omit<Report, "id" | "createdAt">): Promise<Report> => {
  const supabase = await createClient();
  const reportId = uuidv4();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      id: reportId,
      reporter_id: reportData.reporterUserId,
      reported_user_id: reportData.reportedUserId,
      reason: reportData.reason,
      details: reportData.description,
      status: reportData.status || "pending",
      admin_notes: reportData.adminNotes || null,
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

export const updateReport = async (id: string, updates: Partial<Report>, useAdminClient: boolean = false): Promise<Report | undefined> => {
  const supabase = useAdminClient ? createAdminClient() : await createClient();

  const updateData: any = {};
  if (updates.reason !== undefined) updateData.reason = updates.reason;
  if (updates.description !== undefined) updateData.details = updates.description;
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
