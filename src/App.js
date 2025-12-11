import React, { useState, useEffect, useRef } from "react";
// Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
// UI Icons & Charts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MessageCircle,
  TrendingUp,
  User,
  CheckCircle,
  FileText,
  Activity,
  Award,
  Menu,
  X,
  Bell,
  Target,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Clock,
  AlertCircle,
  List,
  LogOut,
  Lock,
  ShieldCheck,
  Edit3,
  Upload,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
  Brain,
  Check,
  PlayCircle,
  Headphones,
  Book,
  HelpCircle,
  PenTool,
  ClipboardList,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  CheckSquare,
  Quote,
  Star,
  Video,
  Hash,
  BarChart2,
  CheckCircle2,
  XCircle,
  Minus,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

// --- FIREBASE AYARLARI ---
const firebaseConfig = {
  apiKey: "AIzaSyCWPV7MUtjn7NXeLd-9WDuwIUDxAlKBfqc",
  authDomain: "ozelders-44c80.firebaseapp.com",
  projectId: "ozelders-44c80",
  storageBucket: "ozelders-44c80.firebasestorage.app",
  messagingSenderId: "1017361480268",
  appId: "1:1017361480268:web:686b33fde97a4f9ca912e9",
  measurementId: "G-DPRYL433XN",
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Hatası:", error);
}

// --- SABİTLER ---
const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];
const HOURS = Array.from({ length: 15 }, (_, i) =>
  `${i + 8}:00`.padStart(5, "0")
);
const SUBJECTS = ["Matematik", "Fizik", "Kimya", "Biyoloji"];
const TRIAL_TYPES = ["TYT", "AYT", "Branş"];

const TRIAL_FIELDS_CONFIG = {
  "TYT Genel": ["Türkçe", "Sosyal", "Matematik", "Fen"],
  "AYT Genel": [
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Edebiyat",
    "Tarih-1",
    "Coğrafya-1",
  ],
  "Fen Bilimleri (TYT)": ["Fizik", "Kimya", "Biyoloji"],
  "Türkçe-Sosyal (TYT)": ["Türkçe", "Tarih", "Coğrafya", "Felsefe", "Din"],
};

const MOTIVATION_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Gelecek, bugün ne yaptığına bağlıdır.",
  "Zorluklar, başarının değerini artıran süslerdir.",
  "Sadece çalışmak yetmez, akıllıca çalışmak gerekir.",
  "Hata yapmaktan korkma, denemekten vazgeçmekten kork.",
  "Bugün yaptığın fedakarlıklar, yarınki gülüşlerin olacak.",
  "Zirveye giden yol yokuştur ama manzarası güzeldir.",
];

