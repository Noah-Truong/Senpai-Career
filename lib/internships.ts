import { createClient } from "@/lib/supabase/server";
import { InternshipListing } from "@/types";

export interface InternshipListingData extends Omit<InternshipListing, "createdAt"> {
  createdAt: string;
}

// Helper to transform database row to InternshipListingData
function transformInternship(row: any): InternshipListingData {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    compensationType: row.compensation_type,
    otherCompensation: row.other_compensation,
    workDetails: row.work_details,
    skillsGained: row.skills_gained || [],
    whyThisCompany: row.why_this_company,
    type: row.type,
    createdAt: row.created_at,
  };
}

export const readInternships = async (): Promise<InternshipListingData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading internships:", error);
    return [];
  }

  return data.map(transformInternship);
};

export const saveInternship = async (
  internshipData: Omit<InternshipListingData, "id" | "createdAt">
): Promise<InternshipListingData> => {
  const supabase = await createClient();
  const internshipId = `internship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { data, error } = await supabase
    .from("internships")
    .insert({
      id: internshipId,
      company_id: internshipData.companyId,
      title: internshipData.title,
      compensation_type: internshipData.compensationType,
      other_compensation: internshipData.otherCompensation,
      work_details: internshipData.workDetails,
      skills_gained: internshipData.skillsGained || [],
      why_this_company: internshipData.whyThisCompany,
      type: internshipData.type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving internship:", error);
    throw new Error("Failed to create internship listing");
  }

  return transformInternship(data);
};

export const updateInternship = async (
  internshipId: string,
  updates: Partial<Omit<InternshipListingData, "id" | "createdAt" | "companyId">>
): Promise<InternshipListingData> => {
  const supabase = await createClient();

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.compensationType !== undefined) updateData.compensation_type = updates.compensationType;
  if (updates.otherCompensation !== undefined) updateData.other_compensation = updates.otherCompensation;
  if (updates.workDetails !== undefined) updateData.work_details = updates.workDetails;
  if (updates.skillsGained !== undefined) updateData.skills_gained = updates.skillsGained;
  if (updates.whyThisCompany !== undefined) updateData.why_this_company = updates.whyThisCompany;
  if (updates.type !== undefined) updateData.type = updates.type;

  const { data, error } = await supabase
    .from("internships")
    .update(updateData)
    .eq("id", internshipId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating internship:", error);
    throw new Error("Internship listing not found");
  }

  return transformInternship(data);
};

export const deleteInternship = async (internshipId: string): Promise<void> => {
  const supabase = await createClient();
  const { error } = await supabase.from("internships").delete().eq("id", internshipId);

  if (error) {
    console.error("Error deleting internship:", error);
  }
};

export const getInternshipById = async (id: string): Promise<InternshipListingData | undefined> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return transformInternship(data);
};

export const getInternshipsByCompanyId = async (companyId: string): Promise<InternshipListingData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading company internships:", error);
    return [];
  }

  return data.map(transformInternship);
};

export const getInternshipsByType = async (type: "internship" | "new-grad"): Promise<InternshipListingData[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error reading internships by type:", error);
    return [];
  }

  return data.map(transformInternship);
};
