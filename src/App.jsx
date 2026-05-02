// src/App.jsx
import React, { Children } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import HomeHeroPage from './components/Heropage/Homeheropage'
import Footer from './components/common/Footer'
import Login from './components/auth/login'
import Signup from './components/auth/signup'
import ContactPage from './pages/Contact/contactPage'
import AboutUsPage from './pages/About/aboutUsPage'
import AdmissionPage from './pages/Admission/admissionsPage'
import StudentData from './components/Student/studentdata'
import ParentData from './components/Parent/parentdata'
import TeacherData from './components/Teacher/teacherdata'
import ChangePassword from './components/auth/changePassword'
import AddMembers from './pages/AddMembers/AddMembers'
import StudentDashboard from './pages/student/StudentDashboard'
import ParentDashboard from './pages/Parent/ParentDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import Attendance from './pages/Attendance/AddAttendance'
import FeeManagement from './pages/fee/FeeManagement'
import ResultManagement from './pages/result/ResultManagement'

const App = () => {

  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log('🎉 App loaded');
    console.log('🔐 Authentication status:', isAuthenticated);
    console.log('👤 Current user:', user?.email || 'No user logged in');
  }, [user, isAuthenticated]);
  
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar/>
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomeHeroPage />} />
              <Route path="/dashboard" element={<HomeHeroPage/>}/>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/change-password" element={<ChangePassword/>} />
              <Route path="/add-members" element={<AddMembers />} />
              <Route path='/student-data' element={<StudentData/>}/>
              <Route path='/parent-data' element={<ParentData/>}/>
              <Route path='/teacher-data' element={<TeacherData/>}/>
              <Route path='/add-attendance' element={<Attendance/>}/>
              <Route path='/student-dashboard' element={<StudentDashboard/>}/>
              <Route path='/parent-dashboard' element={<ParentDashboard/>}/>
              <Route path='/teacher-dashboard' element={<TeacherDashboard/>}/> 
              <Route path='/fee-management' element={<FeeManagement/>}/>
              <Route path='/result-management' element={<ResultManagement/>}/>
              {/* Add more routes as needed */}
              <Route path="/about" element={
                <AboutUsPage/>
              } />
              <Route path="/admissions" element={
                <AdmissionPage/>
              } />
              <Route path="/contact" 
              element={
                <ContactPage/>
              } />
              <Route path="/gallery" element={<AdmissionPage/>}>
              </Route>
            </Routes>
          </main>
          <Footer/>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App