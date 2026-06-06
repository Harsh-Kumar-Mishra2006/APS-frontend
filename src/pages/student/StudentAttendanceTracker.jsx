// src/pages/student/StudentAttendanceTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Table,
  Tag,
  Progress,
  Spin,
  Alert,
  DatePicker,
  Tabs,
  Timeline,
  Badge
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/charts';
import moment from 'moment';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TabPane } = Tabs;

const StudentAttendanceTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [error, setError] = useState(null);

  // Months array for selection
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Years array (current year and next year)
  const years = [2024, 2025, 2026, 2027];

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get student ID from user context
      const studentId = user.studentId || user.id;
      const response = await attendanceService.getStudentAttendance(studentId, {
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.success) {
        setAttendanceData(response.data);
      } else {
        setError(response.error || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching attendance');
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance percentage for progress bar
  const getAttendancePercentage = () => {
    if (!attendanceData?.summary) return 0;
    return attendanceData.summary.overallPercentage || 0;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      present: '#52c41a',
      absent: '#ff4d4f',
      late: '#faad14',
      'half-day': '#1890ff'
    };
    return colors[status] || '#d9d9d9';
  };

  // Prepare chart data
  const getMonthlyChartData = () => {
    if (!attendanceData?.monthly_records) return [];
    
    return attendanceData.monthly_records.map(record => ({
      month: record.month,
      present: record.days_present,
      absent: record.days_absent,
      total: record.total_working_days,
      percentage: parseFloat(record.percentage)
    }));
  };

  // Prepare daily timeline data
  const getDailyTimelineData = () => {
    if (!attendanceData?.recent_daily_attendance) return [];
    
    return attendanceData.recent_daily_attendance.map(day => ({
      date: moment(day.date).format('DD MMM YYYY'),
      status: day.status,
      checkIn: day.check_in_time,
      checkOut: day.check_out_time,
      remark: day.remark
    }));
  };

  // Table columns for monthly records
  const monthlyColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      sorter: (a, b) => months.indexOf(a.month) - months.indexOf(b.month)
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year
    },
    {
      title: 'Working Days',
      dataIndex: 'total_working_days',
      key: 'total_working_days',
      align: 'center'
    },
    {
      title: 'Present',
      dataIndex: 'days_present',
      key: 'days_present',
      align: 'center',
      render: (value, record) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Absent',
      dataIndex: 'days_absent',
      key: 'days_absent',
      align: 'center',
      render: (value) => (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Late',
      dataIndex: 'days_late',
      key: 'days_late',
      align: 'center',
      render: (value) => value > 0 ? (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          {value}
        </Tag>
      ) : '-'
    },
    {
      title: 'Half Day',
      dataIndex: 'days_half_day',
      key: 'days_half_day',
      align: 'center',
      render: (value) => value > 0 ? (
        <Tag color="blue">
          {value}
        </Tag>
      ) : '-'
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'center',
      render: (value) => (
        <Progress
          type="circle"
          percent={parseFloat(value)}
          width={50}
          strokeColor={value >= 75 ? '#52c41a' : value >= 60 ? '#faad14' : '#ff4d4f'}
        />
      )
    }
  ];

  // Line chart configuration
  const lineConfig = {
    data: getMonthlyChartData(),
    xField: 'month',
    yField: 'percentage',
    seriesField: 'month',
    smooth: true,
    point: { size: 5, shape: 'diamond' },
    label: {},
    title: { text: 'Monthly Attendance Trend', visible: true },
    color: '#1890ff',
    yAxis: { label: { formatter: (v) => `${v}%` } }
  };

  // Column chart for present/absent comparison
  const columnConfig = {
    data: getMonthlyChartData(),
    xField: 'month',
    yField: 'present',
    seriesField: 'month',
    isGroup: true,
    title: { text: 'Monthly Present vs Absent', visible: true },
    color: ['#52c41a', '#ff4d4f']
  };

  if (loading) {
    return (
      <div className="attendance-loading">
        <Spin size="large" tip="Loading your attendance..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Attendance"
        description={error}
        type="error"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  return (
    <div className="student-attendance-tracker">
      {/* Header */}
      <Card className="attendance-header">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <h1>
              <CalendarOutlined /> My Attendance Tracker
            </h1>
            {attendanceData?.student && (
              <p>
                <UserOutlined /> {attendanceData.student.name} | 
                Class {attendanceData.student.class}-{attendanceData.student.section} | 
                Roll No: {attendanceData.student.rollNumber}
              </p>
            )}
          </Col>
          <Col>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 120, marginRight: 10 }}
            >
              {months.map(month => (
                <Option key={month} value={month}>{month}</Option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 100 }}
            >
              {years.map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overall Attendance"
              value={getAttendancePercentage()}
              precision={2}
              suffix="%"
              valueStyle={{ color: getAttendancePercentage() >= 75 ? '#3f8600' : '#cf1322' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress
              percent={getAttendancePercentage()}
              strokeColor={getAttendancePercentage() >= 75 ? '#52c41a' : '#ff4d4f'}
              showInfo={false}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Working Days"
              value={attendanceData?.summary?.totalWorkingDays || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Days Present"
              value={attendanceData?.summary?.totalPresent || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Days Absent"
              value={attendanceData?.summary?.totalAbsent || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Current Month Statistics */}
      {attendanceData?.current_month && (
        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={24}>
            <Card title={`Current Month (${attendanceData.current_month.month} ${attendanceData.current_month.year})`}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Present"
                    value={attendanceData.current_month.present}
                    suffix={`/ ${attendanceData.current_month.total}`}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Percentage"
                    value={attendanceData.current_month.percentage}
                    suffix="%"
                    valueStyle={{ color: attendanceData.current_month.percentage >= 75 ? '#3f8600' : '#cf1322' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Late Days"
                    value={attendanceData.current_month.late || 0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Half Days"
                    value={attendanceData.current_month.halfDay || 0}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Charts Section */}
      <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
        <TabPane tab={<span><LineChartOutlined /> Monthly Trend</span>} key="1">
          <Card>
            {getMonthlyChartData().length > 0 ? (
              <Line {...lineConfig} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50 }}>No data available</div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab={<span><FileTextOutlined /> Monthly Records</span>} key="2">
          <Card>
            <Table
              columns={monthlyColumns}
              dataSource={attendanceData?.monthly_records || []}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>
        
        <TabPane tab={<span><ClockCircleOutlined /> Recent Activity</span>} key="3">
          <Card>
            <Timeline mode="left">
              {getDailyTimelineData().map((day, index) => (
                <Timeline.Item
                  key={index}
                  color={getStatusColor(day.status)}
                  label={day.date}
                >
                  <Badge status={day.status === 'present' ? 'success' : 'error'} text={day.status.toUpperCase()} />
                  {day.checkIn && <div>Check In: {day.checkIn}</div>}
                  {day.checkOut && <div>Check Out: {day.checkOut}</div>}
                  {day.remark && <div>Remark: {day.remark}</div>}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      {/* Attendance Status Legend */}
      <Card style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Tag color="green" icon={<CheckCircleOutlined />}>Present</Tag>
            <span style={{ marginLeft: 8 }}>Student was present</span>
          </Col>
          <Col span={6}>
            <Tag color="red" icon={<CloseCircleOutlined />}>Absent</Tag>
            <span style={{ marginLeft: 8 }}>Student was absent</span>
          </Col>
          <Col span={6}>
            <Tag color="orange" icon={<ClockCircleOutlined />}>Late</Tag>
            <span style={{ marginLeft: 8 }}>Came late to class</span>
          </Col>
          <Col span={6}>
            <Tag color="blue">Half Day</Tag>
            <span style={{ marginLeft: 8 }}>Left early or came late</span>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StudentAttendanceTracker;