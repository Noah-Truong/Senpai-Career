import { createClient } from "@/lib/supabase/server";
import { Application } from "@/types";

export interface ApplicationData extends Omit<Application, "createdAt"> {
  createdAt: string;
}

// Helper to transform database row to ApplicationData
function transformApplication(row: any): ApplicationData {
  return {
    id: row.id,
    listingId: row.internship_id,
    applicantId: row.user_id,
    answers: row.answers || [],
    resumeUrl: row.resume_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const readApplications = async (): Promise<ApplicationData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading applications:", error);
    return [];
  }

  return data.map(transformApplication);
};

export const saveApplication = async (
  applicationData: Omit<ApplicationData, "id" | "createdAt">
): Promise<ApplicationData> => {
  const supabase = await createClient();
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { data, error } = await supabase
    .from("applications")
    .insert({
      id: applicationId,
      internship_id: applicationData.listingId,
      user_id: applicationData.applicantId,
      answers: applicationData.answers,
      resume_url: applicationData.resumeUrl,
      status: applicationData.status || "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving application:", error);
    throw new Error("Failed to create application");
  }

  return transformApplication(data);
};

export const getApplicationById = async (id: string): Promise<ApplicationData | undefined> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return transformApplication(data);
};

export const getApplicationsByListingId = async (listingId: string): Promise<ApplicationData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("internship_id", listingId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading listing applications:", error);
    return [];
  }

  return data.map(transformApplication);
};

export const getApplicationsByApplicantId = async (applicantId: string): Promise<ApplicationData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", applicantId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading applicant applications:", error);
    return [];
  }

  return data.map(transformApplication);
};

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Omit<ApplicationData, "id" | "createdAt" | "listingId" | "applicantId">>
): Promise<ApplicationData> => {
  const supabase = await createClient();

  const updateData: any = {};
  if (updates.answers !== undefined) updateData.answers = updates.answers;
  if (updates.resumeUrl !== undefined) updateData.resume_url = updates.resumeUrl;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", applicationId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating application:", error);
    throw new Error("Application not found");
  }

  return transformApplication(data);
};