const App = () => {
  // --- STATE ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");

  // Navigation
  const [viewMode, setViewMode] = useState("selection");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [subTab, setSubTab] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  // UI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Forms & Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [tempData, setTempData] = useState({});
  const [newStudentModal, setNewStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({});

  // Quiz & Trial States
  const [quizTaking, setQuizTaking] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [trialInputData, setTrialInputData] = useState({});

  // Coaching Specific States
  const [editingGoals, setEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState({});

  // Homework State
  const [selectedHomework, setSelectedHomework] = useState(null);

  const chatEndRef = useRef(null);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
        1000 /
        60 /
        60 /
        24
    );
    setDailyQuote(MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length]);
  }, []);

  // --- HELPERS ---
  const displayStudentId =
    userRole === "student" || userRole === "parent"
      ? loggedInStudentId
      : selectedStudentId;
  const currentStudent = students.find((s) => s.id === displayStudentId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStudent?.chat, activeTab, subTab]);

  // --- ACTIONS ---
  const handleLogin = () => {
    setLoginError("");
    if (loginCode === "bfk09052001") {
      setUserRole("teacher");
      setViewMode("selection");
      return;
    }
    const student = students.find((s) => s.studentPass === loginCode);
    if (student) {
      setUserRole("student");
      setLoggedInStudentId(student.id);
      setViewMode("profile");
      setActiveTab("dashboard");
      return;
    }
    const parent = students.find((s) => s.parentPass === loginCode);
    if (parent) {
      setUserRole("parent");
      setLoggedInStudentId(parent.id);
      setViewMode("profile");
      setActiveTab("dashboard");
      return;
    }
    setLoginError("Hatalı Şifre!");
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInStudentId(null);
    setSelectedStudentId(null);
    setViewMode("selection");
    setActiveTab("dashboard");
    setLoginCode("");
  };

  const updateDb = async (newData, notificationText = null) => {
    if (!db || !currentStudent) return;

    let finalData = { ...newData };

    // Bildirim Ekleme Mantığı
    if (notificationText) {
      const newNotification = {
        id: Date.now(),
        text: notificationText,
        date: new Date().toLocaleString("tr-TR"),
        read: false,
        from: userRole,
        to: userRole === "teacher" ? "student" : "teacher",
      };
      const currentNotifications = currentStudent.notifications || [];
      finalData.notifications = [newNotification, ...currentNotifications];
    }

    const cleanData = JSON.parse(JSON.stringify(finalData));
    await updateDoc(doc(db, "students", currentStudent.id), cleanData);
  };

  const markNotificationsAsRead = () => {
    if (!currentStudent?.notifications) return;
    const targetFrom = userRole === "teacher" ? "student" : "teacher";

    const updatedNotes = currentStudent.notifications.map((n) => {
      if (n.from === targetFrom && !n.read) {
        return { ...n, read: true };
      }
      return n;
    });

    const cleanData = JSON.parse(
      JSON.stringify({ notifications: updatedNotes })
    );
    updateDoc(doc(db, "students", currentStudent.id), cleanData);
  };

  // --- CRUD OPERATIONS ---
  const addToSchedule = () => {
    const newSchedule = [
      ...(currentStudent.schedule || []),
      { id: Date.now(), ...tempData },
    ];
    const note = `${userRole === "teacher" ? "Eğitmen" : "Öğrenci"} programa ${
      tempData.subject
    } dersi ekledi.`;
    updateDb({ schedule: newSchedule }, note);
    setModalOpen(false);
  };

  const deleteScheduleItem = (itemId) => {
    const newSchedule = currentStudent.schedule.filter((i) => i.id !== itemId);
    updateDb({ schedule: newSchedule });
  };

  const addResource = () => {
    const newResources = [
      ...(currentStudent.subjectResources || []),
      { id: Date.now(), ...tempData, subject: selectedSubject || "Genel" },
    ];
    const note = `${
      userRole === "teacher" ? "Eğitmen" : "Öğrenci"
    } yeni bir kaynak yükledi: ${tempData.title}`;
    updateDb({ subjectResources: newResources }, note);
    setModalOpen(false);
  };

  const addMessage = () => {
    const msg = {
      id: Date.now(),
      sender: userRole === "teacher" ? "teacher" : "student",
      text: tempData.text,
      file: tempData.file,
      date: new Date().toLocaleString(),
    };
    const note = `Yeni mesaj: ${
      tempData.text
        ? tempData.text.substring(0, 15) + "..."
        : "Dosya gönderildi."
    }`;
    updateDb({ chat: [...(currentStudent.chat || []), msg] }, note);
    setTempData({});
  };

  const addDiaryEntry = () => {
    const entry = {
      id: Date.now(),
      text: tempData.text,
      date: new Date().toLocaleDateString(),
    };
    const note = userRole === "student" ? "Öğrenci günlük girişi yaptı." : null;
    updateDb({ diary: [...(currentStudent.diary || []), entry] }, note);
    setModalOpen(false);
  };

  const addToList = (listType) => {
    const item = {
      id: Date.now(),
      title: tempData.title,
      link: tempData.link,
      status: "pending",
    };
    const listKey =
      listType === "read"
        ? "readingList"
        : listType === "watch"
        ? "watchingList"
        : "todoList";
    const note = `${userRole === "teacher" ? "Eğitmen" : "Öğrenci"} ${
      listType === "todo" ? "yapılacaklar" : "okuma/izleme"
    } listesine ekleme yaptı.`;
    updateDb({ [listKey]: [...(currentStudent[listKey] || []), item] }, note);
    setModalOpen(false);
  };

  const addDreamboardItem = () => {
    const item = { id: Date.now(), ...tempData };
    updateDb(
      { dreamboard: [...(currentStudent.dreamboard || []), item] },
      "Hayal panosuna yeni ekleme yapıldı."
    );
    setModalOpen(false);
  };

  const addPrivateLesson = () => {
    const lesson = { id: Date.now(), ...tempData, file: tempData.file };
    updateDb(
      { privateLessons: [...(currentStudent.privateLessons || []), lesson] },
      "Yeni özel ders notu girildi."
    );
    setModalOpen(false);
  };

  // --- HOMEWORK (ÖDEV) YÖNETİMİ ---
  const addHomework = () => {
    const homework = {
      id: Date.now(),
      subject: tempData.subject,
      topic: tempData.topic,
      source: tempData.source, // URL or Book Name
      deadline: tempData.deadline,
      description: tempData.description,
      status: "assigned", // assigned, completed, incomplete
      assignedDate: new Date().toLocaleDateString(),
    };
    updateDb(
      { assignments: [...(currentStudent.assignments || []), homework] },
      `Yeni ödev atandı: ${homework.subject} - ${homework.topic}`
    );
    setModalOpen(false);
  };

  const submitHomework = () => {
    if (!selectedHomework) return;

    const updatedHomework = {
      ...selectedHomework,
      status: tempData.status, // 'completed' or 'incomplete'
      difficulty: tempData.difficulty,
      studentComment: tempData.studentComment,
      reason: tempData.reason, // yapmadıysa nedeni
    };

    const newAssignments = currentStudent.assignments.map((a) =>
      a.id === selectedHomework.id ? updatedHomework : a
    );
    const note =
      tempData.status === "completed"
        ? `Ödev tamamlandı: ${updatedHomework.topic}`
        : `Ödev yapılamadı: ${updatedHomework.topic}`;

    updateDb({ assignments: newAssignments }, note);
    setModalOpen(false);
    setSelectedHomework(null);
  };

  const deleteHomework = (id) => {
    const newAssignments = currentStudent.assignments.filter(
      (a) => a.id !== id
    );
    updateDb({ assignments: newAssignments });
  };

  const calculateNet = (d, y) => Number(d) - Number(y) * 0.25;

  const addTrial = () => {
    let totalNet = 0;
    const finalResults = {};
    Object.keys(trialInputData || {}).forEach((field) => {
      const d = Number(trialInputData[field]?.d || 0);
      const y = Number(trialInputData[field]?.y || 0);
      const net = calculateNet(d, y);
      totalNet += net;
      finalResults[field] = { d, y, n: net };
    });

    const trial = {
      id: Date.now(),
      ...tempData,
      results: finalResults,
      totalNet: totalNet,
      status: "Completed",
      comment: tempData.comment || "",
    };
    updateDb(
      { trials: [...(currentStudent.trials || []), trial] },
      `Yeni deneme sonucu: ${totalNet} Net`
    );
    setModalOpen(false);
    setTrialInputData({});
  };

  const addQuestionStats = () => {
    const total =
      Number(tempData.correct) +
      Number(tempData.incorrect) +
      Number(tempData.empty);
    const successRate =
      total > 0 ? Math.round((Number(tempData.correct) / total) * 100) : 0;
    const stat = {
      id: Date.now(),
      ...tempData,
      total,
      successRate,
      date: new Date().toLocaleDateString(),
    };
    updateDb(
      { questionStats: [...(currentStudent.questionStats || []), stat] },
      "Yeni soru analizi eklendi."
    );
    setModalOpen(false);
  };

  const addQuiz = () => {
    const quiz = { id: Date.now(), ...tempData, status: "assigned" };
    updateDb(
      { quizzes: [...(currentStudent.quizzes || []), quiz] },
      "Yeni bir quiz atandı."
    );
    setModalOpen(false);
  };

  const submitQuiz = () => {
    if (!quizTaking) return;
    let correctCount = 0;
    let incorrectCount = 0;
    let emptyCount = 0;
    if (quizTaking.type === "structured") {
      quizTaking.questions.forEach((q) => {
        const studentAns = quizAnswers[q.id];
        if (!studentAns) emptyCount++;
        else if (studentAns === q.correct) correctCount++;
        else incorrectCount++;
      });
    }
    const updatedQuiz = {
      ...quizTaking,
      status: "completed",
      studentAnswers: quizAnswers,
      result: {
        correct: correctCount,
        incorrect: incorrectCount,
        empty: emptyCount,
      },
      studentComment: tempData.studentComment,
    };
    const newQuizzes = currentStudent.quizzes.map((q) =>
      q.id === quizTaking.id ? updatedQuiz : q
    );
    updateDb(
      { quizzes: newQuizzes },
      `Quiz tamamlandı: ${correctCount} D / ${incorrectCount} Y`
    );
    setQuizTaking(null);
    setQuizAnswers({});
    setModalOpen(false);
  };

  const updateTopicOfWeek = () => {
    updateDb(
      { topicOfWeek: { title: tempData.title, progress: tempData.progress } },
      "Haftanın konusu güncellendi."
    );
    setModalOpen(false);
  };

  const saveSubjectTopic = () => {
    const topicData = {
      id: tempData.id || Date.now(),
      subject: selectedSubject,
      ...tempData,
      date: new Date().toLocaleDateString(),
    };
    const currentProgress = currentStudent.subjectProgress || {};
    const subjectList = currentProgress[selectedSubject] || [];
    let updatedList = tempData.id
      ? subjectList.map((item) => (item.id === tempData.id ? topicData : item))
      : [topicData, ...subjectList];
    updateDb(
      {
        subjectProgress: { ...currentProgress, [selectedSubject]: updatedList },
      },
      `${selectedSubject} dersine konu/çalışma eklendi.`
    );
    setModalOpen(false);
  };

  const deleteSubjectTopic = (topicId) => {
    const currentProgress = currentStudent.subjectProgress || {};
    const updatedList = currentProgress[selectedSubject].filter(
      (item) => item.id !== topicId
    );
    updateDb({
      subjectProgress: { ...currentProgress, [selectedSubject]: updatedList },
    });
  };

  const saveGoals = () => {
    updateDb({ goals: tempGoals }, "Hedefler güncellendi.");
    setEditingGoals(false);
  };

  const createStudent = async () => {
    if (!newStudentData.name) return;
    const newS = {
      ...newStudentData,
      avatar: newStudentData.name.substring(0, 2).toUpperCase(),
      studentPass: newStudentData.studentPass || "1234",
      parentPass: newStudentData.parentPass || "1234",
      schedule: [],
      subjectResources: [],
      chat: [],
      trials: [],
      diary: [],
      readingList: [],
      watchingList: [],
      todoList: [],
      questionStats: [],
      quizzes: [],
      subjectProgress: {},
      dreamboard: [],
      privateLessons: [],
      assignments: [],
      notifications: [],
      goals: {
        target: "",
        motivation: "",
        ranking: "",
        netTargets: { tyt: {}, ayt: {} },
      },
      topicOfWeek: { title: "Fonksiyonlar", progress: 50 },
    };
    await addDoc(collection(db, "students"), newS);
    setNewStudentModal(false);
  };

  const processFile = (file) => {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "file",
    };
  };

  // --- HESAPLAMALAR ---
  const calculateResponsibility = () => {
    if (!currentStudent)
      return { homework: 0, goal: 0, total: 0, totalSolved: 0 };

    let totalSolvedQuestions = 0;
    if (currentStudent.subjectProgress) {
      Object.values(currentStudent.subjectProgress).forEach((list) => {
        list.forEach((item) => {
          totalSolvedQuestions += Number(item.solved || 0);
        });
      });
    }

    const totalGoals = currentStudent.todoList?.length || 0;
    const doneGoals =
      currentStudent.todoList?.filter((t) => t.status === "done")?.length || 0;
    const goalPercent =
      totalGoals === 0 ? 0 : Math.round((doneGoals / totalGoals) * 100);

    const totalHW = currentStudent.assignments?.length || 0;
    const doneHW =
      currentStudent.assignments?.filter((a) => a.status === "completed")
        ?.length || 0;
    const hwPercent = totalHW === 0 ? 0 : Math.round((doneHW / totalHW) * 100);

    const totalScore = Math.min(
      100,
      Math.round(
        goalPercent * 0.4 +
          hwPercent * 0.4 +
          (totalSolvedQuestions > 500 ? 20 : totalSolvedQuestions / 25)
      )
    );

    return {
      totalSolved: totalSolvedQuestions,
      goal: goalPercent,
      total: totalScore,
      homework: hwPercent,
    };
  };

  const getWeakTopics = () => {
    if (!currentStudent?.questionStats) return [];
    return currentStudent.questionStats
      .filter((s) => s.successRate < 40)
      .slice(0, 5);
  };
  const getRecentTrials = () => {
    if (!currentStudent?.trials) return [];
    return [...currentStudent.trials].sort((a, b) => b.id - a.id).slice(0, 5);
  };

  // --- NOTIFICATION HELPER ---
  const getMyNotifications = () => {
    if (!currentStudent?.notifications) return [];
    const myTarget = userRole === "teacher" ? "teacher" : "student";
    return currentStudent.notifications.filter(
      (n) => n.to === myTarget || (userRole === "parent" && n.to === "teacher")
    );
  };

  const myNotifications = getMyNotifications();
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  // --- RENDER ---
  if (!userRole)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm border border-white/20 shadow-xl">
          <h1 className="text-3xl font-bold text-white text-center mb-6">
            Öğrenci Paneli
          </h1>
          <input
            type="password"
            placeholder="Giriş Kodu"
            className="w-full p-3 rounded-xl bg-slate-800/50 text-white border border-slate-600 mb-2 focus:ring-2 ring-indigo-500 outline-none"
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
          />
          {loginError && (
            <p className="text-red-400 text-sm mb-2">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );

  if (userRole === "teacher" && viewMode === "selection")
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Öğrenciler</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setNewStudentModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
              >
                <Plus className="mr-2" /> Yeni Ekle
              </button>
              <button
                onClick={() => setUserRole(null)}
                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg"
              >
                Çıkış
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setViewMode("profile");
                  setActiveTab("dashboard");
                }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer border border-slate-200 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {s.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold">{s.name}</h3>
                    <p className="text-sm text-slate-500">{s.grade}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-slate-400 flex justify-between">
                  <span>Öğrenci: {s.studentPass}</span>
                  <span>Veli: {s.parentPass}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {newStudentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-3">
              <h3 className="font-bold text-lg">Öğrenci Ekle</h3>
              <input
                placeholder="Ad Soyad"
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setNewStudentData({ ...newStudentData, name: e.target.value })
                }
              />
              <input
                placeholder="Sınıf"
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    grade: e.target.value,
                  })
                }
              />
              <input
                placeholder="Öğrenci Şifresi"
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    studentPass: e.target.value,
                  })
                }
              />
              <input
                placeholder="Veli Şifresi"
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setNewStudentData({
                    ...newStudentData,
                    parentPass: e.target.value,
                  })
                }
              />
              <button
                onClick={createStudent}
                className="w-full bg-indigo-600 text-white p-2 rounded"
              >
                Oluştur
              </button>
              <button
                onClick={() => setNewStudentModal(false)}
                className="w-full text-slate-500 p-2"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    );

  const resp = calculateResponsibility();
  const weakTopics = getWeakTopics();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative z-20 w-64 bg-slate-900 text-slate-300 h-full flex flex-col transition-transform ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <span className="font-bold text-white text-lg">Panelim</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden"
          >
            <X />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg shadow-indigo-900/50">
            {currentStudent.avatar}
          </div>
          <div className="text-white font-bold">{currentStudent.name}</div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-lg"
                : "hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="mr-3" size={20} /> Ana Sayfa
          </button>
          <button
            onClick={() => {
              setActiveTab("classes");
              setSubTab("schedule");
            }}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              activeTab === "classes"
                ? "bg-indigo-600 text-white shadow-lg"
                : "hover:bg-slate-800"
            }`}
          >
            <Calendar className="mr-3" size={20} /> Dersler
          </button>
          <button
            onClick={() => {
              setActiveTab("assessment");
              setSubTab("chat");
            }}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              activeTab === "assessment"
                ? "bg-indigo-600 text-white shadow-lg"
                : "hover:bg-slate-800"
            }`}
          >
            <Activity className="mr-3" size={20} /> Deneme & Soru
          </button>
          <button
            onClick={() => setActiveTab("coaching")}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${
              activeTab === "coaching"
                ? "bg-indigo-600 text-white shadow-lg"
                : "hover:bg-slate-800"
            }`}
          >
            <Brain className="mr-3" size={20} /> Koçluk
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          {userRole === "teacher" && (
            <button
              onClick={() => setViewMode("selection")}
              className="w-full flex items-center text-slate-400 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="mr-2" size={16} /> Listeye Dön
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-2" size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-600"
            >
              <Menu />
            </button>
            <h2 className="font-bold text-xl text-slate-800 capitalize">
              {activeTab === "dashboard"
                ? "Genel Bakış"
                : activeTab === "classes"
                ? "Dersler"
                : activeTab === "assessment"
                ? "Ölçme & Değerlendirme"
                : "Koçluk"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {currentStudent.goals?.target && (
              <span className="hidden md:inline-block bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-bold border border-indigo-100">
                Hedef: {currentStudent.goals.target}
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="relative p-2 rounded-full hover:bg-slate-100 transition"
              >
                <Bell className="text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b bg-slate-50 font-bold text-slate-700 text-sm flex justify-between items-center">
                    <span>Bildirimler</span>
                    <span className="text-xs font-normal text-slate-400">
                      Son Hareketler
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {myNotifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        Yeni bildirim yok.
                      </div>
                    ) : (
                      myNotifications.slice(0, 10).map((n, i) => (
                        <div
                          key={i}
                          className={`p-3 border-b text-sm last:border-0 hover:bg-slate-50 ${
                            !n.read ? "bg-indigo-50/50" : ""
                          }`}
                        >
                          <p className="text-slate-700 mb-1">{n.text}</p>
                          <span className="text-[10px] text-slate-400">
                            {n.date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-slate-50">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden text-center">
                <Quote className="text-indigo-200 mb-4 mx-auto" size={48} />
                <h2 className="text-xl font-bold text-white italic relative z-10">
                  "{dailyQuote}"
                </h2>
              </div>
              {weakTopics.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-rose-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-rose-800">
                      Dikkat Gerektiren Konular (&lt; %40 Başarı)
                    </h4>
                    <p className="text-sm text-rose-700 mt-1">
                      Bu konulara tekrar bakmalısın:{" "}
                      {weakTopics.map((t) => t.topic).join(", ")}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center mb-6">
                    <TrendingUp className="mr-2 text-indigo-600" /> Genel Net
                    Analizi
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentStudent.trials || []}>
                        <defs>
                          <linearGradient
                            id="colorNet"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4f46e5"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4f46e5"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="totalNet"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorNet)"
                          name="Net"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Target className="mr-2 text-rose-500" /> Son Denemeler
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {getRecentTrials().map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-indigo-900 line-clamp-1">
                            {t.name}
                          </span>
                          <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500">
                            {t.date}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 uppercase">
                            {t.type === "branch" ? t.branchSubject : t.type}
                          </span>
                          <span className="font-bold text-emerald-600">
                            {t.totalNet || 0} Net
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center">
                  <Star className="mr-2 text-amber-500" /> Sorumluluk Puanı &
                  İstatistikler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-indigo-600">
                      {resp.totalSolved}
                    </span>
                    <span className="text-xs text-slate-500 uppercase font-bold mt-2">
                      Toplam Çözülen Soru
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#f1f5f9"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 40 * (1 - resp.goal / 100)
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold text-purple-600">
                        %{resp.goal}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-600 mt-2">
                      Hedef Tamamlama
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#f1f5f9"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#10b981"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 40 * (1 - resp.homework / 100)
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-bold text-emerald-600">
                        %{resp.homework}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-600 mt-2">
                      Ödev Tamamlama
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab("classes");
                  setSubTab("schedule");
                }}
                className="w-full bg-indigo-50 border-2 border-dashed border-indigo-200 text-indigo-700 font-bold p-5 rounded-2xl hover:bg-indigo-100 transition flex items-center justify-center group"
              >
                <BookOpen className="mr-3 group-hover:scale-110 transition-transform" />{" "}
                Dersler Bölümüne Git
              </button>
            </div>
          )}

          {activeTab === "classes" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex overflow-x-auto gap-2 pb-2">
                <button
                  onClick={() => setSubTab("schedule")}
                  className={`px-6 py-2 rounded-lg font-bold text-sm ${
                    subTab === "schedule"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Ders Programı
                </button>
                <button
                  onClick={() => {
                    setSubTab("subjects");
                    setSelectedSubject(null);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-sm ${
                    subTab === "subjects"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Derslerim
                </button>
                <button
                  onClick={() => {
                    setSubTab("resources");
                    setSelectedSubject(null);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-sm ${
                    subTab === "resources"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Kaynaklar
                </button>
                <button
                  onClick={() => {
                    setSubTab("privateLessons");
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-sm ${
                    subTab === "privateLessons"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Özel Dersler
                </button>
                <button
                  onClick={() => {
                    setSubTab("homeworks");
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-sm ${
                    subTab === "homeworks"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Ödevler
                </button>
              </div>

              {/* ... other subtabs ... */}
              {subTab === "schedule" && (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="p-4 border-b bg-slate-50 font-bold flex justify-between">
                    <span>Haftalık Program</span>
                    {userRole !== "parent" && (
                      <span className="text-xs font-normal text-slate-500">
                        Kutucuğa tıkla ve ekle
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 divide-y divide-slate-100">
                    {DAYS.map((day) => (
                      <div key={day} className="flex flex-col md:flex-row">
                        <div className="p-4 w-full md:w-32 bg-slate-50 font-bold text-slate-600 text-sm flex items-center border-b md:border-b-0 md:border-r border-slate-100">
                          {day}
                        </div>
                        <div className="flex-1 p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {HOURS.map((hour) => {
                            const item = currentStudent.schedule?.find(
                              (s) => s.day === day && s.hour === hour
                            );
                            return (
                              <div
                                key={hour}
                                onClick={() => {
                                  if (userRole !== "parent") {
                                    if (item) {
                                      deleteScheduleItem(item.id);
                                    } else {
                                      setTempData({ day, hour });
                                      setModalType("schedule");
                                      setModalOpen(true);
                                    }
                                  }
                                }}
                                className={`p-2 rounded-lg text-xs min-h-[60px] cursor-pointer transition-all border ${
                                  item
                                    ? "bg-indigo-50 border-indigo-200 hover:bg-red-50 hover:border-red-200 group"
                                    : "border-slate-100 hover:border-indigo-300"
                                }`}
                              >
                                <div className="text-[10px] text-slate-400 mb-1">
                                  {hour}
                                </div>
                                {item ? (
                                  <div className="font-bold text-indigo-700 group-hover:text-red-600 transition-colors">
                                    {item.subject}
                                    <br />
                                    <span className="font-normal text-slate-600">
                                      {item.topic}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100">
                                    <Plus
                                      size={14}
                                      className="text-indigo-400"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subTab === "subjects" && (
                <div className="space-y-6">
                  {!selectedSubject ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {SUBJECTS.map((subject) => (
                        <div
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                            {subject === "Matematik" ? (
                              <Calculator
                                size={32}
                                className="text-slate-400 group-hover:text-indigo-600"
                              />
                            ) : subject === "Fizik" ? (
                              <Atom
                                size={32}
                                className="text-slate-400 group-hover:text-indigo-600"
                              />
                            ) : subject === "Kimya" ? (
                              <FlaskConical
                                size={32}
                                className="text-slate-400 group-hover:text-indigo-600"
                              />
                            ) : (
                              <Dna
                                size={32}
                                className="text-slate-400 group-hover:text-indigo-600"
                              />
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {subject}
                          </h3>
                          <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                            <span>
                              {currentStudent.subjectProgress?.[subject]
                                ?.length || 0}{" "}
                              Konu Kaydı
                            </span>
                            <ArrowLeft className="rotate-180" size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <button
                          onClick={() => setSelectedSubject(null)}
                          className="flex items-center text-slate-500 hover:text-indigo-600 font-bold"
                        >
                          <ArrowLeft className="mr-2" /> {selectedSubject}
                        </button>
                        <button
                          onClick={() => {
                            setModalType("subjectTopic");
                            setTempData({});
                            setModalOpen(true);
                          }}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold shadow hover:bg-indigo-700 transition"
                        >
                          <Plus className="mr-2" size={16} /> Konu/Çalışma Ekle
                        </button>
                      </div>
                      <div className="space-y-4">
                        {!currentStudent.subjectProgress?.[selectedSubject] ||
                        currentStudent.subjectProgress[selectedSubject]
                          .length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                            <List
                              size={48}
                              className="mx-auto text-slate-300 mb-3"
                            />
                            <p className="text-slate-500">
                              Bu ders için henüz çalışma kaydı girmedin.
                            </p>
                          </div>
                        ) : (
                          currentStudent.subjectProgress[selectedSubject].map(
                            (item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setTempData(item);
                                  setModalType("subjectTopic");
                                  setModalOpen(true);
                                }}
                                className="border border-slate-200 p-4 rounded-xl hover:border-indigo-400 hover:shadow-md transition cursor-pointer group bg-slate-50/50"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-bold text-lg text-slate-800">
                                      {item.topic}
                                    </h4>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                        item.status === "Completed"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {item.status === "Completed"
                                        ? "Tamamlandı"
                                        : "Devam Ediyor"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {item.date}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                                  <div className="bg-white p-2 rounded border">
                                    ✅ {item.correct} Doğru
                                  </div>
                                  <div className="bg-white p-2 rounded border">
                                    ❌ {item.incorrect} Yanlış
                                  </div>
                                  <div className="bg-white p-2 rounded border">
                                    📝 {item.solved} Soru
                                  </div>
                                  <div className="bg-white p-2 rounded border">
                                    ⭐ {item.difficulty}/5 Zorluk
                                  </div>
                                </div>
                                {item.comment && (
                                  <p className="text-xs text-slate-500 italic border-t pt-2">
                                    "{item.comment}"
                                  </p>
                                )}
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {subTab === "privateLessons" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">
                      Özel Ders Takibi
                    </h3>
                    <button
                      onClick={() => {
                        setModalType("privateLesson");
                        setTempData({});
                        setModalOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold"
                    >
                      <Plus className="mr-2" size={16} /> Ders Ekle
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStudent.privateLessons?.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs text-slate-400 font-mono block">
                              {lesson.date}
                            </span>
                            <h4 className="font-bold text-lg text-indigo-900">
                              {lesson.subject}
                            </h4>
                          </div>
                          <span className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {lesson.topic}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 italic">
                          "{lesson.comment}"
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          {lesson.file && (
                            <div className="flex items-center text-xs text-indigo-600">
                              <FileText size={14} className="mr-1" />{" "}
                              {lesson.file.name}
                            </div>
                          )}
                          {userRole !== "parent" && (
                            <button
                              onClick={() => {
                                const n = currentStudent.privateLessons.filter(
                                  (x) => x.id !== lesson.id
                                );
                                updateDb({ privateLessons: n });
                              }}
                              className="text-slate-300 hover:text-red-500 ml-auto"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {!currentStudent.privateLessons?.length && (
                      <div className="col-span-full py-12 text-center text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
                        Henüz özel ders kaydı yok.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subTab === "resources" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Genel Kaynaklar</h3>
                    <button
                      onClick={() => {
                        setModalType("resource");
                        setModalOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                    >
                      <Upload className="mr-2" size={16} /> Kaynak Ekle
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentStudent.subjectResources
                      ?.filter((r) => !r.subject || r.subject === "Genel")
                      .map((res) => (
                        <div
                          key={res.id}
                          className="border p-4 rounded-xl flex items-start gap-4 hover:shadow-md transition bg-white"
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              res.type === "link"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {res.type === "link" ? <LinkIcon /> : <FileText />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">
                              {res.title}
                            </h4>
                            <p className="text-xs text-slate-400 mb-1">
                              {res.subject || "Genel"}
                            </p>
                            <p className="text-sm text-slate-500 mb-2">
                              {res.desc}
                            </p>
                            <a
                              href={res.url}
                              target="_blank"
                              className="text-xs font-bold text-indigo-600 hover:underline flex items-center"
                            >
                              Aç{" "}
                              <ArrowLeft
                                size={12}
                                className="rotate-180 ml-1"
                              />
                            </a>
                          </div>
                          {userRole !== "parent" && (
                            <button
                              onClick={() => {
                                const newR =
                                  currentStudent.subjectResources.filter(
                                    (x) => x.id !== res.id
                                  );
                                updateDb({ subjectResources: newR });
                              }}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    {!currentStudent.subjectResources?.filter(
                      (r) => !r.subject || r.subject === "Genel"
                    ).length && (
                      <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed rounded-xl">
                        Kaynak yok.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ÖDEVLER SEKMESİ (YENİ) */}
              {subTab === "homeworks" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">
                      Ödev Takibi
                    </h3>
                    {userRole === "teacher" && (
                      <button
                        onClick={() => {
                          setModalType("homework-assign");
                          setTempData({});
                          setModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold"
                      >
                        <Plus className="mr-2" size={16} /> Ödev Ver
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {currentStudent.assignments?.map((hw) => (
                      <div
                        key={hw.id}
                        className={`bg-white border rounded-xl p-5 shadow-sm transition hover:shadow-md ${
                          hw.status === "completed"
                            ? "border-emerald-200"
                            : hw.status === "incomplete"
                            ? "border-red-200"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
                              {hw.subject}
                            </span>
                            <h4 className="font-bold text-lg text-slate-800">
                              {hw.topic}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                              {hw.description}
                            </p>
                            {hw.source && (
                              <a
                                href={hw.source}
                                target="_blank"
                                className="text-xs text-indigo-600 hover:underline flex items-center mt-2"
                              >
                                <LinkIcon size={12} className="mr-1" />{" "}
                                Kaynak/Link
                              </a>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                hw.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : hw.status === "incomplete"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {hw.status === "completed"
                                ? "Tamamlandı"
                                : hw.status === "incomplete"
                                ? "Yapılmadı"
                                : "Bekliyor"}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center">
                              <Clock size={12} className="mr-1" /> {hw.deadline}
                            </span>
                          </div>
                        </div>
                        {/* Öğrenci Geri Bildirimi */}
                        {(hw.status === "completed" ||
                          hw.status === "incomplete") && (
                          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg">
                            {hw.status === "completed" && (
                              <div className="flex gap-4 text-xs mb-2">
                                <span className="flex items-center text-emerald-600 font-bold">
                                  <CheckCircle2 size={14} className="mr-1" />{" "}
                                  Tamamlandı
                                </span>
                                <span className="flex items-center text-amber-600">
                                  <Star size={14} className="mr-1" /> Zorluk:{" "}
                                  {hw.difficulty}/5
                                </span>
                              </div>
                            )}
                            {hw.status === "incomplete" && (
                              <div className="flex items-center text-xs text-red-600 font-bold mb-2">
                                <AlertTriangle size={14} className="mr-1" />{" "}
                                Mazeret: {hw.reason}
                              </div>
                            )}
                            {hw.studentComment && (
                              <p className="text-xs text-slate-600 italic">
                                "{hw.studentComment}"
                              </p>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex gap-2 justify-end">
                          {userRole === "teacher" && (
                            <button
                              onClick={() => deleteHomework(hw.id)}
                              className="text-slate-400 hover:text-red-500 p-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {userRole === "student" &&
                            hw.status === "assigned" && (
                              <button
                                onClick={() => {
                                  setSelectedHomework(hw);
                                  setModalType("homework-submit");
                                  setTempData({});
                                  setModalOpen(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                              >
                                Durum Gir
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                    {!currentStudent.assignments?.length && (
                      <div className="text-center py-10 text-slate-400 text-sm">
                        Aktif ödev bulunmuyor.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- ASSESSMENT & COACHING --- */}
          {activeTab === "assessment" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex overflow-x-auto gap-2 pb-2">
                <button
                  onClick={() => setSubTab("chat")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm capitalize ${
                    subTab === "chat"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Hocaya Sor
                </button>
                <button
                  onClick={() => setSubTab("trials")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm capitalize ${
                    subTab === "trials"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Denemelerim
                </button>
                <button
                  onClick={() => setSubTab("questions")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm capitalize ${
                    subTab === "questions"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Sorularım
                </button>
                <button
                  onClick={() => setSubTab("quizzes")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm capitalize ${
                    subTab === "quizzes"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Quizlerim
                </button>
              </div>
              {/* ... Chat, Trials, Questions, Quizzes code from previous step ... */}
              {subTab === "chat" && (
                <div className="bg-white h-[600px] flex flex-col rounded-xl shadow border">
                  <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 flex items-center">
                      <MessageCircle className="mr-2 text-indigo-600" /> Soru &
                      Cevap
                    </h3>
                    <span className="text-xs text-slate-400">
                      Anlık İletişim
                    </span>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                    {currentStudent.chat?.map((msg) => {
                      const isMe =
                        msg.sender ===
                        (userRole === "teacher" ? "teacher" : "student");
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] p-4 rounded-2xl shadow-sm text-sm ${
                              isMe
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white border border-slate-100 rounded-bl-none text-slate-700"
                            }`}
                          >
                            {msg.file && (
                              <div className="bg-black/10 p-2 rounded-lg mb-2 flex items-center gap-2 text-xs backdrop-blur-sm">
                                <ImageIcon size={14} /> Dosya Eki
                              </div>
                            )}
                            <p>{msg.text}</p>
                            <div className="text-[10px] opacity-70 text-right mt-1">
                              {msg.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef}></div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                    <label className="p-3 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer transition">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          setTempData({
                            ...tempData,
                            file: processFile(e.target.files[0]),
                          })
                        }
                      />
                      <Upload size={20} />
                    </label>
                    <input
                      className="flex-1 border rounded-full px-5 text-sm outline-none focus:border-indigo-500 focus:ring-2 ring-indigo-50 transition"
                      placeholder="Mesajınızı yazın..."
                      value={tempData.text || ""}
                      onChange={(e) =>
                        setTempData({ ...tempData, text: e.target.value })
                      }
                      onKeyPress={(e) => e.key === "Enter" && addMessage()}
                    />
                    <button
                      onClick={addMessage}
                      className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                    >
                      <ArrowLeft className="rotate-180" size={20} />
                    </button>
                  </div>
                </div>
              )}
              {subTab === "trials" && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                    <h3 className="font-bold">Deneme Analizi</h3>
                    <button
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        setModalType("trial");
                        setModalOpen(true);
                      }}
                    >
                      Deneme Ekle
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentStudent.trials?.map((trial) => (
                      <div
                        key={trial.id}
                        className="bg-white p-4 rounded-xl border hover:border-indigo-300 relative group"
                      >
                        <button
                          onClick={() => {
                            const n = currentStudent.trials.filter(
                              (t) => t.id !== trial.id
                            );
                            updateDb({ trials: n });
                          }}
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-indigo-900">
                            {trial.name}
                          </span>
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {trial.type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          Tarih: {trial.date}
                        </div>
                        <div className="mt-2 font-bold text-emerald-600">
                          Net: {trial.totalNet}
                        </div>
                        {/* Detay Göster */}
                        <div className="grid grid-cols-4 gap-1 text-[10px] mt-2 border-t pt-2">
                          {Object.entries(trial.results || {}).map(
                            ([key, val]) => (
                              <div
                                key={key}
                                className="bg-slate-50 p-1 rounded text-center"
                              >
                                <div className="font-bold text-slate-700 uppercase">
                                  {key.substring(0, 3)}
                                </div>
                                <div>{val.n}</div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {subTab === "questions" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Soru Çözüm Takibi</h3>
                    <button
                      onClick={() => {
                        setModalType("question");
                        setModalOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
                    >
                      <Plus className="mr-2" size={16} /> Veri Gir
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                        <tr>
                          <th className="p-4 rounded-l-xl">Tarih</th>
                          <th className="p-4">Ders</th>
                          <th className="p-4">Konu</th>
                          <th className="p-4 text-center">D/Y/B</th>
                          <th className="p-4 text-center">Başarı %</th>
                          <th className="p-4 rounded-r-xl">Zorluk</th>
                          <th className="p-4">Sil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentStudent.questionStats
                          ?.sort((a, b) => b.id - a.id)
                          .map((s) => (
                            <tr key={s.id}>
                              <td className="p-4 font-mono text-slate-500 text-xs">
                                {s.date}
                              </td>
                              <td className="p-4 font-bold text-indigo-900">
                                {s.subject}
                              </td>
                              <td className="p-4">{s.topic}</td>
                              <td className="p-3 text-center text-xs">
                                {s.correct}/{s.incorrect}/{s.empty}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold ${
                                    s.successRate < 50
                                      ? "bg-rose-100 text-rose-700"
                                      : s.successRate < 75
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  %{s.successRate}
                                </span>
                              </td>
                              <td className="p-3">
                                {[...Array(Number(s.difficulty))].map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      size={10}
                                      className="inline text-amber-400 fill-amber-400"
                                    />
                                  )
                                )}
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => {
                                    const n =
                                      currentStudent.questionStats.filter(
                                        (q) => q.id !== s.id
                                      );
                                    updateDb({ questionStats: n });
                                  }}
                                  className="text-slate-300 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {subTab === "quizzes" && (
                <div className="space-y-4">
                  {userRole === "teacher" && (
                    <button
                      onClick={() => {
                        setModalType("quiz-create");
                        setModalOpen(true);
                      }}
                      className="w-full border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-300 transition"
                    >
                      <Plus size={32} />
                      <span className="mt-2 font-bold">Yeni Quiz Oluştur</span>
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentStudent.quizzes
                      ?.sort((a, b) => b.id - a.id)
                      .map((q) => (
                        <div
                          key={q.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
                        >
                          <div>
                            <h4 className="font-bold text-slate-800">
                              {q.title}
                            </h4>
                            <p className="text-sm text-slate-500">{q.desc}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                                q.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {q.status}
                            </span>
                            {userRole === "student" &&
                            q.status !== "completed" ? (
                              <button
                                onClick={() => {
                                  setQuizTaking(q);
                                  setModalType("quiz-take");
                                  setModalOpen(true);
                                }}
                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                              >
                                Başla
                              </button>
                            ) : (
                              q.status === "completed" && (
                                <span className="text-xs font-bold text-indigo-600">
                                  {q.result?.correct} D / {q.result?.incorrect}{" "}
                                  Y
                                </span>
                              )
                            )}
                            <button
                              onClick={() => {
                                const n = currentStudent.quizzes.filter(
                                  (x) => x.id !== q.id
                                );
                                updateDb({ quizzes: n });
                              }}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "coaching" && (
            // ... Coaching content (Goals, Dreams, etc. from previous) ...
            <div className="animate-fadeIn space-y-8">
              {/* ... Hedefler, Dreamboard, Günlük, Listeler ... */}
              {/* (Previous Coaching Content) */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
                    <div className="flex-1 w-full md:w-auto">
                      <label className="text-xs font-bold text-indigo-300 uppercase mb-1 block">
                        Hedef Sıralama
                      </label>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold mr-2">#</span>
                        <input
                          className="bg-transparent text-4xl font-bold text-white placeholder-white/20 focus:outline-none w-full"
                          placeholder="5.000"
                          value={currentStudent.goals?.ranking}
                          onChange={(e) =>
                            updateDb({
                              goals: {
                                ...currentStudent.goals,
                                ranking: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1 w-full md:w-auto text-left md:text-right">
                      <div className="space-y-2">
                        <div className="flex flex-col md:items-end">
                          <label className="text-xs font-bold text-indigo-300 uppercase mb-1">
                            Hedef Üniversite
                          </label>
                          <div className="flex flex-col gap-2 w-full md:w-96">
                            {currentStudent.goals?.universities?.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center gap-2 bg-white/10 p-2 rounded-lg"
                              >
                                <div className="flex-1 text-left">
                                  <div className="font-bold text-lg">
                                    {u.uni}
                                  </div>
                                  <div className="text-sm opacity-80">
                                    {u.dept}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const n =
                                      currentStudent.goals.universities.filter(
                                        (x) => x.id !== u.id
                                      );
                                    updateDb({
                                      goals: {
                                        ...currentStudent.goals,
                                        universities: n,
                                      },
                                    });
                                  }}
                                  className="text-white/50 hover:text-red-400"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                className="bg-white/20 border-none rounded p-2 text-sm flex-1 placeholder-white/50 text-white"
                                placeholder="Üniversite Ekle..."
                                id="newUniInput"
                              />
                              <input
                                className="bg-white/20 border-none rounded p-2 text-sm w-1/3 placeholder-white/50 text-white"
                                placeholder="Bölüm"
                                id="newDeptInput"
                              />
                              <button
                                onClick={() => {
                                  const u =
                                    document.getElementById(
                                      "newUniInput"
                                    ).value;
                                  const d =
                                    document.getElementById(
                                      "newDeptInput"
                                    ).value;
                                  if (u) {
                                    const newItem = {
                                      id: Date.now(),
                                      uni: u,
                                      dept: d,
                                    };
                                    const old =
                                      currentStudent.goals?.universities || [];
                                    updateDb({
                                      goals: {
                                        ...currentStudent.goals,
                                        universities: [...old, newItem],
                                      },
                                    });
                                    document.getElementById(
                                      "newUniInput"
                                    ).value = "";
                                    document.getElementById(
                                      "newDeptInput"
                                    ).value = "";
                                  }
                                }}
                                className="bg-white text-indigo-900 p-2 rounded"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-300 uppercase mb-3 flex items-center">
                        <Target size={16} className="mr-2" /> TYT Hedef Netleri
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          "Türkçe",
                          "Matematik",
                          "Sosyal",
                          "Fizik",
                          "Kimya",
                          "Biyoloji",
                        ].map((s) => (
                          <div
                            key={s}
                            className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"
                          >
                            <span className="text-[10px] uppercase font-bold opacity-60 mb-1">
                              {s}
                            </span>
                            <input
                              className="w-full bg-transparent text-center font-bold text-xl focus:outline-none"
                              placeholder="-"
                              value={currentStudent.goals?.tytNets?.[s] || ""}
                              onChange={(e) =>
                                updateDb({
                                  goals: {
                                    ...currentStudent.goals,
                                    tytNets: {
                                      ...(currentStudent.goals.tytNets || {}),
                                      [s]: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-300 uppercase mb-3 flex items-center">
                        <Target size={16} className="mr-2" /> AYT Hedef Netleri
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {["Matematik", "Fizik", "Kimya", "Biyoloji"].map(
                          (s) => (
                            <div
                              key={s}
                              className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center"
                            >
                              <span className="text-[10px] uppercase font-bold opacity-60 mb-1">
                                {s.substring(0, 3)}
                              </span>
                              <input
                                className="w-full bg-transparent text-center font-bold text-xl focus:outline-none"
                                placeholder="-"
                                value={currentStudent.goals?.aytNets?.[s] || ""}
                                onChange={(e) =>
                                  updateDb({
                                    goals: {
                                      ...currentStudent.goals,
                                      aytNets: {
                                        ...(currentStudent.goals.aytNets || {}),
                                        [s]: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold flex items-center text-xl">
                    <Star className="mr-2" size={24} /> Hayal Panosu
                  </h3>
                  <button
                    onClick={() => {
                      setModalType("dream");
                      setModalOpen(true);
                    }}
                    className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
                  >
                    <Plus size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentStudent.dreamboard?.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white/10 p-3 rounded-2xl relative group hover:bg-white/20 transition duration-300"
                    >
                      {d.type === "image" && (
                        <img
                          src={d.content}
                          className="w-full h-32 object-cover rounded-xl mb-2 shadow-sm"
                        />
                      )}
                      {d.type === "text" && (
                        <div className="w-full h-32 flex items-center justify-center text-center italic text-sm p-4 bg-black/10 rounded-xl mb-2">
                          "{d.content}"
                        </div>
                      )}
                      {d.type === "video" && (
                        <a
                          href={d.content}
                          target="_blank"
                          className="w-full h-32 bg-black/30 flex items-center justify-center rounded-xl mb-2 hover:bg-black/50 transition"
                        >
                          <PlayCircle size={40} />
                        </a>
                      )}
                      <p className="text-xs font-bold truncate px-1">
                        {d.caption}
                      </p>
                      <button
                        onClick={() => {
                          const n = currentStudent.dreamboard.filter(
                            (x) => x.id !== d.id
                          );
                          updateDb({ dreamboard: n });
                        }}
                        className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {!currentStudent.dreamboard?.length && (
                    <div className="col-span-full border-2 border-dashed border-white/30 rounded-2xl py-12 text-center text-white/70 text-sm">
                      Buraya hayallerini ekle...
                    </div>
                  )}
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center text-slate-800">
                      <CheckSquare className="mr-2 text-emerald-600" />{" "}
                      Yapılacaklar
                    </h3>
                    <button
                      onClick={() => {
                        setModalType("list");
                        setTempData({ type: "todo" });
                        setModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentStudent.todoList?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded"
                      >
                        <button
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            item.status === "done"
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300"
                          }`}
                          onClick={() => {
                            const n = currentStudent.todoList.map((t) =>
                              t.id === item.id
                                ? {
                                    ...t,
                                    status:
                                      t.status === "done" ? "pending" : "done",
                                  }
                                : t
                            );
                            updateDb({ todoList: n });
                          }}
                        >
                          <Check size={14} />
                        </button>
                        <span
                          className={`text-sm ${
                            item.status === "done"
                              ? "line-through text-slate-400"
                              : ""
                          }`}
                        >
                          {item.title}
                        </span>
                        <button
                          onClick={() => {
                            const n = currentStudent.todoList.filter(
                              (t) => t.id !== item.id
                            );
                            updateDb({ todoList: n });
                          }}
                          className="ml-auto text-slate-300 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group h-full">
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        Haftanın Koçluk Konusu
                      </span>
                      <h2 className="text-2xl font-bold mt-2 mb-4">
                        {currentStudent.topicOfWeek?.title ||
                          "Konu Belirlenmedi"}
                      </h2>
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span>İlerleme</span>
                        <span>
                          %{currentStudent.topicOfWeek?.progress || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-1000"
                          style={{
                            width: `${
                              currentStudent.topicOfWeek?.progress || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalType("topic");
                      setModalOpen(true);
                    }}
                    className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <PenTool className="mr-2 text-indigo-600" /> Mini Günlük
                  </h3>
                  <button
                    onClick={() => {
                      setModalType("diary");
                      setModalOpen(true);
                    }}
                    className="bg-indigo-50 text-indigo-600 p-2 rounded-full hover:bg-indigo-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentStudent.diary
                    ?.sort((a, b) => b.id - a.id)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="relative p-4 bg-slate-50 rounded-xl border border-slate-100 group"
                      >
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                          {entry.date}
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {entry.text}
                        </p>
                        <button
                          onClick={() => {
                            const n = currentStudent.diary.filter(
                              (x) => x.id !== entry.id
                            );
                            updateDb({ diary: n });
                          }}
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  {!currentStudent.diary?.length && (
                    <div className="col-span-full text-center text-slate-400 py-8 italic">
                      Bugün neler yaşadın? İlk notunu al...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- UNIVERSAL MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-scaleIn">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-6 text-slate-800 capitalize">
              {modalType === "schedule"
                ? "Ders Ekle"
                : modalType === "resource"
                ? "Kaynak Ekle"
                : modalType === "diary"
                ? "Günlük Yaz"
                : modalType === "dream"
                ? "Hayal Panosu Ekle"
                : modalType === "subjectTopic"
                ? `${selectedSubject} - Çalışma Ekle`
                : modalType === "privateLesson"
                ? "Özel Ders Ekle"
                : modalType === "topic"
                ? "Haftanın Konusu"
                : modalType === "homework-assign"
                ? "Ödev Ver"
                : modalType === "homework-submit"
                ? "Ödev Durumu"
                : "Ekle"}
            </h3>

            <div className="space-y-4">
              {modalType === "homework-assign" && (
                <>
                  <select
                    className="w-full border p-2 rounded-xl"
                    onChange={(e) =>
                      setTempData({ ...tempData, subject: e.target.value })
                    }
                  >
                    <option>Ders Seçiniz</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Konu Başlığı"
                    onChange={(e) =>
                      setTempData({ ...tempData, topic: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border p-2 rounded-xl h-20"
                    placeholder="Açıklama / Not"
                    onChange={(e) =>
                      setTempData({ ...tempData, description: e.target.value })
                    }
                  />
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Kaynak / URL"
                    onChange={(e) =>
                      setTempData({ ...tempData, source: e.target.value })
                    }
                  />
                  <input
                    type="datetime-local"
                    className="w-full border p-2 rounded-xl"
                    onChange={(e) =>
                      setTempData({ ...tempData, deadline: e.target.value })
                    }
                  />
                  <button
                    onClick={addHomework}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Ödevi Ata
                  </button>
                </>
              )}

              {modalType === "homework-submit" && (
                <>
                  <h4 className="font-bold text-slate-800 mb-2">
                    {selectedHomework.topic}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setTempData({ ...tempData, status: "completed" })
                      }
                      className={`flex-1 py-2 border rounded-xl font-bold ${
                        tempData.status === "completed"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      Yaptım
                    </button>
                    <button
                      onClick={() =>
                        setTempData({ ...tempData, status: "incomplete" })
                      }
                      className={`flex-1 py-2 border rounded-xl font-bold ${
                        tempData.status === "incomplete"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      Yapamadım
                    </button>
                  </div>
                  {tempData.status === "completed" && (
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        Zorluk (1-5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        className="w-full"
                        onChange={(e) =>
                          setTempData({
                            ...tempData,
                            difficulty: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  {tempData.status === "incomplete" && (
                    <input
                      className="w-full border p-2 rounded-xl"
                      placeholder="Neden yapamadın?"
                      onChange={(e) =>
                        setTempData({ ...tempData, reason: e.target.value })
                      }
                    />
                  )}
                  <textarea
                    className="w-full border p-2 rounded-xl"
                    placeholder="Yorum ekle..."
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        studentComment: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={submitHomework}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Kaydet
                  </button>
                </>
              )}

              {modalType === "dream" && (
                <>
                  <select
                    className="w-full border p-2 rounded"
                    onChange={(e) =>
                      setTempData({ ...tempData, type: e.target.value })
                    }
                  >
                    <option value="image">Resim URL</option>
                    <option value="video">Video Link</option>
                    <option value="text">Söz/Not</option>
                  </select>
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="İçerik (URL veya Metin)"
                    onChange={(e) =>
                      setTempData({ ...tempData, content: e.target.value })
                    }
                  />
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="Başlık"
                    onChange={(e) =>
                      setTempData({ ...tempData, caption: e.target.value })
                    }
                  />
                  <button
                    onClick={addDreamboardItem}
                    className="w-full bg-pink-600 text-white p-2 rounded font-bold"
                  >
                    Panoya Ekle
                  </button>
                </>
              )}

              {modalType === "privateLesson" && (
                <>
                  <input
                    type="date"
                    className="w-full border p-2 rounded"
                    onChange={(e) =>
                      setTempData({ ...tempData, date: e.target.value })
                    }
                  />
                  <select
                    className="w-full border p-2 rounded"
                    onChange={(e) =>
                      setTempData({ ...tempData, subject: e.target.value })
                    }
                  >
                    <option>Ders Seçiniz</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="Konu / Başlık"
                    onChange={(e) =>
                      setTempData({ ...tempData, topic: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border p-2 rounded h-24"
                    placeholder="Ders Notu / Ödev..."
                    onChange={(e) =>
                      setTempData({ ...tempData, comment: e.target.value })
                    }
                  />
                  <div className="flex gap-2 items-center text-sm text-slate-500 border p-2 rounded cursor-pointer hover:bg-slate-50">
                    <input
                      type="file"
                      onChange={(e) =>
                        setTempData({
                          ...tempData,
                          file: processFile(e.target.files[0]),
                        })
                      }
                    />
                    <Upload size={16} /> Dosya Ekle
                  </div>
                  <button
                    onClick={addPrivateLesson}
                    className="w-full bg-indigo-600 text-white p-2 rounded font-bold"
                  >
                    Kaydet
                  </button>
                </>
              )}

              {modalType === "subjectTopic" && (
                <>
                  <input
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                    placeholder="Konu Adı"
                    onChange={(e) =>
                      setTempData({ ...tempData, topic: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                      placeholder="Çözülen Soru"
                      onChange={(e) =>
                        setTempData({ ...tempData, solved: e.target.value })
                      }
                    />
                    <select
                      className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none bg-white"
                      onChange={(e) =>
                        setTempData({ ...tempData, status: e.target.value })
                      }
                    >
                      <option value="Pending">Devam Ediyor</option>
                      <option value="Completed">Tamamlandı</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                      placeholder="Doğru"
                      onChange={(e) =>
                        setTempData({ ...tempData, correct: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                      placeholder="Yanlış"
                      onChange={(e) =>
                        setTempData({ ...tempData, incorrect: e.target.value })
                      }
                    />
                  </div>
                  <label className="text-xs">Zorluk (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="w-full"
                    onChange={(e) =>
                      setTempData({ ...tempData, difficulty: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none h-20 resize-none"
                    placeholder="Kısaca yorum..."
                    value={tempData.comment || ""}
                    onChange={(e) =>
                      setTempData({ ...tempData, comment: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveSubjectTopic}
                      className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold shadow hover:bg-indigo-700"
                    >
                      Kaydet
                    </button>
                    {tempData.id && (
                      <button
                        onClick={() => deleteSubjectTopic(tempData.id)}
                        className="bg-red-100 text-red-600 p-3 rounded-xl"
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                </>
              )}

              {modalType === "schedule" && (
                <>
                  <div className="text-sm font-bold text-indigo-900 bg-indigo-50 p-2 rounded-lg text-center mb-2">
                    {tempData.day} - {tempData.hour}
                  </div>
                  <select
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                    onChange={(e) =>
                      setTempData({ ...tempData, subject: e.target.value })
                    }
                  >
                    <option>Ders Seçiniz</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                    placeholder="Konu / Detay"
                    onChange={(e) =>
                      setTempData({ ...tempData, topic: e.target.value })
                    }
                  />
                  <button
                    onClick={addToSchedule}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Ekle
                  </button>
                </>
              )}
              {modalType === "resource" && (
                <>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Başlık"
                    onChange={(e) =>
                      setTempData({ ...tempData, title: e.target.value })
                    }
                  />
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="URL"
                    onChange={(e) =>
                      setTempData({ ...tempData, url: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border p-2 rounded-xl h-20"
                    placeholder="Açıklama"
                    onChange={(e) =>
                      setTempData({ ...tempData, desc: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTempData({ ...tempData, type: "link" })}
                      className="flex-1 border p-2 rounded"
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setTempData({ ...tempData, type: "file" })}
                      className="flex-1 border p-2 rounded"
                    >
                      Dosya
                    </button>
                  </div>
                  <button
                    onClick={addResource}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Ekle
                  </button>
                </>
              )}
              {modalType === "diary" && (
                <>
                  <textarea
                    className="w-full border-2 border-slate-100 p-4 rounded-xl outline-none h-48 resize-none"
                    placeholder="Sevgili günlük..."
                    onChange={(e) =>
                      setTempData({ ...tempData, text: e.target.value })
                    }
                  />
                  <button
                    onClick={addDiaryEntry}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Kaydet
                  </button>
                </>
              )}
              {modalType === "list" && (
                <>
                  <input
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                    placeholder="Başlık"
                    onChange={(e) =>
                      setTempData({ ...tempData, title: e.target.value })
                    }
                  />
                  <input
                    className="w-full border-2 border-slate-100 p-3 rounded-xl outline-none"
                    placeholder="Link (Opsiyonel)"
                    onChange={(e) =>
                      setTempData({ ...tempData, link: e.target.value })
                    }
                  />
                  <button
                    onClick={() => addToList(tempData.type)}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Ekle
                  </button>
                </>
              )}
              {modalType === "trial" && (
                <>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Deneme Adı"
                    onChange={(e) =>
                      setTempData({ ...tempData, name: e.target.value })
                    }
                  />
                  <select
                    className="w-full border p-2 rounded-xl"
                    onChange={(e) => {
                      setTempData({ ...tempData, type: e.target.value });
                      setTrialInputData({});
                    }}
                  >
                    <option>Tür Seçiniz</option>
                    {TRIAL_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-xl"
                    onChange={(e) =>
                      setTempData({ ...tempData, date: e.target.value })
                    }
                  />
                  {tempData.type && (
                    <div className="grid grid-cols-1 gap-2 bg-slate-50 p-2 border rounded max-h-48 overflow-y-auto">
                      {(
                        TRIAL_FIELDS_CONFIG[tempData.type] || [tempData.type]
                      ).map((f) => (
                        <div key={f} className="flex justify-between text-sm">
                          <span className="w-24 font-bold">{f}</span>
                          <input
                            className="w-12 border text-center"
                            placeholder="D"
                            onChange={(e) => {
                              const val = {
                                ...(trialInputData[f] || {}),
                                d: e.target.value,
                              };
                              setTrialInputData({
                                ...trialInputData,
                                [f]: val,
                              });
                            }}
                          />
                          <input
                            className="w-12 border text-center"
                            placeholder="Y"
                            onChange={(e) => {
                              const val = {
                                ...(trialInputData[f] || {}),
                                y: e.target.value,
                              };
                              setTrialInputData({
                                ...trialInputData,
                                [f]: val,
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={addTrial}
                    className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold"
                  >
                    Kaydet
                  </button>
                </>
              )}
              {modalType === "question" && (
                <>
                  <select
                    className="w-full border p-2 rounded-xl"
                    onChange={(e) =>
                      setTempData({ ...tempData, subject: e.target.value })
                    }
                  >
                    <option>Ders Seç</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Kaynak"
                    onChange={(e) =>
                      setTempData({ ...tempData, source: e.target.value })
                    }
                  />
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Konu"
                    onChange={(e) =>
                      setTempData({ ...tempData, topic: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="D"
                      className="border p-2 rounded"
                      onChange={(e) =>
                        setTempData({ ...tempData, correct: e.target.value })
                      }
                    />
                    <input
                      placeholder="Y"
                      className="border p-2 rounded"
                      onChange={(e) =>
                        setTempData({ ...tempData, incorrect: e.target.value })
                      }
                    />
                    <input
                      placeholder="B"
                      className="border p-2 rounded"
                      onChange={(e) =>
                        setTempData({ ...tempData, empty: e.target.value })
                      }
                    />
                  </div>
                  <label className="text-xs">Zorluk (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="w-full"
                    onChange={(e) =>
                      setTempData({ ...tempData, difficulty: e.target.value })
                    }
                  />
                  <button
                    onClick={addQuestionStats}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Ekle
                  </button>
                </>
              )}
              {modalType === "quiz-create" && (
                <>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Quiz Başlığı"
                    onChange={(e) =>
                      setTempData({ ...tempData, title: e.target.value })
                    }
                  />
                  <textarea
                    className="w-full border p-2 rounded-xl h-24"
                    placeholder="Açıklama / Konular"
                    onChange={(e) =>
                      setTempData({ ...tempData, desc: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTempData({ ...tempData, type: "file" })}
                      className={`flex-1 p-2 border rounded ${
                        tempData.type === "file" ? "bg-indigo-100" : ""
                      }`}
                    >
                      Dosya
                    </button>
                    <button
                      onClick={() =>
                        setTempData({ ...tempData, type: "structured" })
                      }
                      className={`flex-1 p-2 border rounded ${
                        tempData.type === "structured" ? "bg-indigo-100" : ""
                      }`}
                    >
                      Sorular
                    </button>
                  </div>
                  {tempData.type === "structured" && (
                    <div className="max-h-48 overflow-y-auto border p-2 space-y-2">
                      <button
                        onClick={() => {
                          const qs = [...(tempData.questions || [])];
                          qs.push({
                            id: Date.now(),
                            text: "",
                            options: ["A", "B", "C", "D", "E"],
                            correct: "A",
                          });
                          setTempData({ ...tempData, questions: qs });
                        }}
                        className="text-xs bg-slate-100 w-full p-1 rounded"
                      >
                        + Soru Ekle
                      </button>
                      {tempData.questions?.map((q, idx) => (
                        <div key={idx} className="text-xs border-b pb-1">
                          <input
                            className="w-full border mb-1 rounded"
                            placeholder="Soru Metni"
                            onChange={(e) => {
                              q.text = e.target.value;
                            }}
                          />
                          <select
                            className="border rounded"
                            onChange={(e) => {
                              q.correct = e.target.value;
                            }}
                          >
                            <option>Cevap: A</option>
                            <option>Cevap: B</option>
                            <option>Cevap: C</option>
                            <option>Cevap: D</option>
                            <option>Cevap: E</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={addQuiz}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Oluştur
                  </button>
                </>
              )}
              {modalType === "quiz-take" && quizTaking && (
                <>
                  <h3 className="font-bold text-lg">{quizTaking.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {quizTaking.desc}
                  </p>
                  <div className="max-h-[300px] overflow-y-auto space-y-4 p-2">
                    {quizTaking.type === "structured" ? (
                      quizTaking.questions.map((q, idx) => (
                        <div key={q.id} className="border p-3 rounded-lg">
                          <p className="font-bold mb-2">
                            {idx + 1}. {q.text}
                          </p>
                          <div className="flex gap-2">
                            {["A", "B", "C", "D", "E"].map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  setQuizAnswers({
                                    ...quizAnswers,
                                    [q.id]: opt,
                                  })
                                }
                                className={`w-8 h-8 rounded-full border ${
                                  quizAnswers[q.id] === opt
                                    ? "bg-indigo-600 text-white"
                                    : "hover:bg-slate-100"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-10 border-2 border-dashed rounded-xl">
                        Dosya Görüntüleyici (PDF/Img)
                      </div>
                    )}
                  </div>
                  <textarea
                    className="w-full border p-2 rounded-xl mt-2"
                    placeholder="Yorum ekle..."
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        studentComment: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={submitQuiz}
                    className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold mt-2"
                  >
                    Bitir ve Gönder
                  </button>
                </>
              )}
              {modalType === "topic" && (
                <>
                  <input
                    className="w-full border p-2 rounded-xl"
                    placeholder="Konu"
                    onChange={(e) =>
                      setTempData({ ...tempData, title: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="w-full border p-2 rounded-xl"
                    placeholder="Yüzde"
                    onChange={(e) =>
                      setTempData({ ...tempData, progress: e.target.value })
                    }
                  />
                  <button
                    onClick={updateTopicOfWeek}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold"
                  >
                    Güncelle
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
