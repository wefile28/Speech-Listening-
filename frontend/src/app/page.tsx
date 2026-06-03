"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { 
  User, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Award,
  History,
  FileText
} from "lucide-react";

interface SeededStudent {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  age: number;
}

interface SeededSession {
  id: string;
  student_id: string;
  evaluator_name: string;
  speaking_percentage: number;
  listening_percentage: number;
  suggested_level: string;
  assessment_type: string;
  created_at: string;
  student?: SeededStudent;
}

const monthsThai = [
  { value: "01", label: "ม.ค. (Jan)" },
  { value: "02", label: "ก.พ. (Feb)" },
  { value: "03", label: "มี.ค. (Mar)" },
  { value: "04", label: "เม.ย. (Apr)" },
  { value: "05", label: "พ.ค. (May)" },
  { value: "06", label: "มิ.ย. (Jun)" },
  { value: "07", label: "ก.ค. (Jul)" },
  { value: "08", label: "ส.ค. (Aug)" },
  { value: "09", label: "ก.ย. (Sep)" },
  { value: "10", label: "ต.ค. (Oct)" },
  { value: "11", label: "พ.ย. (Nov)" },
  { value: "12", label: "ธ.ค. (Dec)" }
];

const yearsList = [
  { value: "2024", label: "2024 (2567)" },
  { value: "2025", label: "2025 (2568)" },
  { value: "2026", label: "2026 (2569)" },
  { value: "2027", label: "2027 (2570)" },
  { value: "2028", label: "2028 (2571)" },
  { value: "2029", label: "2029 (2572)" },
  { value: "2030", label: "2030 (2573)" }
];

