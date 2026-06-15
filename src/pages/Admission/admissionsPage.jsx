// src/pages/AdmissionPage.jsx (Updated with Dashboard Box)
import React, { useState, useEffect, useRef } from 'react';
import { 
  School, 
  Award, 
  Users, 
  BookOpen, 
  Calendar, 
  Heart, 
  ChevronRight, 
  Star, 
  CheckCircle,
  GraduationCap,
  Globe,
  Trophy,
  Music,
  Dumbbell,
  Laptop,
  FlaskConical,
  Sparkles,
  ArrowRight,
  Quote,
  Play,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  FileText,
  ClipboardList,
  Clock as ClockIcon,
  CreditCard,
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Target,
  Eye
} from 'lucide-react';
import AdmissionFormModal from '../../components/form/AdmissionFormModal';

const AdmissionPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const statsRef = useRef(null);

  // Animated counter for stats
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    years: 0,
    awards: 0
  });

  useEffect(() => {
    const animateNumbers = () => {
      const targets = {
        students: 2500,
        teachers: 150,
        years: 25,
        awards: 45
      };
      
      const duration = 2000;
      const step = 20;
      const increments = {
        students: targets.students / (duration / step),
        teachers: targets.teachers / (duration / step),
        years: targets.years / (duration / step),
        awards: targets.awards / (duration / step)
      };
      
      let current = { students: 0, teachers: 0, years: 0, awards: 0 };
      const timer = setInterval(() => {
        let allComplete = true;
        Object.keys(current).forEach(key => {
          if (current[key] < targets[key]) {
            current[key] = Math.min(current[key] + increments[key], targets[key]);
            allComplete = false;
          }
        });
        setCounts({ ...current });
        if (allComplete) clearInterval(timer);
      }, step);
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumbers();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const handleBookingClick = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmitSuccess = (data) => {
    setFormData(data);
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  // Dashboard box data
  const dashboardStats = [
    { 
      label: "Applications Received", 
      value: "1,284", 
      change: "+23%", 
      trend: "up",
      icon: <FileText className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50"
    },
    { 
      label: "Seats Available", 
      value: "156", 
      change: "-12%", 
      trend: "down",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50"
    },
    { 
      label: "Processing Time", 
      value: "3-5", 
      suffix: "days",
      change: "-2 days",
      trend: "up",
      icon: <ClockIcon className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-50"
    },
    { 
      label: "Scholarships", 
      value: "₹50L", 
      change: "+15%", 
      trend: "up",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50"
    }
  ];

  const quickActions = [
    { icon: <ClipboardList className="w-5 h-5" />, title: "New Application", desc: "Start your admission process", color: "bg-purple-600" },
    { icon: <Eye className="w-5 h-5" />, title: "Check Status", desc: "Track your application", color: "bg-blue-600" },
    { icon: <CreditCard className="w-5 h-5" />, title: "Fee Structure", desc: "View fee details", color: "bg-green-600" },
    { icon: <Calendar className="w-5 h-5" />, title: "Important Dates", desc: "Admission schedule", color: "bg-orange-600" }
  ];

  const features = [
    { icon: <Trophy className="w-8 h-8" />, title: "Academic Excellence", desc: "Consistently top results in board examinations", color: "from-yellow-500 to-orange-500" },
    { icon: <FlaskConical className="w-8 h-8" />, title: "Modern Labs", desc: "State-of-the-art science and computer labs", color: "from-blue-500 to-cyan-500" },
    { icon: <Music className="w-8 h-8" />, title: "Performing Arts", desc: "Music, dance, and drama facilities", color: "from-purple-500 to-pink-500" },
    { icon: <Dumbbell className="w-8 h-8" />, title: "Sports Complex", desc: "Indoor & outdoor sports facilities", color: "from-green-500 to-emerald-500" },
    { icon: <Laptop className="w-8 h-8" />, title: "Smart Classes", desc: "Digital classrooms with smart boards", color: "from-indigo-500 to-purple-500" },
    { icon: <Globe className="w-8 h-8" />, title: "Global Exposure", desc: "International exchange programs", color: "from-red-500 to-pink-500" }
  ];

  const testimonials = [
    {
      name: "Mrs. Priya Sharma",
      role: "Parent of Riya (Class X)",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      quote: "The holistic development approach at this school is remarkable. My daughter has excelled not just in academics but also in extracurricular activities.",
      rating: 5
    },
    {
      name: "Mr. Rajesh Kumar",
      role: "Parent of Ankit (Class XII)",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      quote: "Excellent faculty and infrastructure. The school's focus on conceptual learning rather than rote memorization is truly commendable.",
      rating: 5
    },
    {
      name: "Dr. Smita Patel",
      role: "Alumni Parent",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      quote: "Both my children studied here and are now in top universities. The foundation they received was exceptional.",
      rating: 5
    }
  ];

  const achievements = [
    { year: "2023", achievement: "CBSE School Excellence Award", icon: <Award className="w-6 h-6" /> },
    { year: "2022", achievement: "Best School in Technology Integration", icon: <Award className="w-6 h-6" /> },
    { year: "2021", achievement: "National Sports Championship Winners", icon: <Trophy className="w-6 h-6" /> },
    { year: "2020", achievement: "Green School Certification", icon: <Globe className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Admissions Open for Academic Year 2025-26</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Shape Your Child's
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"> Bright Future</span>
              </h1>
              
              <p className="text-lg text-purple-100 leading-relaxed">
                Join a community of excellence where every child discovers their potential. 
                State-of-the-art facilities, experienced faculty, and a nurturing environment 
                for holistic development.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleBookingClick}
                  className="group bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  Book Admission Registration
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => testimonialsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  Watch Virtual Tour
                </button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      src={`https://randomuser.me/api/portraits/${i%2===0 ? 'women' : 'men'}/${i}.jpg`}
                      className="w-10 h-10 rounded-full border-2 border-white"
                      alt="Parent"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">5000+ Happy Parents</p>
                  <p className="text-sm text-purple-200">Trusted by families since 1999</p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="school_pic.webp"
                  alt="School Campus"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              </div>
              
              <div className="absolute -left-10 top-20 bg-white rounded-xl shadow-xl p-4 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">98% Success Rate</p>
                    <p className="text-xs text-gray-500">In board exams</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-10 bottom-20 bg-white rounded-xl shadow-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold">1:15 Teacher Ratio</p>
                    <p className="text-xs text-gray-500">Personalized attention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{Math.floor(counts.students)}+</div>
              <p className="text-gray-600 mt-2">Students Enrolled</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{Math.floor(counts.teachers)}+</div>
              <p className="text-gray-600 mt-2">Expert Teachers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{Math.floor(counts.years)}+</div>
              <p className="text-gray-600 mt-2">Years of Excellence</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{Math.floor(counts.awards)}+</div>
              <p className="text-gray-600 mt-2">National Awards</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== NEW DASHBOARD BOX SECTION ========== */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="container mx-auto px-6">
          {/* Main Dashboard Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Admission Dashboard</h2>
                  <p className="text-purple-100 mt-1">Real-time admission insights and quick actions</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                    <p className="text-xs text-purple-200">Session</p>
                    <p className="text-white font-semibold">2025-26</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                    <p className="text-xs text-purple-200">Status</p>
                    <p className="text-green-300 font-semibold">Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gray-50">
              {dashboardStats.map((stat, idx) => (
                <div key={idx} className={`${stat.bg} rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">
                        {stat.value}
                        {stat.suffix && <span className="text-sm font-normal text-gray-500"> {stat.suffix}</span>}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <BarChart3 className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">vs last year</span>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Info */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={idx === 0 ? handleBookingClick : undefined}
                    className="group flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-purple-200"
                  >
                    <div className={`${action.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-800">Admission Progress</h4>
                  </div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-600">Seats Filled</span>
                    <span className="font-semibold text-blue-600">68%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">1,284 applications received for 1,890 seats</p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-800">Important Dates</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Application Deadline</span>
                      <span className="font-medium text-purple-600">March 31, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entrance Exam</span>
                      <span className="font-medium text-purple-600">April 15, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Result Declaration</span>
                      <span className="font-medium text-purple-600">April 30, 2025</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button inside dashboard */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleBookingClick}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ClipboardList className="w-5 h-5" />
                  Start Your Admission Application Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-400 mt-3">No registration fee • Easy 2-step process • Instant confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">We provide an environment that nurtures excellence in every aspect of a child's development</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2 mb-4">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Our Achievements</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Excellence Recognized Nationally</h2>
              <p className="text-gray-600 mb-6">We take pride in our consistent track record of excellence in education and overall development.</p>
              
              <div className="space-y-4">
                {achievements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-purple-100 rounded-full p-2 text-purple-600">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">{item.year}</p>
                      <p className="text-gray-800 font-medium">{item.achievement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=500&fit=crop"
                alt="Achievement ceremony"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">CBSE</p>
                    <p className="text-xs text-gray-500">Affiliated School</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Parents Say</h2>
            <p className="text-gray-600 text-lg">Hear from our happy parents about their children's journey with us</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <Quote className="w-10 h-10 text-purple-300 mb-4" />
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Begin the Journey?</h2>
          <p className="text-xl text-purple-100 mb-8">Limited seats available for the academic year 2025-26</p>
          <button
            onClick={handleBookingClick}
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
          >
            Register Now
            <Send className="w-5 h-5" />
          </button>
        </div>
      </section>

      

      {/* Modal Components */}
      <AdmissionFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSubmitSuccess}
      />

      {/* Success Popup */}
      {showSuccess && formData && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-5 max-w-md">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-full p-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Registration Successful!</h3>
                <p className="text-sm opacity-90 mt-1">
                  Your application has been submitted. Application Number: <strong className="font-mono">{formData.applicationNumber}</strong>
                </p>
                <p className="text-xs mt-2 opacity-80">We'll contact you within 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdmissionPage;