"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssessmentStore, QuestionItem } from "@/stores/useAssessmentStore";
import DonutChart from "@/components/DonutChart";
import { 
  Printer, 
  Home, 
  Check, 
  X, 
  Award, 
  CheckCircle,
  AlertCircle,
  BookOpen
} from "lucide-react";
import rawCriteria from "@/data/assessment_criteria.json";

interface MappedQuestion {
  text: string;
  skill: "Listening" | "Speaking";
  is_can_do: boolean;
}

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const { 
    studentInfo, 
    scores, 
    customQuestions, 
    teacherComment, 
    confirmedLevel, 
    setStep 
  } = useAssessmentStore();

  const [loading, setLoading] = useState(!!sessionId);
  
  // States for database-loaded data (if loading from history)
  const [dbStudent, setDbStudent] = useState<any>(null);
  const [dbSession, setDbSession] = useState<any>(null);
  const [dbScores, setDbScores] = useState<MappedQuestion[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch(`http://127.0.0.1:8000/api/v1/sessions/${sessionId}`);
        if (!sessionRes.ok) throw new Error("Failed to load session");
        const session = await sessionRes.json();
        setDbSession(session);

        // Fetch student list to find matching student
        const studentRes = await fetch("http://127.0.0.1:8000/api/v1/students");
        if (studentRes.ok) {
          const students = await studentRes.json();
          const student = students.find((s: any) => s.id === session.student_id);
          setDbStudent(student);
        }

        // Map database scores to question text
        const mapped: MappedQuestion[] = session.scores.map((score: any) => {
          const cid = score.criterion_id;
          if (cid.startsWith("custom::")) {
            const [_, text, skill] = cid.split("::");
            return {
              text,
              skill: skill as "Listening" | "Speaking",
              is_can_do: score.is_can_do
            };
          } else {
            const standardQ = (rawCriteria as QuestionItem[]).find(q => q.id === cid);
            return {
              text: standardQ ? standardQ.question : "Assessment Question",
              skill: standardQ ? standardQ.skill : "Speaking",
              is_can_do: score.is_can_do
            };
          }
        });
        setDbScores(mapped);

      } catch (err) {
        console.error("Failed to load report history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoHome = () => {
    resetStore();
    setStep(1);
    router.push("/");
  };

  const resetStore = useAssessmentStore((state) => state.resetStore);

  // Derive all data depending on whether we use Zustand or DB state
  const name = sessionId 
    ? `${dbStudent?.first_name || ""} ${dbStudent?.last_name || ""}` 
    : `${studentInfo.first_name} ${studentInfo.last_name}`;
  const nickname = sessionId ? (dbStudent?.nickname || "") : studentInfo.nickname;
  const age = sessionId ? (dbStudent?.age || 5) : studentInfo.age;
  const dateStr = sessionId 
    ? new Date(dbSession?.created_at).toLocaleDateString("th-TH") 
    : new Date(studentInfo.date_of_assessment).toLocaleDateString("th-TH");
  const testType = sessionId ? (dbSession?.assessment_type || "Placement Interview") : studentInfo.test_type;
  
  const finalLevel = sessionId ? (dbSession?.suggested_level || "Seed 🌰") : confirmedLevel;
  const finalComment = sessionId ? (dbSession?.teacher_qualitative_note || "") : teacherComment;

  // Compile Can Do vs Needs Practice questions list
  let canDoList: string[] = [];
  let needsPracticeList: string[] = [];

  let speakingPassed = 0;
  let speakingTotal = 0;
  let listeningPassed = 0;
  let listeningTotal = 0;

  if (sessionId) {
    dbScores.forEach(s => {
      if (s.is_can_do) {
        canDoList.push(s.text);
        if (s.skill === "Speaking") speakingPassed++;
        else listeningPassed++;
      } else {
        needsPracticeList.push(s.text);
      }
      if (s.skill === "Speaking") speakingTotal++;
      else listeningTotal++;
    });
  } else {
    // Read from static criteria + custom questions
    const levelQuestions = (rawCriteria as QuestionItem[]).filter(
      (q) => q.level === useAssessmentStore.getState().activeLevel
    );
    const customList = customQuestions.filter(
      (q) => q.level === useAssessmentStore.getState().activeLevel
    );
    const allQuestions = [...levelQuestions, ...customList];

    allQuestions.forEach(q => {
      const isPassed = scores[q.id] === true;
      const isFailed = scores[q.id] === false;

      if (isPassed) {
        canDoList.push(q.question);
        if (q.skill === "Speaking") speakingPassed++;
        else listeningPassed++;
      } else if (isFailed) {
        needsPracticeList.push(q.question);
      }

      if (q.skill === "Speaking") speakingTotal++;
      else listeningTotal++;
    });
  }

  const speakingPercentage = speakingTotal > 0 ? (speakingPassed / speakingTotal) * 100 : 0;
  const listeningPercentage = listeningTotal > 0 ? (listeningPassed / listeningTotal) * 100 : 0;

  // Levels for Parent Guide Highlight
  const parentLevels = [
    {
      name: "Seed 🌰",
      progression: "Listener, Echoer",
      yle: "Starters",
      cefr: "Pre-A1",
      desc: "ฟังเข้าใจแต่ยังไม่พูด, พูดตามได้ หรือเลียนเสียง, ส่งเสียงหรือตอบสั้นๆได้, เข้าใจคำสั่งในคลาส ระบบรร."
    },
    {
      name: "Sprout 🌱",
      progression: "Responder and Builder",
      yle: "Movers",
      cefr: "A1",
      desc: "เข้าใจประโยคสั้นๆ หรือคำแนะนำสั้นๆ เริ่มพูดได้เป็นคำเดี่ยว บางทีอาจแนะนำตัวได้ พูดตามเป็นกลุ่มคำ / พูดเองได้ สร้างประโยคสั้นๆ เองได้ โดยจำมาพัฒนาต่อยอดดึงความรู้มาใช้"
    },
    {
      name: "Apple Tree 🎄",
      progression: "Connecter and Storyteller",
      yle: "Flyers",
      cefr: "A2",
      desc: "จินตนาการผ่านภาษาได้ คุยต่อเนื่องหลาย turn ได้ / เล่าเรื่อง ต่อยอด แสดงความเห็นได้ มีความคิดเป็นของตนเอง สามารถดัดแปลงบอกความรู้สึกความเห็นออกมาได้"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xs text-giraffe-brown/60 space-y-3">
        <span className="animate-spin text-2xl">🦒</span>
        <span>กำลังโหลดประวัติผลสัมภาษณ์...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-savannah-bg-dark/40 print:p-0">
      
      {/* Action Navigation bar (Hidden on Print) */}
      <div className="w-full max-w-[210mm] flex items-center justify-between p-4 mb-4 bg-white/70 rounded-2xl border border-white no-print">
        <button 
          onClick={handleGoHome}
          className="py-2 px-4 bg-giraffe-brown/10 text-giraffe-brown hover:bg-giraffe-brown hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 spring-hover"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </button>
        <button 
          onClick={handlePrint}
          className="py-2 px-5 bg-giraffe-yellow hover:bg-giraffe-yellow-dark text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 spring-hover"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Main A4 Printable Area */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white realistic-a4-shadow rounded-none border border-neutral-100 p-8 md:p-10 flex flex-col justify-between print-page-container relative overflow-hidden">
        
        {/* Subtle decorative Giraffe background spots for watermark effect */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-giraffe-yellow/[0.02] rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-giraffe-brown/[0.015] rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b-2 border-giraffe-yellow/30 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-giraffe-yellow flex items-center justify-center text-white text-xl">🦒</div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-giraffe-brown-dark">Speak&Listen</h1>
                <p className="text-[9px] text-giraffe-brown/60 tracking-wider font-semibold uppercase">Intake placement assessment</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Assessment Date</span>
              <span className="text-xs font-extrabold text-giraffe-brown-dark">{dateStr}</span>
            </div>
          </div>

          {/* Student Profile Info Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Student Name</span>
              <span className="text-xs font-extrabold text-giraffe-brown-dark">
                Nong {nickname} <span className="font-medium text-[10px] text-neutral-500">({name})</span>
              </span>
            </div>
            <div className="p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Age</span>
              <span className="text-xs font-extrabold text-giraffe-brown-dark">{age} years old</span>
            </div>
            <div className="p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Assessment Type</span>
              <span className="text-xs font-extrabold text-giraffe-brown-dark">{testType}</span>
            </div>
          </div>

          {/* Twin Donut Charts side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <DonutChart 
              percentage={speakingPercentage}
              total={speakingTotal}
              passed={speakingPassed}
              label="Speaking Ability"
              color="#D36048" // Savannah red
              bgColor="#FDF2EF"
              icon="🗣️"
            />
            <DonutChart 
              percentage={listeningPercentage}
              total={listeningTotal}
              passed={listeningPassed}
              label="Listening Ability"
              color="#3D7C5D" // Safari green
              bgColor="#EEF7F3"
              icon="👂"
            />
          </div>

          {/* Can Do / Needs Practice Side-by-Side Panel */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Can Do Box */}
            <div className="p-4 rounded-2xl border border-safari-green/10 bg-emerald-50/15 flex flex-col justify-between h-48">
              <div>
                <h4 className="font-extrabold text-xs text-safari-green flex items-center gap-1 mb-2 border-b border-safari-green/10 pb-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  ✔ Can Do
                </h4>
                {canDoList.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 font-light">ยังไม่พบรายการความสามารถที่ผ่านเกณฑ์</p>
                ) : (
                  <ul className="space-y-1 overflow-y-auto max-h-[120px] pr-1">
                    {canDoList.slice(0, 5).map((item, i) => (
                      <li key={i} className="text-[9px] text-giraffe-brown-dark leading-tight flex items-start gap-1.5 font-medium">
                        <Check className="h-2.5 w-2.5 text-safari-green shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {canDoList.length > 5 && (
                      <li className="text-[8px] text-safari-green/80 italic font-semibold pl-4">
                        + {canDoList.length - 5} items more...
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Needs Practice Box */}
            <div className="p-4 rounded-2xl border border-savannah-red/10 bg-orange-50/15 flex flex-col justify-between h-48">
              <div>
                <h4 className="font-extrabold text-xs text-savannah-red flex items-center gap-1 mb-2 border-b border-savannah-red/10 pb-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  ✖ Needs Practice
                </h4>
                {needsPracticeList.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 font-light">นักเรียนผ่านการทดสอบครบทุกข้อ</p>
                ) : (
                  <ul className="space-y-1 overflow-y-auto max-h-[120px] pr-1">
                    {needsPracticeList.slice(0, 5).map((item, i) => (
                      <li key={i} className="text-[9px] text-giraffe-brown-dark leading-tight flex items-start gap-1.5 font-medium">
                        <X className="h-2.5 w-2.5 text-savannah-red shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {needsPracticeList.length > 5 && (
                      <li className="text-[8px] text-savannah-red/80 italic font-semibold pl-4">
                        + {needsPracticeList.length - 5} items more...
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

          </div>

          {/* Parent Guide to Levels Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-giraffe-brown flex items-center gap-1.5 border-b border-giraffe-brown/5 pb-1">
              <BookOpen className="h-4 w-4 text-giraffe-yellow-dark" />
              ตารางอธิบายผู้ปกครองในแต่ละระดับ (Parent Guide to Language Levels)
            </h4>
            <div className="border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-[9px] font-bold text-neutral-400 uppercase">
                    <th className="py-2.5 px-3">Name of Levels</th>
                    <th className="py-2.5 px-3">Progression</th>
                    <th className="py-2.5 px-3 w-16">YLE</th>
                    <th className="py-2.5 px-3 w-16">CEFR</th>
                    <th className="py-2.5 px-3">Characteristic (ลักษณะเด็กคร่าวๆ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {parentLevels.map((lvl) => {
                    // Match logic: does level name match confirmed Level?
                    const isMatched = finalLevel.includes(lvl.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim());
                    return (
                      <tr 
                        key={lvl.name} 
                        className={`transition-all ${
                          isMatched 
                            ? "bg-giraffe-yellow/10 border-2 border-giraffe-yellow font-bold text-giraffe-brown-dark" 
                            : "opacity-60 text-giraffe-brown/80 font-light"
                        }`}
                      >
                        <td className="py-2.5 px-3 flex items-center gap-1">
                          {isMatched && <span className="text-[10px] text-giraffe-yellow-dark">🎯</span>}
                          <span>{lvl.name}</span>
                        </td>
                        <td className="py-2.5 px-3">{lvl.progression}</td>
                        <td className="py-2.5 px-3">{lvl.yle}</td>
                        <td className="py-2.5 px-3">{lvl.cefr}</td>
                        <td className="py-2.5 px-3 text-[9px] leading-snug">{lvl.desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher comment note block */}
          <div className="p-4 rounded-2xl border border-giraffe-yellow/20 bg-yellow-50/10 space-y-1">
            <span className="text-[9px] text-giraffe-yellow-dark font-extrabold uppercase tracking-wider block">Teacher's Evaluation Comment</span>
            <p className="text-xs text-giraffe-brown-dark leading-relaxed font-medium">
              "{finalComment || "นักเรียนมีปฏิกิริยาโต้ตอบเชิงบวกที่น่ารักมาก พร้อมที่จะเรียนรู้และมีความมั่นใจในการร่วมกิจกรรมในห้องเรียนเป็นอย่างดีครับ"}"
            </p>
          </div>

        </div>

        {/* Footer block: Objectives & Placement Badge */}
        <div className="border-t border-neutral-100 pt-4 mt-6 flex items-end justify-between">
          
          {/* Objectives Outline */}
          <div className="max-w-[70%] space-y-1.5">
            <span className="text-[8px] text-giraffe-brown/50 font-bold uppercase tracking-wider block">Objectives Outline / เป้าหมายการเรียนรู้</span>
            <p className="text-[9px] text-giraffe-brown/70 leading-relaxed font-light">
              เด็กที่มีพื้นฐานที่ดี จะพร้อมเรียนรู้ได้มากกว่า รู้จักระบบภายในห้องเรียน เพื่อให้มีส่วนร่วมกับกิจกรรมให้ได้มากที่สุด เเละส่งเสริม **Activity-Based Learning** เพื่อให้การพัฒนาภาษาเป็นไปในทางที่ดีที่สุด และเราคาดหวังให้บรรยากาศเป็น **100% Total English Environment** ในห้องเรียน
            </p>
          </div>

          {/* Placement Badge & Verification */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="px-4 py-2 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark rounded-xl shadow-sm text-white flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold uppercase tracking-wider opacity-90">Placed Level</span>
              <span className="text-xs font-extrabold">{finalLevel}</span>
            </div>
            
            <div className="flex items-center gap-1 mt-1 text-[8px] text-safari-green font-bold uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-safari-green"></span>
              </span>
              Official Verified
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function Report() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center text-xs text-giraffe-brown/60 space-y-3">
        <span className="animate-spin text-2xl">🦒</span>
        <span>กำลังโหลดหน้าจอรายงาน...</span>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
