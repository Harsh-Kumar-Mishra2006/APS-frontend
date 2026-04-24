// src/App.jsx
import React, { Children } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import HomeHeroPage from './components/Heropage/Homeheropage'
import Footer from './components/common/Footer'
import Login from './components/auth/login'
import Signup from './components/auth/signup'
import AddMembers from './components/Admin/AddMembers'
import ContactPage from './pages/Contact/contactPage'
import AboutUsPage from './pages/About/aboutUsPage'
import AdmissionPage from './pages/Admission/admissionsPage'
import AdminAddInfo from './components/Admin/addInfo/adminAddInfo'
import StudentData from './components/Student/studentdata'
import ParentData from './components/Parent/parentdata'
import TeacherData from './components/Teacher/teacherdata'
import UserCard from './components/common/childcard'

const App = () => {
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
              <Route path="/add-members" element={<AddMembers/>}/>
              <Route path='/add-data' element={<AdminAddInfo/>}/>
              <Route path='/student-data' element={<StudentData/>}/>
              <Route path='/parent-data' element={<ParentData/>}/>
              <Route path='/teacher-data' element={<TeacherData/>}/>
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
              <Route path="/gallery" element={<UserCard/>}>
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