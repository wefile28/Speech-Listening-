"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore, QuestionItem } from "@/stores/useAssessmentStore";
import { 
  Plus, 
  HelpCircle, 
  ArrowRight, 
  Smile, 
  MessageSquare,
  Bookmark,
  ChevronRight,
  Eye,
  X,
  ArrowLeft,
  Award,
  Trophy,
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from "lucide-react";
import rawCriteria from "@/data/assessment_criteria.json";

export default function Assessment() {
  const router = useRouter();
  const { 
    studentInfo, 
    scores, 
    customQuestions, 
    teacherComment,
    confirmedLevel,
    assessmentMode,
    toggleScore, 
    addCustomQuestion, 
    setTeacherComment,
    setConfirmedLevel,
    setStep,
    setAssessmentMode
  } = useAssessmentStore();

  const [activeTab, setActiveTab] = useState<"Seed" | "Sprout" | "Sapling" | "Tree">("Seed");
  const [showReflection, setShowReflection] = useState(false);
  const [activeVisualAid, setActiveVisualAid] = useState<string | null>(null);

  // States for interactive adaptive game flow
  const [gameStreakCanDo, setGameStreakCanDo] = useState(0);
  const [gameStreakNotYet, setGameStreakNotYet] = useState(0);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [showGameOverAnimation, setShowGameOverAnimation] = useState(false);
  const [levelUpTitle, setLevelUpTitle] = useState("");

  // Custom question inputs
  const [customText, setCustomText] = useState("");
  const [customSkill, setCustomSkill] = useState<"Listening" | "Speaking">("Speaking");

  // Load all standard criteria
  const allStandardQuestions = rawCriteria as QuestionItem[];

  // Combine standard and custom questions across ALL levels
  const allSystemQuestions = [...allStandardQuestions, ...customQuestions];

  // Filter questions shown in the active tab
  const questionsInActiveTab = allSystemQuestions.filter(q => q.level === activeTab);

  // --- ADAPTIVE GAME CORE LOGIC ---
  const levelOrder = { Seed: 1, Sprout: 2, Sapling: 3, Tree: 4 };
  const sublevelOrder: Record<string, number> = {
    "LISTENER A": 1, "LISTENER B": 2,
    "RESPONDER A": 3, "RESPONDER B": 4,
    "BUILDER A": 5, "BUILDER B": 6, "BUILDER C": 7,
    "CONNECTOR A": 8, "CONNECTOR B": 9,
    "CUSTOM PROBE": 10
  };

  const sortedQuestions = [...allSystemQuestions].sort((a, b) => {
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;
    
    const subA = (a.sublevel || "").toUpperCase();
    const subB = (b.sublevel || "").toUpperCase();
    const orderA = sublevelOrder[subA] || 99;
    const orderB = sublevelOrder[subB] || 99;
    return orderA - orderB;
  });

  // Start from activeTab or higher, and find the first unanswered question
  const unansweredQuestions = sortedQuestions.filter(q => {
    const isEvaluated = scores[q.id] !== undefined;
    const isLevelEligible = levelOrder[q.level] >= levelOrder[activeTab];
    return !isEvaluated && isLevelEligible;
  });

  const currentQuestion = unansweredQuestions[0];

  const handleGameResponse = (isCanDo: boolean) => {
    if (!currentQuestion) return;
    
    toggleScore(currentQuestion.id, isCanDo);

    if (isCanDo) {
      const nextStreak = gameStreakCanDo + 1;
      setGameStreakCanDo(nextStreak);
      setGameStreakNotYet(0);

      if (nextStreak === 3) {
        // Find next question in unanswered list (index 1 since index 0 is currentQuestion which we just answered)
        if (unansweredQuestions.length > 1) {
          const nextQ = unansweredQuestions[1];
          if (nextQ.level !== currentQuestion.level) {
            // Level Up!
            setLevelUpTitle(`${currentQuestion.level} ➔ ${nextQ.level} 🌟`);
            setActiveTab(nextQ.level);
            setShowLevelUpAnimation(true);
            setTimeout(() => setShowLevelUpAnimation(false), 2000);
          } else if (nextQ.sublevel !== currentQuestion.sublevel) {
            // Sublevel Level Up!
            setLevelUpTitle(`${currentQuestion.sublevel} ➔ ${nextQ.sublevel} 🚀`);
            setShowLevelUpAnimation(true);
            setTimeout(() => setShowLevelUpAnimation(false), 2000);
          }
        }
        setGameStreakCanDo(0);
      }
    } else {
      const nextStreak = gameStreakNotYet + 1;
      setGameStreakNotYet(nextStreak);
      setGameStreakCanDo(0);

      if (nextStreak === 2) {
        setShowGameOverAnimation(true);
      }
    }
  };

  // Inline visual prompts for game card
  const renderInlineVisualAid = (promptId: string) => {
    switch (promptId) {
      case "play_together":
        return (
          <div className="border border-neutral-100 rounded-2xl p-4 bg-yellow-50/10 shadow-sm flex flex-col items-center justify-center space-y-2 h-44 animate-pop-scale">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <circle cx="35" cy="40" r="12" fill="#F4B234" />
              <path d="M35 52 L25 75 M35 52 L45 75 M35 52 L35 70" stroke="#7B4E26" strokeWidth="3" strokeLinecap="round" />
              <circle cx="65" cy="40" r="12" fill="#3D7C5D" />
              <path d="M65 52 L55 75 M65 52 L75 75 M65 52 L65 70" stroke="#7B4E26" strokeWidth="3" strokeLinecap="round" />
              <rect x="44" y="65" width="12" height="12" rx="1" fill="#D36048" />
              <rect x="48" y="55" width="8" height="10" rx="1" fill="#F4B234" />
            </svg>
            <span className="text-[10px] text-giraffe-yellow-dark font-bold">Play Together ✔</span>
          </div>
        );
      case "run_fast":
        return (
          <div className="border border-neutral-100 rounded-2xl p-4 bg-yellow-50/10 shadow-sm flex flex-col items-center justify-center space-y-2 h-44 animate-pop-scale">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <ellipse cx="50" cy="50" rx="35" ry="18" fill="#F4B234" />
              <circle cx="75" cy="40" r="10" fill="#F4B234" />
              <circle cx="35" cy="48" r="2.5" fill="#7B4E26" />
              <circle cx="48" cy="42" r="3" fill="#7B4E26" />
              <circle cx="58" cy="52" r="2.5" fill="#7B4E26" />
              <line x1="5" y1="40" x2="20" y2="40" stroke="#E59E1A" strokeWidth="3" strokeLinecap="round" />
              <line x1="8" y1="50" x2="25" y2="50" stroke="#E59E1A" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] text-giraffe-yellow-dark font-bold">Fast Cheetah ✔</span>
          </div>
        );
      case "walk_carefully":
        return (
          <div className="border border-neutral-100 rounded-2xl p-4 bg-yellow-50/10 shadow-sm flex flex-col items-center justify-center space-y-2 h-44 animate-pop-scale">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <circle cx="50" cy="35" r="10" fill="#3D7C5D" />
              <path d="M50 45 L45 75 M50 45 L55 75 M50 45 L50 65 M35 55 L65 55" stroke="#7B4E26" strokeWidth="4" strokeLinecap="round" />
              <circle cx="48" cy="35" r="1.5" fill="#FAF7F2" />
              <circle cx="52" cy="35" r="1.5" fill="#FAF7F2" />
            </svg>
            <span className="text-[10px] text-giraffe-yellow-dark font-bold">Walking Carefully ✔</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Giraffe cartoon avatar placeholder for cards without pictures
  const renderGiraffePlaceholder = (skill: "Listening" | "Speaking") => {
    const isSpeaking = skill === "Speaking";
    return (
      <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto animate-pop-scale">
        <rect x="42" y="50" width="16" height="35" rx="8" fill="#F4B234" />
        <rect x="47" y="55" width="6" height="30" fill="#7B4E26" opacity="0.1" />
        <rect x="45" y="25" width="10" height="30" fill="#F4B234" />
        <circle cx="50" cy="20" r="10" fill="#F4B234" />
        <ellipse cx="40" cy="15" rx="5" ry="2" fill="#F4B234" transform="rotate(-30 40 15)" />
        <ellipse cx="60" cy="15" rx="5" ry="2" fill="#F4B234" transform="rotate(30 60 15)" />
        <line x1="47" y1="12" x2="45" y2="6" stroke="#7B4E26" strokeWidth="2" strokeLinecap="round" />
        <circle cx="45" cy="5" r="2" fill="#7B4E26" />
        <line x1="53" y1="12" x2="55" y2="6" stroke="#7B4E26" strokeWidth="2" strokeLinecap="round" />
        <circle cx="55" cy="5" r="2" fill="#7B4E26" />
        <circle cx="47" cy="18" r="1.5" fill="#502F13" />
        <circle cx="53" cy="18" r="1.5" fill="#502F13" />
        <ellipse cx="50" cy="23" rx="6" ry="4" fill="#FDF2EF" />
        <circle cx="48" cy="22" r="0.5" fill="#7B4E26" />
        <circle cx="52" cy="22" r="0.5" fill="#7B4E26" />
        <path d="M48 24 Q50 26 52 24" stroke="#7B4E26" strokeWidth="1" strokeLinecap="round" fill="none" />
        <circle cx="45" cy="35" r="2" fill="#7B4E26" opacity="0.15" />
        <circle cx="52" cy="42" r="1.5" fill="#7B4E26" opacity="0.15" />
        <circle cx="48" cy="58" r="2" fill="#7B4E26" opacity="0.15" />
        <circle cx="53" cy="68" r="2.5" fill="#7B4E26" opacity="0.15" />
        
        {isSpeaking ? (
          <>
            <circle cx="72" cy="20" r="8" fill="#EEF7F3" />
            <text x="72" y="23" textAnchor="middle" fontSize="10">🗣️</text>
          </>
        ) : (
          <>
            <circle cx="72" cy="20" r="8" fill="#FDF2EF" />
            <text x="72" y="23" textAnchor="middle" fontSize="10">👂</text>
          </>
        )}
      </svg>
    );
  };

  // Score calculations based ONLY on EVALUATED questions
  const evaluatedQuestions = allSystemQuestions.filter(q => scores[q.id] !== undefined);
  const evaluatedSpeaking = evaluatedQuestions.filter(q => q.skill === "Speaking");
  const evaluatedListening = evaluatedQuestions.filter(q => q.skill === "Listening");

  const speakingCanDoCount = evaluatedSpeaking.filter(q => scores[q.id] === true).length;
  const listeningCanDoCount = evaluatedListening.filter(q => scores[q.id] === true).length;

  const speakingTotal = evaluatedSpeaking.length;
  const listeningTotal = evaluatedListening.length;

  // Fallbacks for display before evaluation starts
  const displaySpeakingTotal = speakingTotal > 0 ? speakingTotal : allStandardQuestions.filter(q => q.level === activeTab && q.skill === "Speaking").length;
  const displayListeningTotal = listeningTotal > 0 ? listeningTotal : allStandardQuestions.filter(q => q.level === activeTab && q.skill === "Listening").length;

  // Auto-calculated recommendation based on evaluated ratio
  const getAutoRecommendation = () => {
    const totalCount = evaluatedQuestions.length;
    if (totalCount === 0) return `${activeTab} ${activeTab === "Seed" ? "🌰" : activeTab === "Sprout" ? "🌱" : activeTab === "Sapling" ? "🪴" : "🎄"}`;
    const passedCount = evaluatedQuestions.filter(q => scores[q.id] === true).length;
    const ratio = passedCount / totalCount;
    
    if (ratio < 0.4) return "Seed 🌰";
    if (ratio < 0.8) return "Sprout 🌱";
    return "Apple Tree 🎄";
  };

  useEffect(() => {
    if (showReflection) {
      setConfirmedLevel(getAutoRecommendation());
      
      // Auto-prepopulate comment
      if (!teacherComment) {
        const nickname = studentInfo.nickname || "น้อง";
        const totalEvaluated = speakingTotal + listeningTotal;
        const totalPassed = speakingCanDoCount + listeningCanDoCount;
        const avg = totalEvaluated > 0 ? (totalPassed / totalEvaluated) * 100 : 50;

        let text = `น้อง ${nickname} เข้ารับการทดสอบวัดระดับภาษาอังกฤษแบบตัวต่อตัว `;
        if (avg >= 80) {
          text += `มีพัฒนาการที่ยอดเยี่ยมและโดดเด่นมาก สามารถโต้ตอบประโยคภาษาอังกฤษได้อย่างมั่นใจและเข้าใจคำสั่งภาษาอังกฤษได้อย่างคล่องแคล่ว แนะนำให้สนับสนุนทักษะการสนทนาโต้ตอบแบบธรรมชาติและการใช้ภาษาอย่างต่อเนื่องครับ`;
        } else if (avg >= 40) {
          text += `สามารถเข้าใจประโยคและคำสั่งภาษาอังกฤษได้ดี เริ่มสื่อสารคำศัพท์และตอบคำตอบสั้นๆ ได้ด้วยตนเอง แนะนำให้ฝึกฝนคลังคำศัพท์และรูปแบบประโยคเพิ่มเติมในคลาสเพื่อเสริมความมั่นใจในการพูดโต้ตอบค่ะ`;
        } else {
          text += `สามารถปฏิบัติตามคำสั่งในห้องเรียนระดับพื้นฐานได้ดี มีความตั้งใจและมีปฏิกิริยาโต้ตอบเชิงบวกกับครู แนะนำให้เรียนรู้โดยเน้นกิจกรรมการเล่น (Activity-Based Learning) เพื่อสร้างทัศนคติที่ดีต่อภาษาอังกฤษต่อไปครับ`;
        }
        setTeacherComment(text);
      }
    }
  }, [showReflection]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    // Add custom question under the CURRENT active tab level
    addCustomQuestion(customText, customSkill);
    // Update store state with custom level
    const lastQIdx = useAssessmentStore.getState().customQuestions.length;
    // Since Zustand's addCustomQuestion defaults to activeLevel, we can modify the last item's level to activeTab
    if (lastQIdx > 0) {
      const customs = [...useAssessmentStore.getState().customQuestions];
      customs[customs.length - 1].level = activeTab;
      useAssessmentStore.setState({ customQuestions: customs });
    }
    setCustomText("");
  };

  const handleFinishTest = () => {
    setShowReflection(true);
  };

  const handleSubmitAll = async () => {
    const studentId = sessionStorage.getItem("current_student_id") || "fallback-offline-id";
    const scoresPayload = Object.entries(scores).map(([key, value]) => {
      const isCustomQ = allSystemQuestions.find(q => q.id === key);
      const serializedId = isCustomQ && isCustomQ.isCustom 
        ? `custom::${isCustomQ.question}::${isCustomQ.skill}`
        : key;
      return {
        criterion_id: serializedId,
        is_can_do: value
      };
    });

    const sessionPayload = {
      student_id: studentId,
      evaluator_name: "Teacher Cathy",
      speaking_percentage: speakingTotal > 0 ? (speakingCanDoCount / speakingTotal) * 100 : 0,
      listening_percentage: listeningTotal > 0 ? (listeningCanDoCount / listeningTotal) * 100 : 0,
      suggested_level: confirmedLevel,
      assessment_type: studentInfo.test_type,
      teacher_qualitative_note: teacherComment,
      scores: scoresPayload
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload)
      });

      if (res.ok) {
        const savedSession = await res.json();
        setStep(3);
        router.push(`/report?sessionId=${savedSession.id}`);
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกผลการประเมินลงระบบ");
        setStep(3);
        router.push("/report");
      }
    } catch (err) {
      console.error("Save Session API error:", err);
      setStep(3);
      router.push("/report");
    }
  };

  // Render modal content
  const renderVisualAidContent = () => {
    switch (activeVisualAid) {
      case "play_together":
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-center text-giraffe-brown">{"1. Let's play together."}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col items-center justify-center space-y-3 h-52">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <circle cx="50" cy="40" r="15" fill="#F4B234" />
                  <path d="M50 55 L35 85 M50 55 L65 85 M50 55 L50 75 M35 65 L65 65" stroke="#7B4E26" strokeWidth="4" strokeLinecap="round" />
                  <rect x="40" y="80" width="20" height="12" rx="2" fill="#D36048" />
                </svg>
                <span className="text-[10px] text-giraffe-brown/70 font-semibold">Play Alone</span>
              </div>
              <div className="border border-giraffe-yellow/40 rounded-2xl p-4 bg-yellow-50/20 shadow-sm flex flex-col items-center justify-center space-y-3 h-52 ring-2 ring-giraffe-yellow">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <circle cx="35" cy="40" r="12" fill="#F4B234" />
                  <path d="M35 52 L25 75 M35 52 L45 75 M35 52 L35 70" stroke="#7B4E26" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="65" cy="40" r="12" fill="#3D7C5D" />
                  <path d="M65 52 L55 75 M65 52 L75 75 M65 52 L65 70" stroke="#7B4E26" strokeWidth="3" strokeLinecap="round" />
                  <rect x="44" y="65" width="12" height="12" rx="1" fill="#D36048" />
                  <rect x="48" y="55" width="8" height="10" rx="1" fill="#F4B234" />
                </svg>
                <span className="text-[10px] text-giraffe-yellow-dark font-bold">Play Together ✔</span>
              </div>
            </div>
          </div>
        );
      case "run_fast":
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-center text-giraffe-brown">2. I can run fast.</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-giraffe-yellow/40 rounded-2xl p-4 bg-yellow-50/20 shadow-sm flex flex-col items-center justify-center space-y-3 h-52 ring-2 ring-giraffe-yellow">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <ellipse cx="50" cy="50" rx="35" ry="18" fill="#F4B234" />
                  <circle cx="75" cy="40" r="10" fill="#F4B234" />
                  <circle cx="35" cy="48" r="2.5" fill="#7B4E26" />
                  <circle cx="48" cy="42" r="3" fill="#7B4E26" />
                  <circle cx="58" cy="52" r="2.5" fill="#7B4E26" />
                  <line x1="5" y1="40" x2="20" y2="40" stroke="#E59E1A" strokeWidth="3" strokeLinecap="round" />
                  <line x1="8" y1="50" x2="25" y2="50" stroke="#E59E1A" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] text-giraffe-yellow-dark font-bold">Fast Cheetah ✔</span>
              </div>
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col items-center justify-center space-y-3 h-52">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <circle cx="50" cy="50" r="22" fill="#C4B69F" />
                  <circle cx="50" cy="50" r="18" fill="#FAF7F2" />
                  <rect x="35" y="32" width="30" height="8" rx="2" fill="#7B4E26" />
                  <circle cx="40" cy="50" r="4" fill="#7B4E26" />
                  <circle cx="60" cy="50" r="4" fill="#7B4E26" />
                </svg>
                <span className="text-[10px] text-giraffe-brown/70 font-semibold">Slow Sloth</span>
              </div>
            </div>
          </div>
        );
      case "walk_carefully":
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-center text-giraffe-brown">3. Please walk carefully.</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col items-center justify-center space-y-3 h-52">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <circle cx="45" cy="35" r="10" fill="#D36048" />
                  <path d="M45 45 L30 75 M45 45 L60 70 M45 45 L45 60 M25 50 L65 40" stroke="#7B4E26" strokeWidth="4" strokeLinecap="round" />
                  <rect x="68" y="70" width="15" height="15" fill="#8D5B29" />
                </svg>
                <span className="text-[10px] text-giraffe-brown/70 font-semibold">Running Carelessly</span>
              </div>
              <div className="border border-giraffe-yellow/40 rounded-2xl p-4 bg-yellow-50/20 shadow-sm flex flex-col items-center justify-center space-y-3 h-52 ring-2 ring-giraffe-yellow">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <circle cx="50" cy="35" r="10" fill="#3D7C5D" />
                  <path d="M50 45 L45 75 M50 45 L55 75 M50 45 L50 65 M35 55 L65 55" stroke="#7B4E26" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="48" cy="35" r="1.5" fill="#FAF7F2" />
                  <circle cx="52" cy="35" r="1.5" fill="#FAF7F2" />
                </svg>
                <span className="text-[10px] text-giraffe-yellow-dark font-bold">Walking Carefully ✔</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const tabs: Array<{ name: "Seed" | "Sprout" | "Sapling" | "Tree"; label: string; icon: string }> = [
    { name: "Seed", label: "Seed", icon: "🌰" },
    { name: "Sprout", label: "Sprout", icon: "🌱" },
    { name: "Sapling", label: "Sapling", icon: "🪴" },
    { name: "Tree", label: "Tree", icon: "🌳" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center relative">
      
      {/* Header Mockup */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between border-b border-giraffe-brown/10 pb-4 mb-6 z-10 no-print gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-giraffe-yellow flex items-center justify-center text-white text-lg">🦒</div>
          <span className="font-extrabold text-base tracking-tight text-giraffe-brown-dark">Speak&Listen</span>
        </div>
        
        {/* Step Indicator */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="h-5 w-5 rounded-full bg-giraffe-brown/10 flex items-center justify-center text-[10px]">1</span>
            <span>Student Info</span>
          </div>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <div className={`flex items-center gap-1.5 ${!showReflection ? "text-giraffe-yellow-dark bg-yellow-50 border border-giraffe-yellow/20 px-2.5 py-1 rounded-full font-bold" : "opacity-60"}`}>
            <span className="h-5 w-5 rounded-full bg-giraffe-yellow/10 flex items-center justify-center text-[10px]">2</span>
            <span>Assessment</span>
          </div>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <div className={`flex items-center gap-1.5 ${showReflection ? "text-giraffe-yellow-dark bg-yellow-50 border border-giraffe-yellow/20 px-2.5 py-1 rounded-full font-bold" : "opacity-40"}`}>
            <span className="h-5 w-5 rounded-full bg-giraffe-brown/5 flex items-center justify-center text-[10px]">3</span>
            <span>Report</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl z-10">
        
        {!showReflection ? (
          /* ==========================================
             VIEW 1: ACTIVE INTERVIEW TESTING
             ========================================== */
          assessmentMode === "checklist" ? (
            <div className="space-y-6">
            
            {/* Student Info Bar */}
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-giraffe-brown/50 uppercase font-bold tracking-wider font-sans">Active Candidate</span>
                <h3 className="font-extrabold text-lg text-giraffe-brown-dark">
                  Nong {studentInfo.nickname || "Tee"} &bull; <span className="font-medium text-sm text-giraffe-brown/70">{studentInfo.first_name} {studentInfo.last_name} ({studentInfo.age} yrs)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-giraffe-brown/5 text-giraffe-brown border border-giraffe-brown/5">
                  {studentInfo.test_type}
                </span>
                <button
                  onClick={() => setAssessmentMode("game")}
                  className="py-1.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5 spring-hover cursor-pointer"
                >
                  🎮 สลับไปโหมดเล่นเกม (Game Mode)
                </button>
              </div>
            </div>

            {/* Score Scoreboard Panel */}
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-neutral-100 flex flex-wrap items-center gap-6">
              <div className="text-xs font-bold text-neutral-400">Tested Progress Score:</div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-savannah-red animate-pulse" />
                <span className="text-sm font-extrabold text-savannah-red">{speakingCanDoCount}</span>
                <span className="text-xs text-neutral-400">/ {displaySpeakingTotal} Speaking (Tested)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-safari-green animate-pulse" />
                <span className="text-sm font-extrabold text-safari-green">{listeningCanDoCount}</span>
                <span className="text-xs text-neutral-400">/ {displayListeningTotal} Listening (Tested)</span>
              </div>
            </div>

            {/* Redesigned Level Selector Tabs (Seed Sprout Sapling Tree Switcher) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1.5">
                🦒 สลับระดับชุดคำถามทดสอบเด็ก (Select Curriculum Level Tab)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {tabs.map((tab) => {
                  const isTabActive = activeTab === tab.name;
                  const activeStyle = tab.name === "Seed" 
                    ? "bg-giraffe-yellow border-transparent text-white shadow-sm" 
                    : tab.name === "Sprout"
                    ? "bg-emerald-600 border-transparent text-white shadow-sm"
                    : tab.name === "Sapling"
                    ? "bg-teal-600 border-transparent text-white shadow-sm"
                    : "bg-amber-800 border-transparent text-white shadow-sm";

                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`p-3 rounded-2xl border text-center transition-all font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 spring-hover ${
                        isTabActive 
                          ? `${activeStyle} scale-[1.02]`
                          : "bg-white border-neutral-200 text-giraffe-brown opacity-70"
                      }`}
                    >
                      <span className="text-xl leading-none">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Questions Table */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Question / Task</th>
                      <th className="py-3 px-4 w-32">Skill</th>
                      <th className="py-3 px-4 w-48 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {questionsInActiveTab.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-neutral-400 font-light">
                          ไม่มีคำถามสำหรับระดับนี้
                        </td>
                      </tr>
                    ) : (
                      questionsInActiveTab.map((q, index) => {
                        const isSelectedCanDo = scores[q.id] === true;
                        const isSelectedNotYet = scores[q.id] === false;
                        const isUnselected = scores[q.id] === undefined;

                        return (
                          <tr key={q.id} className="hover:bg-neutral-50/20 transition-all text-sm group">
                            <td className="py-4 px-4 font-mono text-xs text-neutral-400 text-center">{index + 1}</td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-giraffe-brown-dark leading-snug">{q.question}</div>
                              <div className="text-xs text-neutral-400 mt-1 font-light flex items-center gap-1.5">
                                <HelpCircle className="h-3 w-3 shrink-0" />
                                <span>Standard: {q.standard}</span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-light mt-0.5">
                                Ex: {q.example}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                                  q.skill === "Speaking" 
                                    ? "bg-orange-50 text-savannah-red" 
                                    : "bg-emerald-50 text-safari-green"
                                }`}>
                                  {q.skill === "Speaking" ? "🗣️ Speaking" : "👂 Listening"}
                                </span>
                                {q.visualPromptId && (
                                  <button
                                    onClick={() => setActiveVisualAid(q.visualPromptId!)}
                                    className="p-1 rounded bg-giraffe-yellow/10 text-giraffe-yellow-dark hover:bg-giraffe-yellow hover:text-white transition-all shadow-sm"
                                    title="แสดงรูปภาพประกอบคำถาม"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => toggleScore(q.id, true)}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all spring-hover flex items-center justify-center gap-1 ${
                                    isSelectedCanDo 
                                      ? "bg-safari-green border-transparent text-white shadow-sm" 
                                      : isSelectedNotYet
                                      ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50"
                                      : "border-safari-green/30 text-safari-green bg-white hover:bg-safari-green-light"
                                  }`}
                                >
                                  ✔ Can Do
                                </button>
                                <button
                                  onClick={() => toggleScore(q.id, false)}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all spring-hover flex items-center justify-center gap-1 ${
                                    isSelectedNotYet 
                                      ? "bg-savannah-red border-transparent text-white shadow-sm" 
                                      : isSelectedCanDo
                                      ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50"
                                      : "border-savannah-red/30 text-savannah-red bg-white hover:bg-savannah-red-light"
                                  }`}
                                >
                                  ✖ Not Yet
                                </button>
                                {!isUnselected && (
                                  <button
                                    onClick={() => {
                                      const nextScores = { ...scores };
                                      delete nextScores[q.id];
                                      useAssessmentStore.setState({ scores: nextScores });
                                    }}
                                    className="p-1 text-neutral-300 hover:text-neutral-500 rounded"
                                    title="ล้างคำตอบ"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile & iPad Cards Questions Grid (Hidden on desktop, shown on mobile and iPad portrait) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {questionsInActiveTab.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400 font-light bg-white rounded-3xl border border-neutral-100">
                  ไม่มีคำถามสำหรับระดับนี้
                </div>
              ) : (
                questionsInActiveTab.map((q, index) => {
                  const isSelectedCanDo = scores[q.id] === true;
                  const isSelectedNotYet = scores[q.id] === false;
                  const isUnselected = scores[q.id] === undefined;

                  return (
                    <div 
                      key={q.id}
                      className="p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-neutral-400 font-bold"># {index + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            q.skill === "Speaking" 
                              ? "bg-orange-50 text-savannah-red" 
                              : "bg-emerald-50 text-safari-green"
                          }`}>
                            {q.skill === "Speaking" ? "🗣️ Speaking" : "👂 Listening"}
                          </span>
                          {q.visualPromptId && (
                            <button
                              onClick={() => setActiveVisualAid(q.visualPromptId!)}
                              className="p-1 rounded bg-giraffe-yellow/10 text-giraffe-yellow-dark hover:bg-giraffe-yellow hover:text-white transition-all shadow-sm"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-bold text-giraffe-brown-dark text-sm leading-snug">{q.question}</div>
                        <div className="text-[10px] text-neutral-400 font-light leading-relaxed">
                          <strong>Standard:</strong> {q.standard}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-light leading-relaxed">
                          <strong>Example:</strong> {q.example}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 relative">
                        <button
                          onClick={() => toggleScore(q.id, true)}
                          className={`flex-1 py-3 rounded-xl text-xs font-extrabold border transition-all spring-hover flex items-center justify-center ${
                            isSelectedCanDo 
                              ? "bg-safari-green border-transparent text-white shadow-sm" 
                              : isSelectedNotYet
                              ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50"
                              : "border-safari-green/30 text-safari-green bg-white"
                          }`}
                        >
                          ✔ Can Do
                        </button>
                        <button
                          onClick={() => toggleScore(q.id, false)}
                          className={`flex-1 py-3 rounded-xl text-xs font-extrabold border transition-all spring-hover flex items-center justify-center ${
                            isSelectedNotYet 
                              ? "bg-savannah-red border-transparent text-white shadow-sm" 
                              : isSelectedCanDo
                              ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50"
                              : "border-savannah-red/30 text-savannah-red bg-white"
                          }`}
                        >
                          ✖ Not Yet
                        </button>
                        {!isUnselected && (
                          <button
                            onClick={() => {
                              const nextScores = { ...scores };
                              delete nextScores[q.id];
                              useAssessmentStore.setState({ scores: nextScores });
                            }}
                            className="p-2 text-neutral-400 hover:text-neutral-600 rounded self-center"
                            title="ล้างคำตอบ"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Question Box */}
            <div className="giraffe-glass p-6 rounded-3xl border border-white/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-giraffe-brown-dark font-extrabold text-sm border-b border-giraffe-brown/5 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-safari-green shrink-0" />
                Add a custom question under {activeTab} level
              </div>
              <form onSubmit={handleAddQuestion} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8 space-y-1">
                  <label className="text-xs font-bold text-giraffe-brown/70">Question text</label>
                  <input
                    type="text"
                    placeholder="e.g. Can you tell me about your family?"
                    className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent transition-all"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-giraffe-brown/70">Skill</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-giraffe-brown/20 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent transition-all text-neutral-800"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value as "Listening" | "Speaking")}
                  >
                    <option value="Speaking">Speaking</option>
                    <option value="Listening">Listening</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-giraffe-brown text-white hover:bg-giraffe-brown-dark rounded-xl text-xs font-bold shadow transition-all spring-hover flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-giraffe-brown/5">
              <div className="text-xs text-giraffe-brown/60 font-light text-center sm:text-left">
                * สลับแท็บด้านบนเพื่อสัมภาษณ์คำถามในระดับอื่นเพิ่มเติมได้ ข้อมูลประเมินจะไม่สูญหาย
              </div>
              <button
                onClick={handleFinishTest}
                className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark text-white font-extrabold rounded-2xl shadow-md spring-hover flex items-center justify-center gap-2 text-sm"
              >
                บันทึกคะแนนและประเมินผลครู (Finish Test)
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            </div>
          ) : (
            /* ==========================================
               VIEW 1B: GAME INTERVIEW PLAY VIEW
               ========================================== */
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Game Mode Controls Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
                <button
                  onClick={() => setAssessmentMode("checklist")}
                  className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-neutral-50 text-giraffe-brown border border-neutral-200 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 spring-hover cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  สลับกลับไปโหมดตารางบันทึกกระดาษ (Checklist Mode)
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 px-3 py-1.5 rounded-full">
                    <Flame className="h-4 w-4 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-extrabold text-emerald-700">Streak: {gameStreakCanDo}/3 Can Do</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/50 px-3 py-1.5 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-extrabold text-rose-700">Streak: {gameStreakNotYet}/2 Not Yet</span>
                  </div>
                </div>
              </div>

              {/* The Assessment Game Card Box */}
              <div className="relative max-w-2xl mx-auto min-h-[460px] bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden flex flex-col justify-between">
                
                {/* Level Up Banner Overlay */}
                {showLevelUpAnimation && (
                  <div className="absolute inset-0 bg-gradient-to-br from-giraffe-yellow/90 to-amber-500/90 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white text-center p-6 animate-pop-scale">
                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-4 animate-bounce">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight drop-shadow-md">LEVEL UP! 🌟</h2>
                    <p className="text-lg font-bold drop-shadow-sm">{levelUpTitle}</p>
                    <p className="text-xs text-white/80 mt-2 font-light">เก่งมากเลย! ปรับระดับคำถามให้ท้าทายยิ่งขึ้นอัตโนมัติ...</p>
                  </div>
                )}

                {/* Game Over / Settled Overlay */}
                {showGameOverAnimation && (
                  <div className="absolute inset-0 bg-gradient-to-br from-giraffe-brown-dark/95 to-giraffe-brown/95 z-30 flex flex-col items-center justify-center text-white text-center p-6 animate-pop-scale">
                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <Trophy className="h-10 w-10 text-giraffe-yellow" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 tracking-tight">การประเมินเกมสำเร็จแล้ว! 🏆</h2>
                    <p className="text-sm font-semibold max-w-md text-white/95 leading-relaxed">
                      ระดับประเมินสุดท้ายที่แนะนำ: <span className="font-extrabold text-giraffe-yellow text-lg">{getAutoRecommendation()}</span>
                    </p>
                    <p className="text-xs text-white/70 max-w-sm mt-3 leading-relaxed">
                      ระบบประมวลผลหยุดทดสอบเนื่องจากเด็กทำไม่ได้ติดต่อกัน 2 ข้อ เพื่อลดแรงกดดันและรักษาความรู้สึกของนักเรียน
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm px-6">
                      <button
                        onClick={() => {
                          setShowReflection(true);
                          setConfirmedLevel(getAutoRecommendation());
                        }}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark text-white text-xs font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        สรุปและบันทึกรายงาน 📝
                      </button>
                      <button
                        onClick={() => {
                          setGameStreakNotYet(0);
                          setShowGameOverAnimation(false);
                        }}
                        className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        ทดสอบต่อแบบแมนนวล
                      </button>
                    </div>
                  </div>
                )}

                {/* All Questions Evaluated Overlay */}
                {!currentQuestion && !showGameOverAnimation && (
                  <div className="absolute inset-0 bg-gradient-to-br from-safari-green/95 to-teal-800/95 z-20 flex flex-col items-center justify-center text-white text-center p-6 animate-pop-scale">
                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <Award className="h-10 w-10 text-white animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 tracking-tight">ครบทุกข้อแล้ว! 🎉</h2>
                    <p className="text-sm font-semibold max-w-md text-white/95">
                      ทำการตอบคำถามประเมินทักษะทั้งหมดครบถ้วนเรียบร้อยแล้ว
                    </p>
                    <p className="text-sm font-bold text-giraffe-yellow mt-2">
                      ระดับแนะนำ: {getAutoRecommendation()}
                    </p>
                    <button
                      onClick={() => {
                        setShowReflection(true);
                        setConfirmedLevel(getAutoRecommendation());
                      }}
                      className="mt-8 py-3.5 px-8 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark text-white text-xs font-bold rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      เสร็จสิ้นและบันทึกรายงาน 📝
                    </button>
                  </div>
                )}

                {/* Normal Question View inside Card */}
                {currentQuestion && (
                  <>
                    {/* Card Header Info */}
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold bg-giraffe-yellow/15 text-giraffe-yellow-dark px-3 py-1 rounded-full">
                          {currentQuestion.level}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-neutral-200/60 text-neutral-500 px-2.5 py-0.5 rounded-md">
                          {currentQuestion.sublevel}
                        </span>
                      </div>
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                        currentQuestion.skill === "Speaking"
                          ? "bg-orange-50 text-savannah-red border border-orange-100"
                          : "bg-emerald-50 text-safari-green border border-emerald-100"
                      }`}>
                        {currentQuestion.skill === "Speaking" ? "🗣️ Speaking Task" : "👂 Listening Task"}
                      </span>
                    </div>

                    {/* Interactive Visual/Placeholder Area */}
                    <div className="p-6 flex flex-col items-center justify-center grow bg-giraffe-spots-bg min-h-[220px]">
                      {currentQuestion.visualPromptId ? (
                        <div className="w-full max-w-sm">
                          {renderInlineVisualAid(currentQuestion.visualPromptId)}
                        </div>
                      ) : (
                        renderGiraffePlaceholder(currentQuestion.skill)
                      )}
                    </div>

                    {/* Question Text & Prompts */}
                    <div className="px-6 pb-6 text-center space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-giraffe-brown/40">คำสั่งสัมภาษณ์ครูพานักเรียนเล่นเกม</span>
                        <h2 className="text-2xl font-black text-giraffe-brown-dark tracking-tight leading-snug">
                          {currentQuestion.question}
                        </h2>
                      </div>

                      {/* Criteria Guideline Info */}
                      <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-left space-y-1.5 text-xs text-neutral-500">
                        <div>
                          <strong className="text-giraffe-brown/70">เกณฑ์ประเมิน (Standard):</strong> {currentQuestion.standard}
                        </div>
                        {currentQuestion.example && (
                          <div>
                            <strong className="text-giraffe-brown/70">แนวคำตอบ (Example):</strong> <span className="font-mono text-[11px] bg-white border border-neutral-200/60 px-1.5 py-0.5 rounded text-neutral-700 font-semibold">{currentQuestion.example}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teacher Action Buttons */}
                    <div className="p-5 border-t border-neutral-100 bg-neutral-50/30 flex gap-4">
                      <button
                        onClick={() => handleGameResponse(false)}
                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-savannah-red text-white text-sm font-extrabold rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✖ ยังไม่ผ่าน (Not Yet)
                      </button>
                      <button
                        onClick={() => handleGameResponse(true)}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-safari-green text-white text-sm font-extrabold rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✔ ผ่านแล้ว (Can Do)
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Bottom Mini Progress Map */}
              <div className="max-w-xl mx-auto bg-white/50 border border-white/80 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="text-center text-[10px] font-bold text-giraffe-brown/50 uppercase tracking-widest">
                  Assessment Level Progression Map
                </div>
                <div className="flex justify-between items-center relative px-6 py-2">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-neutral-200 -translate-y-1/2 z-0" />
                  
                  {/* Highlighted Connecting Line for current level */}
                  <div 
                    className="absolute top-1/2 left-8 h-1 bg-giraffe-yellow -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{
                      width: currentQuestion 
                        ? `${((levelOrder[currentQuestion.level] - 1) / 3) * 100}%` 
                        : "100%"
                    }}
                  />

                  {([
                    { name: "Seed", icon: "🌰", color: "bg-giraffe-yellow" },
                    { name: "Sprout", icon: "🌱", color: "bg-emerald-600" },
                    { name: "Sapling", icon: "🪴", color: "bg-teal-600" },
                    { name: "Tree", icon: "🌳", color: "bg-amber-800" }
                  ] as const).map((level) => {
                    const isCurrent = currentQuestion && currentQuestion.level === level.name;
                    const isPassed = currentQuestion 
                      ? levelOrder[level.name] < levelOrder[currentQuestion.level]
                      : true;

                    return (
                      <div key={level.name} className="flex flex-col items-center z-10 relative">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg border-2 shadow-sm transition-all duration-300 ${
                          isCurrent 
                            ? `${level.color} border-white text-white scale-110 ring-4 ring-giraffe-yellow/30 animate-pulse` 
                            : isPassed
                            ? "bg-emerald-500 border-white text-white" 
                            : "bg-white border-neutral-300 text-neutral-400 opacity-60"
                        }`}>
                          {level.icon}
                        </div>
                        <span className={`text-[10px] mt-1 font-bold ${
                          isCurrent ? "text-giraffe-brown-dark font-extrabold" : "text-neutral-400"
                        }`}>
                          {level.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )
        ) : (
          /* ==========================================
             VIEW 2: TEACHER REFLECTION & CONFIRMATION
             ========================================== */
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-giraffe-brown-dark flex items-center justify-center gap-2">
                <Smile className="h-6 w-6 text-giraffe-yellow-dark" />
                ผลลัพธ์และคำสะท้อนจากคุณครู
              </h2>
              <p className="text-xs text-giraffe-brown/60">
                สรุปเกณฑ์ความสามารถของนักเรียน และเขียนคอมเมนต์ประเมินผลสำหรับอธิบายผู้ปกครอง
              </p>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-safari-green/20 bg-emerald-50/20 text-center space-y-1">
                <div className="text-[10px] text-safari-green font-bold uppercase tracking-wider">Listening Ability</div>
                <div className="text-3xl font-extrabold text-safari-green">
                  {listeningTotal > 0 ? ((listeningCanDoCount / listeningTotal) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-[10px] text-neutral-400 font-light">
                  {listeningCanDoCount} จาก {listeningTotal} ข้อประเมินที่ทดสอบจริง
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-savannah-red/20 bg-orange-50/20 text-center space-y-1">
                <div className="text-[10px] text-savannah-red font-bold uppercase tracking-wider">Speaking Ability</div>
                <div className="text-3xl font-extrabold text-savannah-red">
                  {speakingTotal > 0 ? ((speakingCanDoCount / speakingTotal) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-[10px] text-neutral-400 font-light">
                  {speakingCanDoCount} จาก {speakingTotal} ข้อประเมินที่ทดสอบจริง
                </div>
              </div>
            </div>

            {/* System Recommendation */}
            <div className="p-4 rounded-2xl bg-white shadow-sm border border-neutral-100 space-y-2">
              <div className="text-xs font-bold text-neutral-400">System Recommendation:</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-giraffe-yellow/10 flex items-center justify-center text-xl">
                  {getAutoRecommendation().includes("Seed") ? "🌰" : getAutoRecommendation().includes("Sprout") ? "🌱" : getAutoRecommendation().includes("Sapling") ? "🪴" : "🎄"}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-giraffe-brown-dark">{getAutoRecommendation()}</h4>
                  <p className="text-[10px] text-neutral-400 font-light">
                    คำนวณจากเปอร์เซ็นต์ของคะแนนประเมินดิบที่ถามเด็กไปจริงทั้งหมด ({speakingTotal + listeningTotal} ข้อ)
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmed level */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-giraffe-yellow-dark" />
                ระดับขั้นสุดท้ายที่ครูยืนยันแนะนำ (Confirmed Placement Level)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "Seed 🌰", desc: "Pre-A1 Starters (Listener, Echoer)" },
                  { name: "Sprout 🌱", desc: "A1 Movers (Responder & Builder)" },
                  { name: "Apple Tree 🎄", desc: "A2 Flyers (Connector & Storyteller)" }
                ].map((level) => {
                  const isActive = confirmedLevel === level.name;
                  return (
                    <button
                      key={level.name}
                      onClick={() => setConfirmedLevel(level.name)}
                      className={`p-3 rounded-2xl border text-left transition-all spring-hover ${
                        isActive
                          ? "border-transparent bg-giraffe-yellow text-white shadow-md font-bold scale-[1.02]"
                          : "border-neutral-200 bg-white text-giraffe-brown"
                      }`}
                    >
                      <div className="text-xs font-extrabold">{level.name}</div>
                      <div className="text-[9px] opacity-80 mt-1 font-light leading-tight">{level.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-giraffe-brown/80 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-giraffe-yellow-dark" />
                คอมเมนต์ความเห็นและบันทึกประเมินผลการเรียน (Comment for Parents)
              </label>
              <textarea
                rows={5}
                className="w-full p-4 rounded-2xl border border-giraffe-brown/20 bg-white/80 focus:outline-none focus:ring-2 focus:ring-giraffe-yellow focus:border-transparent text-sm leading-relaxed transition-all"
                placeholder="เขียนจุดเด่น คำแนะนำ และข้อคิดเห็นของเด็กสำหรับการเรียนรู้ในคลาส..."
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
              />
              
              {/* Quick Comment Templates Grid */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/45 border border-giraffe-brown/10 text-xs">
                <div className="font-extrabold text-giraffe-brown flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  💡 คลังประโยคช่วยพิมพ์คอมเมนต์ (Click to Add Helper Phrases)
                </div>
                
                {/* Category 1: Strengths */}
                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400 font-semibold">🌟 จุดเด่น / Strengths:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "โต้ตอบคำศัพท์เดี่ยวและตอบคำถามสั้นๆ ได้อย่างคล่องแคล่ว",
                      "ออกเสียงพยัญชนะท้าย (Ending sounds) ได้ชัดเจนดีมาก",
                      "สามารถเข้าใจและปฏิบัติตามคำสั่งในคลาสเรียนได้อย่างถูกต้องรวดเร็ว",
                      "มีความมั่นใจและกล้าแสดงออกในการสื่อสารภาษาอังกฤษเป็นอย่างดี"
                    ].map((phrase, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const current = teacherComment.trim();
                          const nextComment = current ? `${current} ${phrase}` : phrase;
                          setTeacherComment(nextComment);
                        }}
                        className="py-1 px-2.5 bg-white hover:bg-giraffe-yellow/20 border border-neutral-200 hover:border-giraffe-yellow text-[10px] text-giraffe-brown-dark rounded-xl transition-all spring-hover"
                      >
                        + {phrase.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 2: Needs Practice */}
                <div className="space-y-1 mt-2">
                  <div className="text-[10px] text-neutral-400 font-semibold">🎯 จุดที่ควรพัฒนา / Focus Areas:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "แนะนำให้ฝึกการฟังและทำความเข้าใจคำสั่งภาษาอังกฤษที่ยาวและซับซ้อนขึ้น",
                      "ควรส่งเสริมการพูดโต้ตอบเป็นวลีสั้นๆ แทนคำศัพท์เดี่ยว",
                      "แนะนำให้ทบทวนและฝึกฝนการสะกดคำศัพท์พื้นฐานและการออกเสียง Phonics เพิ่มเติม",
                      "ควรเสริมความมั่นใจในการเริ่มบทสนทนาและการตอบอย่างอิสระ"
                    ].map((phrase, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const current = teacherComment.trim();
                          const nextComment = current ? `${current} ${phrase}` : phrase;
                          setTeacherComment(nextComment);
                        }}
                        className="py-1 px-2.5 bg-white hover:bg-giraffe-yellow/20 border border-neutral-200/80 hover:border-giraffe-yellow text-[10px] text-giraffe-brown-dark rounded-xl transition-all spring-hover"
                      >
                        + {phrase.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category 3: Recommendations */}
                <div className="space-y-1 mt-2">
                  <div className="text-[10px] text-neutral-400 font-semibold">🦒 คำแนะนำห้องเรียน / Classroom Suggestions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "แนะนำให้เรียนรู้ผ่านสื่อการเล่น (Activity-Based Learning) เพื่อเสริมสร้างทัศนคติเชิงบวก",
                      "เน้นสิ่งแวดล้อมภาษาอังกฤษ 100% (Total English Environment) เพื่อการซึมซับธรรมชาติ",
                      "แนะนำให้ผู้ปกครองกระตุ้นการโต้ตอบด้วยศัพท์สั้นๆ ในชีวิตประจำวันเพิ่มเติมที่บ้าน"
                    ].map((phrase, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const current = teacherComment.trim();
                          const nextComment = current ? `${current} ${phrase}` : phrase;
                          setTeacherComment(nextComment);
                        }}
                        className="py-1 px-2.5 bg-white hover:bg-giraffe-yellow/20 border border-neutral-200/80 hover:border-giraffe-yellow text-[10px] text-giraffe-brown-dark rounded-xl transition-all spring-hover"
                      >
                        + {phrase.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowReflection(false)}
                className="w-full sm:flex-1 py-3 border border-neutral-300 hover:border-giraffe-brown bg-white text-giraffe-brown font-extrabold rounded-2xl shadow-sm transition-all spring-hover text-xs"
              >
                ย้อนกลับไปแก้ไขคะแนน
              </button>
              <button
                onClick={handleSubmitAll}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-giraffe-yellow to-giraffe-yellow-dark text-white font-extrabold rounded-2xl shadow-md transition-all spring-hover text-xs flex items-center justify-center gap-2"
              >
                สร้างรายงาน Parent PDF
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Visual Aid Modal */}
      {activeVisualAid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="giraffe-glass max-w-lg w-full p-6 rounded-3xl shadow-2xl relative border border-white/80 animate-fade-in-up">
            <button 
              onClick={() => setActiveVisualAid(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-giraffe-yellow/10 text-giraffe-brown transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="border-b border-giraffe-brown/10 pb-2 mb-4">
              <h3 className="font-extrabold text-sm text-giraffe-brown-dark flex items-center gap-2">
                🦒 บัตรภาพประกอบสัมภาษณ์ (Interview Visual Prompts)
              </h3>
            </div>
            
            {renderVisualAidContent()}

            <div className="text-center text-[10px] text-giraffe-brown/50 mt-6 pt-4 border-t border-giraffe-brown/5">
              แตะหรือชี้หน้าจอเพื่อให้เด็กเลือกคำตอบ แล้วคุณครูติ๊กคะแนนที่หน้าจอตารางด้านล่าง
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
