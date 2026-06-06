// src/pages/parent/ParentAttendanceView.jsx
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
  Avatar
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import moment from 'moment';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TabPane } = Tabs;

const ParentAttendanceView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [childrenData, setChildrenData] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChildrenAttendance();
  }, []);

  const fetchChildrenAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getParentChildrenAttendance();
      if (response.success) {
        setChildrenData(response.data);
        if (response.data.children.length > 0) {
          setSelectedChild(response.data.children[0]);
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching children attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: '#52c41a',
      absent: '#ff4d4f',
      late: '#faad14',
      'half-day': '#1890ff'
    };
    return colors[status] || '#d9d9d9';
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
      title: 'Present',
      dataIndex: 'days_present',
      key: 'present',
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Absent',
      dataIndex: 'days_absent',
      key: 'absent',
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" tip="Loading children attendance..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  return (
    <div className="parent-attendance-view">
      <Card>
        <h1><TeamOutlined /> My Children's Attendance</h1>
        <p>Track attendance for all your children</p>
      </Card>

      {childrenData?.children && (
        <>
          {/* Children Selection */}
          <Card style={{ marginTop: 20 }}>
            <Row gutter={16}>
              {childrenData.children.map((child, index) => (
                <Col span={6} key={index}>
                  <Card
                    hoverable
                    onClick={() => setSelectedChild(child)}
                    style={{
                      cursor: 'pointer',
                      border: selectedChild === child ? '2px solid #1890ff' : 'none'
                    }}
                  >
                    <Row align="middle">
                      <Col span={8}>
                        <Avatar size={48} icon={<UserOutlined />} />
                      </Col>
                      <Col span={16}>
                        <h3>{child.student.name}</h3>
                        <p>Class {child.student.class}-{child.student.section}</p>
                        <p>Roll No: {child.student.rollNumber}</p>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Selected Child Details */}
          {selectedChild && (
            <>
              <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Overall Attendance"
                      value={selectedChild.summary.overallPercentage}
                      precision={2}
                      suffix="%"
                      valueStyle={{ 
                        color: selectedChild.summary.overallPercentage >= 75 ? '#3f8600' : '#cf1322' 
                      }}
                    />
                    <Progress percent={selectedChild.summary.overallPercentage} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Working Days"
                      value={selectedChild.summary.totalWorkingDays}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Days Present"
                      value={selectedChild.summary.totalPresent}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Days Absent"
                      value={selectedChild.summary.totalAbsent}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
                <TabPane tab="Monthly Records" key="1">
                  <Card>
                    <Table
                      columns={monthlyColumns}
                      dataSource={selectedChild.monthly_attendance}
                      rowKey="id"
                      pagination={false}
                    />
                  </Card>
                </TabPane>

                <TabPane tab="Recent Activity" key="2">
                  <Card>
                    <Timeline>
                      {selectedChild.recent_attendance?.map((day, index) => (
                        <Timeline.Item
                          key={index}
                          color={getStatusColor(day.status)}
                          label={moment(day.date).format('DD MMM YYYY')}
                        >
                          <Badge 
                            status={day.status === 'present' ? 'success' : 'error'} 
                            text={day.status.toUpperCase()} 
                          />
                          {day.check_in_time && <div>Check In: {day.check_in_time}</div>}
                          {day.check_out_time && <div>Check Out: {day.check_out_time}</div>}
                          {day.remark && <div>Remark: {day.remark}</div>}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </TabPane>

                <TabPane tab="Summary Report" key="3">
                  <Card>
                    <Alert
                      message="Attendance Summary Report"
                      description={
                        <div style={{ marginTop: 10 }}>
                          <p><strong>Student:</strong> {selectedChild.student.name}</p>
                          <p><strong>Class & Section:</strong> {selectedChild.student.class}-{selectedChild.student.section}</p>
                          <p><strong>Roll Number:</strong> {selectedChild.student.rollNumber}</p>
                          <hr />
                          <p><strong>Overall Performance:</strong></p>
                          <ul>
                            <li>Total Working Days: {selectedChild.summary.totalWorkingDays}</li>
                            <li>Days Present: {selectedChild.summary.totalPresent}</li>
                            <li>Days Absent: {selectedChild.summary.totalAbsent}</li>
                            <li>Days Late: {selectedChild.summary.totalLate}</li>
                            <li>Half Days: {selectedChild.summary.totalHalfDay}</li>
                            <li><strong>Attendance Percentage: {selectedChild.summary.overallPercentage}%</strong></li>
                          </ul>
                          {selectedChild.summary.overallPercentage < 75 && (
                            <Alert
                              message="Attention Required"
                              description="Attendance is below 75%. Please ensure regular attendance."
                              type="warning"
                              showIcon
                            />
                          )}
                        </div>
                      }
                      type="info"
                    />
                  </Card>
                </TabPane>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ParentAttendanceView;