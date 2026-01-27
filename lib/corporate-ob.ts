import { createClient } from "@/lib/supabase/server";

export interface CorporateOB {
  id: string;
  userId: string;
  companyId: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  description?: string;
  website?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  obCount?: number; // Number of corporate OBs for this company
}

/**
 * Check if a user is a Corporate OB
 */
export async function isCorporateOB(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("corporate_obs")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Get Corporate OB record for a user
 */
export async function getCorporateOBByUserId(userId: string): Promise<CorporateOB | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("corporate_obs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    companyId: data.company_id,
    isVerified: data.is_verified,
    createdAt: data.created_at,
  };
}

/**
 * Get company for a Corporate OB user
 */
export async function getCorporateOBCompany(userId: string): Promise<Company | null> {
  const supabase = await createClient();
  
  const corporateOB = await getCorporateOBByUserId(userId);
  if (!corporateOB) {
    return null;
  }

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", corporateOB.companyId)
    .single();

  if (error || !data) {
    return null;
  }

  // Get OB count for this company
  const { count } = await supabase
    .from("corporate_obs")
    .select("*", { count: "exact", head: true })
    .eq("company_id", data.id);

  return {
    id: data.id,
    name: data.name,
    logoUrl: data.logo_url,
    industry: data.industry,
    description: data.description,
    website: data.website,
    stripeCustomerId: data.stripe_customer_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    obCount: count || 0,
  };
}

/**
 * Get all companies with OB count
 */
export async function getCompaniesWithOBCount(): Promise<Company[]> {
  const supabase = await createClient();
  
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !companies) {
    return [];
  }

  // Get OB count for each company
  const companiesWithCount = await Promise.all(
    companies.map(async (company) => {
      const { count } = await supabase
        .from("corporate_obs")
        .select("*", { count: "exact", head: true })
        .eq("company_id", company.id);

      return {
        id: company.id,
        name: company.name,
        logoUrl: company.logo_url,
        industry: company.industry,
        description: company.description,
        website: company.website,
        stripeCustomerId: company.stripe_customer_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
        obCount: count || 0,
      };
    })
  );

  // Sort by OB count descending
  return companiesWithCount.sort((a, b) => (b.obCount || 0) - (a.obCount || 0));
}

/**
 * Get all Corporate OBs for a company
 */
export async function getCorporateOBsByCompany(companyId: string): Promise<CorporateOB[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("corporate_obs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((ob) => ({
    id: ob.id,
    userId: ob.user_id,
    companyId: ob.company_id,
    isVerified: ob.is_verified,
    createdAt: ob.created_at,
  }));
}
