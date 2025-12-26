"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import Avatar from "@/components/Avatar";

interface Student {
  id: string;
  name: string;
  nickname?: string;
  profilePhoto?: string;
  university?: string;
  year?: number;
  languages?: string[];
  jlptLevel?: string;
  interests?: string[];
  skills?: string[];
  pastInternships?: string[];
  desiredIndustry?: string;
  desiredWorkLocation?: string;
  weeklyAvailableHours?: number;
  isBanned?: boolean;
}

export default function CompanyStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    languages: "",
    jlptLevel: "",
    skills: "",
    workLocation: "",
    weeklyHours: "",
    experience: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      loadStudents();
    }
  }, [status, session, router]);

  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/users?role=student");
      if (!response.ok) {
        throw new Error("Failed to load students");
      }
      const data = await response.json();
      const studentsList = (data.users || []).filter((s: Student) => !s.isBanned) as Student[];
      setAllStudents(studentsList);
      setStudents(studentsList);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters whenever filters or allStudents change
  useEffect(() => {
    let filtered = [...allStudents];

    // Filter by languages (case-insensitive partial match)
    if (filters.languages.trim()) {
      const langTerms = filters.languages.toLowerCase().split(",").map(s => s.trim());
      filtered = filtered.filter(student => {
        if (!student.languages || student.languages.length === 0) return false;
        const studentLangs = student.languages.map(l => l.toLowerCase());
        return langTerms.some(term => studentLangs.some(lang => lang.includes(term)));
      });
    }

    // Filter by JLPT Level
    if (filters.jlptLevel) {
      filtered = filtered.filter(student => student.jlptLevel === filters.jlptLevel);
    }

    // Filter by skills (case-insensitive partial match)
    if (filters.skills.trim()) {
      const skillTerms = filters.skills.toLowerCase().split(",").map(s => s.trim());
      filtered = filtered.filter(student => {
        if (!student.skills || student.skills.length === 0) return false;
        const studentSkills = student.skills.map(s => s.toLowerCase());
        return skillTerms.some(term => studentSkills.some(skill => skill.includes(term)));
      });
    }

    // Filter by work location (case-insensitive partial match)
    if (filters.workLocation.trim()) {
      const locationTerm = filters.workLocation.toLowerCase().trim();
      filtered = filtered.filter(student => {
        const location = student.desiredWorkLocation?.toLowerCase() || "";
        return location.includes(locationTerm);
      });
    }

    // Filter by weekly hours (minimum)
    if (filters.weeklyHours.trim()) {
      const minHours = parseInt(filters.weeklyHours, 10);
      if (!isNaN(minHours)) {
        filtered = filtered.filter(student => {
          return (student.weeklyAvailableHours || 0) >= minHours;
        });
      }
    }

    // Filter by experience (case-insensitive partial match in pastInternships)
    if (filters.experience.trim()) {
      const expTerm = filters.experience.toLowerCase().trim();
      filtered = filtered.filter(student => {
        if (!student.pastInternships || student.pastInternships.length === 0) return false;
        return student.pastInternships.some(exp => exp.toLowerCase().includes(expTerm));
      });
    }

    setStudents(filtered);
  }, [filters, allStudents]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>Student List</h1>
          <p className="text-gray-600">
            Search and filter students to find qualified candidates for your opportunities.
          </p>
        </div>

        {/* Filters Section */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <input
                id="languages"
                name="languages"
                type="text"
                value={filters.languages}
                onChange={handleFilterChange}
                placeholder="Japanese, English"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="jlptLevel" className="block text-sm font-medium text-gray-700 mb-2">JLPT Level</label>
              <select
                id="jlptLevel"
                name="jlptLevel"
                value={filters.jlptLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              >
                <option value="">All Levels</option>
                <option value="N1">N1</option>
                <option value="N2">N2</option>
                <option value="N3">N3</option>
                <option value="N4">N4</option>
                <option value="N5">N5</option>
              </select>
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={filters.skills}
                onChange={handleFilterChange}
                placeholder="Programming, Design"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
              <input
                id="workLocation"
                name="workLocation"
                type="text"
                value={filters.workLocation}
                onChange={handleFilterChange}
                placeholder="Tokyo, Remote"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 mb-2">Minimum Weekly Hours</label>
              <input
                id="weeklyHours"
                name="weeklyHours"
                type="number"
                value={filters.weeklyHours}
                onChange={handleFilterChange}
                placeholder="20"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
              <input
                id="experience"
                name="experience"
                type="text"
                value={filters.experience}
                onChange={handleFilterChange}
                placeholder="Past internships keywords"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
          {(filters.languages || filters.jlptLevel || filters.skills || filters.workLocation || filters.weeklyHours || filters.experience) && (
            <div className="mt-4">
              <button
                onClick={() => setFilters({ languages: "", jlptLevel: "", skills: "", workLocation: "", weeklyHours: "", experience: "" })}
                className="text-sm link-gradient"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Work Hour Rule Note */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Work Hour Guidelines:</strong> Students can work up to 28 hours/week during term, 
            up to 40 hours/week during long breaks.
          </p>
        </div>

        {loading ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg">
              {allStudents.length === 0 
                ? "No students available yet." 
                : "No students match the selected filters."}
            </p>
            <p className="text-gray-600 mt-2">
              {allStudents.length === 0 
                ? "Check back later for new candidates!" 
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start mb-4">
                  <Avatar
                    src={student.profilePhoto}
                    alt={student.nickname || student.name}
                    size="lg"
                    fallbackText={student.nickname || student.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{student.nickname || student.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{student.university}</p>
                    {student.year && (
                      <p className="text-sm text-gray-600">Year {student.year}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 space-y-2">
                  {student.languages && student.languages.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">Languages:</p>
                      <p className="text-sm text-gray-700">{student.languages.join(", ")}</p>
                    </div>
                  )}
                  
                  {student.jlptLevel && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">JLPT Level:</p>
                      <p className="text-sm text-gray-700">{student.jlptLevel}</p>
                    </div>
                  )}
                  
                  {student.interests && student.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">Interests:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{student.interests.join(", ")}</p>
                    </div>
                  )}
                  
                  {student.skills && student.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {student.pastInternships && student.pastInternships.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">Experience:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{student.pastInternships.join(", ")}</p>
                    </div>
                  )}
                </div>

                <Link
                  href={`/messages/new?studentId=${student.id}`}
                  className="btn-primary w-full inline-block text-center"
                >
                  Send Message
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

