import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { saveReport, readReports, updateReport } from "@/lib/reports";
import { getUserById } from "@/lib/users";

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportedUserId, reportType, reason, description } = body;

    if (!reportedUserId || !reason || !description) {
      return NextResponse.json(
        { error: "Missing required fields: reportedUserId, reason, and description are required" },
        { status: 400 }
      );
    }

    // For user reports, verify the reported user exists
    if (reportedUserId !== "PLATFORM") {
      const reportedUser = getUserById(reportedUserId);
      if (!reportedUser) {
        return NextResponse.json({ error: "Reported user not found" }, { status: 404 });
      }

      // Prevent self-reporting
      if (reportedUserId === session.user.id) {
        return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
      }
    }

    const report = saveReport({
      reportedUserId,
      reporterUserId: session.user.id,
      reportType: reportType || "user",
      reason,
      description,
      status: "pending",
    });

    return NextResponse.json({ report, message: "Report submitted successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}

// GET - Fetch reports (admin only, or own reports for regular users)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let reports = readReports();

    // If admin, return all reports (optionally filtered by status)
    if (session.user.role === "admin") {
      if (statusFilter) {
        reports = reports.filter((r) => r.status === statusFilter);
      }
      // Enrich with user info
      const enrichedReports = reports.map((report) => {
        const reporter = getUserById(report.reporterUserId);
        const reported = getUserById(report.reportedUserId);
        return {
          ...report,
          reporter: reporter ? { id: reporter.id, name: reporter.name, email: reporter.email, role: reporter.role } : null,
          reported: reported ? { id: reported.id, name: reported.name, email: reported.email, role: reported.role } : null,
        };
      });
      return NextResponse.json({ reports: enrichedReports });
    }

    // Regular users can only see their own reports
    reports = reports.filter((r) => r.reporterUserId === session.user.id);
    if (statusFilter) {
      reports = reports.filter((r) => r.status === statusFilter);
    }

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// PUT - Update report status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) {
      updates.status = status;
    }
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    const updatedReport = updateReport(id, updates);

    if (!updatedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report: updatedReport, message: "Report updated successfully" });
  } catch (error: any) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update report" },
      { status: 500 }
    );
  }
}