export default function Home() {
  const router = useRouter();
  const { studentInfo, setStudentInfo, setStep } = useAssessmentStore();
  
  const [history, setHistory] = useState<SeededSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const dateParts = (studentInfo.date_of_assessment || "").split("-");
  const yyyy = dateParts[0] || "2026";
  const mm = dateParts[1] || "06";
  const dd = dateParts[2] || "03";

  // Load history from FastAPI Backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const studentsRes = await fetch("http://127.0.0.1:8000/api/v1/students");
        const sessionsRes = await fetch("http://127.0.0.1:8000/api/v1/sessions");
        
        if (studentsRes.ok && sessionsRes.ok) {
          const studentsList: SeededStudent[] = await studentsRes.json();
          const sessionsList: SeededSession[] = await sessionsRes.json();
          
          const mappedSessions = sessionsList.map(session => {
            const student = studentsList.find(s => s.id === session.student_id);
            return { ...session, student };
          });
          
          setHistory(mappedSessions);
        }
      } catch (err) {
        console.error("Failed to load historical sessions:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.first_name || !studentInfo.last_name || !studentInfo.nickname) {
      alert("กรุณากรอกข้อมูลส่วนตัวของนักเรียนให้ครบถ้วน");
      return;
    }

    try {
      // 1. Save student to backend database (Offline SQLite)
      const res = await fetch("http://127.0.0.1:8000/api/v1/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: studentInfo.first_name,
          last_name: studentInfo.last_name,
          nickname: studentInfo.nickname,
          age: studentInfo.age,
          guardian_phone: studentInfo.guardian_phone || "0000000000",
          guardian_name: studentInfo.guardian_name || "",
          guardian_email: studentInfo.guardian_email || "",
        }),
      });

      if (res.ok) {
        const dbStudent = await res.json();
        sessionStorage.setItem("current_student_id", dbStudent.id);
        
        // Start assessment
        setStep(2);
        router.push("/assessment");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน");
      }
    } catch (err) {
      console.error("API Error:", err);
      // Fallback in case backend is offline
      sessionStorage.setItem("current_student_id", "fallback-offline-id");
      setStep(2);
      router.push("/assessment");
    }
  };

  const handleViewPastReport = (sessionId: string) => {
    router.push(`/report?sessionId=${sessionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* Decorative giraffe spots ambient decoration */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-3xl bg-giraffe-yellow/10 rotate-12 blur-md animate-float-slow" />
      <div className="absolute bottom-10 left-10 w-32 h-32 rounded-3xl bg-giraffe-brown/5 -rotate-12 blur-md animate-float-slow" style={{ animationDelay: "2s" }} />

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 z-10">
        
        {/* Left Side: Registration Form */}
        <div className="md:col-span-7 giraffe-glass p-6 md:p-8 rounded-3xl shadow-xl border border-white/60 space-y-6 animate-fade-in-up">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-giraffe-yellow flex items-center justify-center text-white text-2xl shadow-md animate-bounce">
              🦒
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-giraffe-brown-dark flex items-center gap-1.5">
                Speak<span className="text-giraffe-yellow-dark">&</span>Listen
              </h1>
              <p className="text-xs text-giraffe-brown/70 tracking-wide font-light uppercase">
                1-on-1 Placement & Leveling Tool
              </p>
            </div>
          </div>

          <div className="border-b border-giraffe-brown/10 pb-4">
            <h2 className="text-xl font-bold text-giraffe-brown-dark flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-giraffe-yellow-dark" />
              ลงทะเบียนนักเรียน (Student Registration)
            </h2>
            <p className="text-xs text-giraffe-brown/60 mt-1 font-light">
              กรอกประวัติส่วนตัวของนักเรียนเพื่อเปิดห้องประเมินผลสัมภาษณ์ออฟไลน์แบบตัวต่อตัว
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-giraffe-yellow-dark" /> ชื่อจริง (First Name) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarawut"
                  className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm transition-all"
                  value={studentInfo.first_name}
                  onChange={(e) => setStudentInfo({ first_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-giraffe-yellow-dark" /> นามสกุล (Last Name) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rakdee"
                  className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm transition-all"
                  value={studentInfo.last_name}
                  onChange={(e) => setStudentInfo({ last_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  🦒 ชื่อเล่นเด็ก (Nickname) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Tee"
                  className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm transition-all"
                  value={studentInfo.nickname}
                  onChange={(e) => setStudentInfo({ nickname: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  🎂 อายุ / Age (ปี) *
                </label>
                <input 
                  type="number" 
                  required
                  min="2"
                  max="18"
                  className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm transition-all"
                  value={studentInfo.age}
                  onChange={(e) => setStudentInfo({ age: parseInt(e.target.value) || 5 })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-giraffe-yellow-dark" /> วันที่ทำการประเมิน (Assessment Date)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Day Select */}
                  <select
                    className="w-full px-2 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-neutral-800 transition-all font-sans"
                    value={dd}
                    onChange={(e) => {
                      const newDate = `${yyyy}-${mm}-${e.target.value}`;
                      setStudentInfo({ date_of_assessment: newDate });
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => {
                      const dayVal = String(i + 1).padStart(2, "0");
                      return <option key={dayVal} value={dayVal}>{i + 1}</option>;
                    })}
                  </select>

                  {/* Month Select */}
                  <select
                    className="w-full px-2 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-neutral-800 transition-all font-sans"
                    value={mm}
                    onChange={(e) => {
                      const newDate = `${yyyy}-${e.target.value}-${dd}`;
                      setStudentInfo({ date_of_assessment: newDate });
                    }}
                  >
                    {monthsThai.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>

                  {/* Year Select */}
                  <select
                    className="w-full px-2 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-neutral-800 transition-all font-sans"
                    value={yyyy}
                    onChange={(e) => {
                      const newDate = `${e.target.value}-${mm}-${dd}`;
                      setStudentInfo({ date_of_assessment: newDate });
                    }}
                  >
                    {yearsList.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1">
                  📞 เบอร์โทรศัพท์ผู้ปกครอง (Parent Phone)
                </label>
                <input 
                  type="tel" 
                  placeholder="e.g. 0812345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm transition-all"
                  value={studentInfo.guardian_phone}
                  onChange={(e) => setStudentInfo({ guardian_phone: e.target.value })}
                />
              </div>

            </div>

            {/* Test Type Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-giraffe-brown/80 block">
                🎯 รูปแบบการสอบประเมิน (Assessment Mode)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="w-full sm:flex-1 flex items-center justify-between p-3 rounded-xl border border-giraffe-brown/10 bg-white/50 cursor-pointer hover:bg-white transition-all text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-giraffe-yellow-dark" /> 
                    คัดกรองแรกเข้า (Placement Test)
                  </span>
                  <input 
                    type="radio" 
                    name="test_type"
                    checked={studentInfo.test_type === "Placement Test"}
                    onChange={() => setStudentInfo({ test_type: "Placement Test" })}
                    className="accent-giraffe-yellow h-4 w-4"
                  />
                </label>
                <label className="w-full sm:flex-1 flex items-center justify-between p-3 rounded-xl border border-giraffe-brown/10 bg-white/50 cursor-pointer hover:bg-white transition-all text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    สอบเลื่อนขั้นในคลาส (Promotion Test)
                  </span>
                  <input 
                    type="radio" 
                    name="test_type"
                    checked={studentInfo.test_type === "In-Class Promotion"}
                    onChange={() => setStudentInfo({ test_type: "In-Class Promotion" })}
                    className="accent-giraffe-yellow h-4 w-4"
                  />
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark hover:from-giraffe-yellow-dark hover:to-giraffe-brown text-white font-extrabold rounded-2xl shadow-md transition-all spring-hover flex items-center justify-center gap-2 text-sm"
            >
              เริ่มทำแบบสัมภาษณ์ประเมินผล (Start Test)
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>

        </div>

        {/* Right Side: Historical Records Panel */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div className="giraffe-glass p-6 rounded-3xl shadow-xl border border-white/60 flex-1 flex flex-col space-y-4 max-h-[640px]">
            
            <div className="flex items-center gap-2 border-b border-giraffe-brown/10 pb-3">
              <History className="h-5 w-5 text-giraffe-brown" />
              <h3 className="font-extrabold text-sm text-giraffe-brown-dark">
                ประวัติการสอบประเมินล่าสุด (Recent Records)
              </h3>
            </div>

            {loadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-giraffe-brown/60 space-y-2">
                <span className="animate-spin text-xl">🦒</span>
                <span>กำลังโหลดข้อมูลออฟไลน์...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-giraffe-brown/50 text-center p-4">
                <span>ยังไม่มีประวัติการประเมินเด็กในระบบ</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {history.map((session) => {
                  const student = session.student || {
                    nickname: "Student",
                    first_name: "Unnamed",
                    last_name: "Child",
                    age: 5
                  };
                  return (
                    <div 
                      key={session.id}
                      className="p-3 bg-white/50 border border-giraffe-brown/5 hover:border-giraffe-yellow/30 rounded-2xl flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-giraffe-brown-dark flex items-center gap-1.5">
                          <span>Nong {student.nickname}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-giraffe-yellow/10 text-giraffe-yellow-dark font-normal">
                            {student.age} yrs
                          </span>
                        </div>
                        <div className="text-[10px] text-giraffe-brown/60 font-light">
                          {student.first_name} {student.last_name} &bull; {new Date(session.created_at).toLocaleDateString("th-TH")}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            L: {session.listening_percentage.toFixed(0)}%
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">
                            S: {session.speaking_percentage.toFixed(0)}%
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-50 text-giraffe-yellow-dark">
                            Result: {session.suggested_level}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewPastReport(session.id)}
                        className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-giraffe-yellow text-giraffe-brown hover:text-giraffe-yellow shadow-sm transition-all"
                        title="ดูรายงานผลสอบ"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="text-[10px] text-center text-giraffe-brown/50 pt-2 border-t border-giraffe-brown/5">
              ระบบเชื่อมต่อฐานข้อมูลออฟไลน์สำรองในเครื่องเรียบร้อยแล้ว
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
