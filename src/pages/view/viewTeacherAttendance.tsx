// src/pages/TeacherAttendancePage.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Award,
  Download,
} from "lucide-react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

const TeacherAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalWorkingDays: 0,
    totalPresent: 0,
    totalAbsent: 0,
    overallPercentage: 0,
  });
  const [viewMode, setViewMode] = useState("monthly");
  const [calendarDays, setCalendarDays] = useState([]);

  // Get current teacher ID from localStorage
  const getTeacherId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      // Try different possible ID fields
      return user.teacherId || user.id || user.teacher_id;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  // Helper: Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  // Fetch teacher attendance data
  const fetchTeacherAttendance = async () => {
    setLoading(true);
    try {
      const teacherId = getTeacherId();
      if (!teacherId) {
        toast.error("Teacher ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const monthName = getMonthName(selectedMonth);

      const response = await api.get(`/api/attendance/teacher/${teacherId}`, {
        params: {
          month: monthName,
          year: selectedYear,
        },
      });

      if (response.data.success) {
        const data = response.data.data;

        // Set teacher data
        setTeacherData(data.teacher);

        // Set monthly attendance
        setMonthlyAttendance(data.monthly_attendance || []);

        // Set daily attendance
        setDailyAttendance(data.recent_daily_attendance || []);

        // Set summary
        if (data.summary) {
          setSummary(data.summary);
        }

        // Generate calendar view for selected month using daily attendance
        generateCalendarData(data.recent_daily_attendance || []);
      } else {
        toast.error(response.data.error || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching teacher attendance:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to fetch attendance data";
      toast.error(errorMsg);

      // Set empty states on error
      setTeacherData(null);
      setMonthlyAttendance([]);
      setDailyAttendance([]);
      setCalendarDays([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar view data
  const generateCalendarData = (dailyData) => {
    try {
      const start = startOfMonth(new Date(selectedYear, selectedMonth));
      const end = endOfMonth(new Date(selectedYear, selectedMonth));
      const days = eachDayOfInterval({ start, end });

      const calendarDaysWithStatus = days.map((day) => {
        const attendance = dailyData.find((d) => {
          try {
            return isSameDay(parseISO(d.date), day);
          } catch (e) {
            return false;
          }
        });
        return {
          date: day,
          status: attendance?.status || "not_marked",
          checkInTime: attendance?.check_in_time,
          checkOutTime: attendance?.check_out_time,
          remark: attendance?.remark,
        };
      });

      setCalendarDays(calendarDaysWithStatus);
    } catch (error) {
      console.error("Error generating calendar data:", error);
      setCalendarDays([]);
    }
  };

  // Change month
  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusMap = {
      present: { class: "bg-success", text: "✅ Present", icon: "✅" },
      absent: { class: "bg-danger", text: "❌ Absent", icon: "❌" },
      late: { class: "bg-warning", text: "⏰ Late", icon: "⏰" },
      "half-day": { class: "bg-info", text: "🌓 Half Day", icon: "🌓" },
      "on-leave": { class: "bg-secondary", text: "📋 On Leave", icon: "📋" },
    };

    const defaultStatus = {
      class: "bg-secondary",
      text: "⏳ Not Marked",
      icon: "⏳",
    };
    const statusInfo = statusMap[status] || defaultStatus;

    return (
      <span className={`badge ${statusInfo.class} text-white`}>
        {statusInfo.text}
      </span>
    );
  };

  // Get status color for calendar card
  const getCalendarStatusColor = (status) => {
    const colorMap = {
      present: "bg-success text-white",
      absent: "bg-danger text-white",
      late: "bg-warning text-dark",
      "half-day": "bg-info text-dark",
      "on-leave": "bg-secondary text-white",
    };
    return colorMap[status] || "bg-light text-dark";
  };

  // Get percentage color class
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "bg-success";
    if (percentage >= 60) return "bg-warning";
    return "bg-danger";
  };

  // Get status text for percentage
  const getStatusText = (percentage) => {
    if (percentage >= 75) return "Good";
    if (percentage >= 60) return "Average";
    return "Poor";
  };

  // Download attendance report
  const downloadReport = () => {
    if (!teacherData) {
      toast.error("No data to download");
      return;
    }

    const reportData = {
      teacher: teacherData,
      period: `${getMonthName(selectedMonth)} ${selectedYear}`,
      summary: summary,
      monthly_records: monthlyAttendance,
      daily_records: dailyAttendance,
      download_date: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${teacherData.id || teacherData.databaseId}_${selectedYear}_${selectedMonth + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully");
  };

  useEffect(() => {
    fetchTeacherAttendance();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h2 className="mb-2 fw-bold">My Attendance Overview</h2>
                  <p className="text-muted mb-0">
                    Track your attendance records and performance
                  </p>
                </div>
                <button
                  className="btn btn-outline-primary"
                  onClick={downloadReport}
                  disabled={!teacherData}
                >
                  <Download size={18} className="me-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Info Card */}
      {teacherData && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-circle bg-primary text-white me-3">
                    <User size={24} />
                  </div>
                  <div>
                    <h5 className="mb-0">{teacherData.name || "N/A"}</h5>
                    <small className="text-muted">
                      Teacher ID:{" "}
                      {teacherData.id || teacherData.databaseId || "N/A"}
                    </small>
                  </div>
                </div>
                <hr />
                <div className="d-flex align-items-center mb-2">
                  <Mail size={16} className="text-muted me-2" />
                  <span>{teacherData.email || "N/A"}</span>
                </div>
                {teacherData.qualification && (
                  <div className="d-flex align-items-center">
                    <Award size={16} className="text-muted me-2" />
                    <span>{teacherData.qualification}</span>
                  </div>
                )}
                {teacherData.specialization && (
                  <div className="d-flex align-items-center mt-2">
                    <Award size={16} className="text-muted me-2" />
                    <span>Specialization: {teacherData.specialization}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="col-md-8">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card shadow-sm border-0 bg-primary text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 opacity-75">Total Working Days</h6>
                        <h3 className="mb-0">
                          {summary.totalWorkingDays || 0}
                        </h3>
                      </div>
                      <Calendar size={32} className="opacity-75" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm border-0 bg-success text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 opacity-75">Days Present</h6>
                        <h3 className="mb-0">{summary.totalPresent || 0}</h3>
                      </div>
                      <CheckCircle size={32} className="opacity-75" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm border-0 bg-info text-white h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 opacity-75">Attendance %</h6>
                        <h3 className="mb-0">
                          {summary.overallPercentage || 0}%
                        </h3>
                      </div>
                      <TrendingUp size={32} className="opacity-75" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="btn-group">
                  <button
                    className={`btn ${viewMode === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setViewMode("monthly")}
                  >
                    Monthly View
                  </button>
                  <button
                    className={`btn ${viewMode === "daily" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setViewMode("daily")}
                  >
                    Calendar View
                  </button>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => changeMonth(-1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h5 className="mb-0 fw-semibold">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </h5>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => changeMonth(1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Table View */}
      {viewMode === "monthly" && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 pt-4">
                <h5 className="mb-0 fw-semibold">Monthly Attendance Records</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Working Days</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAttendance.length > 0 ? (
                        monthlyAttendance.map((record, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{record.month}</td>
                            <td>{record.year}</td>
                            <td>{record.total_working_days}</td>
                            <td>
                              <span className="text-success fw-bold">
                                {record.days_present}
                              </span>
                            </td>
                            <td>
                              <span className="text-danger">
                                {record.days_absent}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="progress flex-grow-1"
                                  style={{ height: "6px" }}
                                >
                                  <div
                                    className={`progress-bar ${getPercentageColor(record.percentage)}`}
                                    style={{ width: `${record.percentage}%` }}
                                  />
                                </div>
                                <span className="small fw-medium">
                                  {record.percentage}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${record.percentage >= 75 ? "bg-success" : record.percentage >= 60 ? "bg-warning" : "bg-danger"} text-white`}
                              >
                                {getStatusText(record.percentage)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-5 text-muted"
                          >
                            No attendance records found for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Attendance Calendar View */}
      {viewMode === "daily" && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 pt-4">
                <h5 className="mb-0 fw-semibold">Daily Attendance Calendar</h5>
                <p className="text-muted small mb-0 mt-1">
                  Click on any day to view details
                </p>
              </div>
              <div className="card-body">
                <div
                  className="calendar-grid"
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                >
                  <div className="row g-3">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="col-md-2 col-sm-3 col-6">
                        <div
                          className={`card ${getCalendarStatusColor(day.status)} border-0 shadow-sm h-100`}
                          style={{
                            cursor: "pointer",
                            transition: "transform 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform =
                              "translateY(-2px)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                          }
                        >
                          <div className="card-body p-3 text-center">
                            <h6 className="mb-1 fw-bold">
                              {format(day.date, "dd")}
                            </h6>
                            <small className="opacity-75">
                              {format(day.date, "EEE")}
                            </small>
                            <div className="mt-2">
                              {getStatusBadge(day.status)}
                            </div>
                            {day.checkInTime && (
                              <small className="d-block mt-2">
                                <Clock size={12} className="me-1" />
                                {day.checkInTime}
                              </small>
                            )}
                            {day.remark && (
                              <small
                                className="d-block mt-1 text-truncate"
                                style={{ fontSize: "10px" }}
                              >
                                📝 {day.remark}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Daily Attendance Table (shown in monthly view) */}
      {dailyAttendance.length > 0 && viewMode === "monthly" && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 pt-4">
                <h5 className="mb-0 fw-semibold">
                  Recent Daily Attendance (Last 30 Days)
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyAttendance.slice(0, 30).map((record, index) => (
                        <tr key={index}>
                          <td className="fw-medium">
                            {(() => {
                              try {
                                return format(
                                  parseISO(record.date),
                                  "dd MMM yyyy",
                                );
                              } catch (e) {
                                return record.date || "N/A";
                              }
                            })()}
                          </td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.check_in_time || "—"}</td>
                          <td>{record.check_out_time || "—"}</td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {record.remark || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!teacherData && !loading && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <Calendar size={48} className="text-muted mb-3" />
                <h5>No Attendance Data Found</h5>
                <p className="text-muted">
                  Unable to load attendance data. Please make sure you're logged
                  in as a teacher.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          font-weight: 500;
        }

        .progress {
          background-color: #e9ecef;
          border-radius: 10px;
        }

        .progress-bar {
          transition: width 0.3s ease;
          border-radius: 10px;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TeacherAttendancePage;
