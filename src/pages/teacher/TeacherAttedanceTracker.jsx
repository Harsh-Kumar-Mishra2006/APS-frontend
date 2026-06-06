// src/pages/teacher/TeacherAttendanceTracker.jsx
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
  Tabs,
  Timeline,
  Badge,
  Button,
  Modal,
  Form,
  DatePicker,
  Radio
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import moment from 'moment';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { TabPane } = Tabs;

const TeacherAttendanceTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [classAttendance, setClassAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [markModalVisible, setMarkModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = [2024, 2025, 2026, 2027];
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    fetchTeacherAttendance();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchClassAttendance();
    }
  }, [selectedClass, selectedSection, selectedMonth, selectedYear]);

  const fetchTeacherAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const teacherId = user.teacherId || user.id;
      const response = await attendanceService.getTeacherAttendance(teacherId, {
        month: selectedMonth,
        year: selectedYear
      });
      
      if (response.success) {
        setAttendanceData(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAttendance = async () => {
    try {
      const response = await attendanceService.getClassAttendance(
        selectedClass,
        selectedSection,
        { month: selectedMonth, year: selectedYear }
      );
      
      if (response.success) {
        setClassAttendance(response.data);
      }
    } catch (err) {
      console.error('Error fetching class attendance:', err);
    }
  };

  const handleMarkOwnAttendance = async (values) => {
    try {
      const response = await attendanceService.markTeacherAttendance({
        teacherId: user.teacherId || user.id,
        date: values.date.format('YYYY-MM-DD'),
        status: values.status,
        checkInTime: values.checkInTime,
        checkOutTime: values.checkOutTime,
        remark: values.remark
      });
      
      if (response.success) {
        Modal.success({
          title: 'Success',
          content: 'Your attendance has been marked successfully'
        });
        setMarkModalVisible(false);
        form.resetFields();
        fetchTeacherAttendance();
      }
    } catch (err) {
      Modal.error({
        title: 'Error',
        content: err.response?.data?.error || 'Failed to mark attendance'
      });
    }
  };

  const exportToExcel = () => {
    const exportData = attendanceData?.monthly_attendance?.map(record => ({
      Month: record.month,
      Year: record.year,
      'Working Days': record.total_working_days,
      Present: record.days_present,
      Absent: record.days_absent,
      Percentage: `${record.percentage}%`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, `attendance_report_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const monthlyColumns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month'
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: 'Working Days',
      dataIndex: 'total_working_days',
      key: 'total_working_days'
    },
    {
      title: 'Present',
      dataIndex: 'days_present',
      key: 'days_present',
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Absent',
      dataIndex: 'days_absent',
      key: 'days_absent',
      render: (value) => <Tag color="red">{value}</Tag>
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value) => (
        <Progress percent={parseFloat(value)} size="small" />
      )
    }
  ];

  const getAttendancePercentage = () => {
    if (!attendanceData?.summary) return 0;
    return attendanceData.summary.overallPercentage || 0;
  };

  const lineConfig = {
    data: attendanceData?.monthly_attendance?.map(record => ({
      month: record.month,
      percentage: parseFloat(record.percentage)
    })) || [],
    xField: 'month',
    yField: 'percentage',
    smooth: true,
    point: { size: 5 },
    yAxis: { label: { formatter: (v) => `${v}%` } }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" tip="Loading attendance data..." />
      </div>
    );
  }

  return (
    <div className="teacher-attendance-tracker">
      <Card>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <h1><CalendarOutlined /> Teacher Attendance Tracker</h1>
            {attendanceData?.teacher && (
              <p><UserOutlined /> {attendanceData.teacher.name} | {attendanceData.teacher.email}</p>
            )}
          </Col>
          <Col>
            <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 120, marginRight: 10 }}>
              {months.map(month => <Option key={month} value={month}>{month}</Option>)}
            </Select>
            <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100, marginRight: 10 }}>
              {years.map(year => <Option key={year} value={year}>{year}</Option>)}
            </Select>
            <Button icon={<ExportOutlined />} onClick={exportToExcel}>Export</Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTeacherAttendance} 
              style={{ marginLeft: 10 }}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              onClick={() => setMarkModalVisible(true)} 
              style={{ marginLeft: 10 }}
            >
              Mark Today's Attendance
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Overall Attendance"
              value={getAttendancePercentage()}
              precision={2}
              suffix="%"
              valueStyle={{ color: getAttendancePercentage() >= 75 ? '#3f8600' : '#cf1322' }}
            />
            <Progress percent={getAttendancePercentage()} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Working Days"
              value={attendanceData?.summary?.totalWorkingDays || 0}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Days Present"
              value={attendanceData?.summary?.totalPresent || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
        <TabPane tab="My Attendance Trend" key="1">
          <Card>
            {attendanceData?.monthly_attendance?.length > 0 ? (
              <Line {...lineConfig} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50 }}>No data available</div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="Monthly Records" key="2">
          <Card>
            <Table
              columns={monthlyColumns}
              dataSource={attendanceData?.monthly_attendance || []}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Recent Activity" key="3">
          <Card>
            <Timeline>
              {attendanceData?.recent_daily_attendance?.map((day, index) => (
                <Timeline.Item
                  key={index}
                  color={day.status === 'present' ? 'green' : 'red'}
                  label={moment(day.date).format('DD MMM YYYY')}
                >
                  <Badge 
                    status={day.status === 'present' ? 'success' : 'error'} 
                    text={day.status.toUpperCase()} 
                  />
                  {day.check_in_time && <div>Check In: {day.check_in_time}</div>}
                  {day.check_out_time && <div>Check Out: {day.check_out_time}</div>}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>

        {user.role === 'teacher' && (
          <TabPane tab={<span><TeamOutlined /> My Class Attendance</span>} key="4">
            <Card>
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={8}>
                  <Select
                    placeholder="Select Class"
                    style={{ width: '100%' }}
                    onChange={setSelectedClass}
                    value={selectedClass}
                  >
                    {classes.map(cls => <Option key={cls} value={cls}>Class {cls}</Option>)}
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="Select Section"
                    style={{ width: '100%' }}
                    onChange={setSelectedSection}
                    value={selectedSection}
                  >
                    {sections.map(section => <Option key={section} value={section}>Section {section}</Option>)}
                  </Select>
                </Col>
              </Row>
              
              {classAttendance?.students && (
                <>
                  <Alert
                    message={`Class ${selectedClass}-${selectedSection} Attendance Summary`}
                    description={
                      <Row gutter={16} style={{ marginTop: 10 }}>
                        <Col span={6}>Total Students: {classAttendance.total_students}</Col>
                        <Col span={6}>Present: {classAttendance.summary?.present || 0}</Col>
                        <Col span={6}>Absent: {classAttendance.summary?.absent || 0}</Col>
                        <Col span={6}>
                          Attendance: {classAttendance.summary?.attendance_percentage || 0}%
                        </Col>
                      </Row>
                    }
                    type="info"
                    style={{ marginBottom: 20 }}
                  />
                  
                  <Table
                    columns={[
                      { title: 'Roll No', dataIndex: ['student', 'rollNumber'], key: 'roll' },
                      { title: 'Student Name', dataIndex: ['student', 'name'], key: 'name' },
                      { 
                        title: 'Attendance Status', 
                        dataIndex: ['attendance', 'status'],
                        key: 'status',
                        render: (status) => (
                          <Tag color={
                            status === 'present' ? 'green' :
                            status === 'absent' ? 'red' :
                            status === 'late' ? 'orange' : 'blue'
                          }>
                            {status?.toUpperCase() || 'NOT MARKED'}
                          </Tag>
                        )
                      },
                      {
                        title: 'Percentage',
                        dataIndex: ['attendance', 'percentage'],
                        key: 'percentage',
                        render: (value) => value ? `${value}%` : '-'
                      }
                    ]}
                    dataSource={classAttendance.students}
                    rowKey="student.id"
                  />
                </>
              )}
            </Card>
          </TabPane>
        )}
      </Tabs>

      {/* Mark Attendance Modal */}
      <Modal
        title="Mark Today's Attendance"
        open={markModalVisible}
        onCancel={() => setMarkModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleMarkOwnAttendance}>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
            initialValue={moment()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="present"
          >
            <Radio.Group>
              <Radio value="present">Present</Radio>
              <Radio value="absent">Absent</Radio>
              <Radio value="late">Late</Radio>
              <Radio value="half-day">Half Day</Radio>
              <Radio value="on-leave">On Leave</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item name="checkInTime" label="Check In Time">
            <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="checkOutTime" label="Check Out Time">
            <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="remark" label="Remark">
            <textarea rows={3} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Attendance
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherAttendanceTracker;