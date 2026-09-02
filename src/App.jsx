import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./utils/supabase";
import {
  Trash2,
  Pencil,
  Check,
  X,
  Palette,
  ImagePlus,
  RotateCcw,
} from "lucide-react";

function App() {
  // -----------------------------
  // AUTH STATES
  // -----------------------------

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  // -----------------------------
  // TASK STATES
  // -----------------------------

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");

  // -----------------------------
  // APPEARANCE STATES
  // -----------------------------

  const [showCustomizer, setShowCustomizer] = useState(false);
  const customizerRef = useRef(null);

  const [background, setBackground] = useState(() => {
    return localStorage.getItem("taskflow-background") || "#F3E9D7";
  });

  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem("taskflow-wallpaper") || "";
  });

  const [wallpaperOpacity, setWallpaperOpacity] = useState(() => {
    return (
      Number(localStorage.getItem("taskflow-wallpaper-opacity")) || 0.35
    );
  });

  const [wallpaperBlur, setWallpaperBlur] = useState(() => {
    return Number(localStorage.getItem("taskflow-wallpaper-blur")) || 0;
  });

  // -----------------------------
  // AUTH
  // -----------------------------

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // -----------------------------
  // CLOSE CUSTOMIZER ON OUTSIDE CLICK
  // -----------------------------

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        customizerRef.current &&
        !customizerRef.current.contains(event.target)
      ) {
        setShowCustomizer(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleAuth(e) {
    e.preventDefault();

    setAuthMessage("");
    setAuthError("");

    if (!email || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      setAuthMessage(
        "Account created! Check your email if confirmation is required."
      );
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setTasks([]);
  }

  // -----------------------------
  // LOAD TASKS FROM SUPABASE
  // -----------------------------

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    async function loadTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading tasks:", error);
        return;
      }

      setTasks(data || []);
    }

    loadTasks();
  }, [user]);

  // -----------------------------
  // SAVE APPEARANCE
  // -----------------------------

  useEffect(() => {
    localStorage.setItem("taskflow-background", background);
  }, [background]);

  useEffect(() => {
    if (wallpaper) {
      localStorage.setItem("taskflow-wallpaper", wallpaper);
    } else {
      localStorage.removeItem("taskflow-wallpaper");
    }
  }, [wallpaper]);

  useEffect(() => {
    localStorage.setItem(
      "taskflow-wallpaper-opacity",
      wallpaperOpacity
    );
  }, [wallpaperOpacity]);

  useEffect(() => {
    localStorage.setItem(
      "taskflow-wallpaper-blur",
      wallpaperBlur
    );
  }, [wallpaperBlur]);

  // -----------------------------
  // TASK FUNCTIONS
  // -----------------------------

  async function addTask() {
    if (task.trim() === "" || !user) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          text: task.trim(),
          completed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    setTasks((currentTasks) => [...currentTasks, data]);
    setTask("");
  }

  async function toggleTask(index) {
    const currentTask = tasks[index];

    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: !currentTask.completed,
      })
      .eq("id", currentTask.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((item, i) =>
        i === index ? data : item
      )
    );
  }

  async function saveTask() {
    if (
      editingIndex === null ||
      editedTask.trim() === ""
    ) {
      return;
    }

    const currentTask = tasks[editingIndex];

    const { data, error } = await supabase
      .from("tasks")
      .update({
        text: editedTask.trim(),
      })
      .eq("id", currentTask.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving task:", error);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((item, i) =>
        i === editingIndex ? data : item
      )
    );

    setEditingIndex(null);
    setEditedTask("");
  }

  async function deleteTask(index) {
    const currentTask = tasks[index];

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", currentTask.id);

    if (error) {
      console.error("Error deleting task:", error);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((_, i) => i !== index)
    );
  }

  // -----------------------------
  // APPEARANCE FUNCTIONS
  // -----------------------------

  function handleWallpaperUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setWallpaper(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function resetAppearance() {
    setBackground("#F3E9D7");
    setWallpaper("");
    setWallpaperOpacity(0.35);
    setWallpaperBlur(0);
  }

  // -----------------------------
  // OTHER DATA
  // -----------------------------

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // -----------------------------
  // LOADING
  // -----------------------------

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: background,
          fontFamily: "'Forum', serif",
        }}
      >
        <p className="text-[#5E4632] text-xl">
          Opening your journal... ✿
        </p>
      </div>
    );
  }

  // -----------------------------
  // LOGIN / SIGNUP
  // -----------------------------

  if (!user) {
    return (
      <div
        className="min-h-screen flex justify-center items-center py-10 px-6"
        style={{ backgroundColor: background }}
      >
        {wallpaper && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${wallpaper})`,
              opacity: wallpaperOpacity,
              filter: `blur(${wallpaperBlur}px)`,
              transform: "scale(1.05)",
            }}
          />
        )}

        <div className="relative z-10 w-full max-w-md bg-[#FBF6EE] rounded-2xl shadow-xl p-10">

          <h1
            className="text-6xl text-center text-[#5E4632]"
            style={{ fontFamily: "'Forum', serif" }}
          >
            TaskFlow
          </h1>

          <p className="text-center text-[#8A7562] italic mt-3 mb-8">
            Plan your day, one page at a time.
          </p>

          <h2
            className="text-2xl text-center text-[#5E4632] mb-6"
            style={{ fontFamily: "'Forum', serif" }}
          >
            {authMode === "login"
              ? "Welcome back ✿"
              : "Create your journal ✿"}
          </h2>

          <form onSubmit={handleAuth}>

            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-xl text-[#5E4632] placeholder:text-[#A08A75] focus:outline-none border-b border-[#D8C8B5] pb-3 mb-6"
            />

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-xl text-[#5E4632] placeholder:text-[#A08A75] focus:outline-none border-b border-[#D8C8B5] pb-3 mb-6"
            />

            {authError && (
              <p className="text-red-500 text-sm mb-4">
                {authError}
              </p>
            )}

            {authMessage && (
              <p className="text-[#7A9E7E] text-sm mb-4">
                {authMessage}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-[#7A9E7E] hover:bg-[#688B6B] text-white py-3 rounded-full transition"
            >
              {authMode === "login"
                ? "Log In"
                : "Create Account"}
            </motion.button>

          </form>

          <button
            onClick={() => {
              setAuthMode(
                authMode === "login"
                  ? "signup"
                  : "login"
              );
              setAuthError("");
              setAuthMessage("");
            }}
            className="block mx-auto mt-5 text-sm text-[#8B7355] hover:text-[#5E4632] transition"
          >
            {authMode === "login"
              ? "New here? Create an account"
              : "Already have an account? Log in"}
          </button>

        </div>
      </div>
    );
  }

  // -----------------------------
  // MAIN TASKFLOW UI
  // -----------------------------

  return (
    <div
  className="min-h-screen flex justify-center py-6 px-3 md:py-10 md:px-6 relative overflow-hidden"
    style={{ backgroundColor: background }}
    >

      {/* WALLPAPER */}
      {wallpaper && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${wallpaper})`,
            opacity: wallpaperOpacity,
            filter: `blur(${wallpaperBlur}px)`,
            transform: "scale(1.05)",
          }}
        />
      )}

      {/* JOURNAL PAGE */}
      <div className="journal-page relative z-10 w-full max-w-4xl min-h-[90vh] bg-[#FBF6EE] rounded-2xl shadow-xl p-6 md:p-12">

        {/* TOP BUTTONS */}
        <div className="flex justify-between mb-2 relative">

          {/* CUSTOMIZE BUTTON + PANEL */}
          <div
            ref={customizerRef}
            className="relative"
          >

            <button
              onClick={() =>
                setShowCustomizer(!showCustomizer)
              }
              className="text-[#8B7355] hover:text-[#5E4632] transition"
              title="Customize appearance"
            >
              <Palette size={22} />
            </button>

            {/* CUSTOMIZATION PANEL */}
            {showCustomizer && (
              <div className="absolute left-0 top-8 z-20 w-[calc(100vw-3rem)] max-w-72 bg-[#FBF6EE] border border-[#D8C8B5] rounded-2xl shadow-xl p-5">
                <h2
                  className="text-xl text-[#5E4632] mb-4"
                  style={{
                    fontFamily: "'Forum', serif",
                  }}
                >
                  Customize your page ✨
                </h2>

                <p className="text-sm text-[#8B7355] mb-2">
                  Background
                </p>

                <div className="grid grid-cols-4 gap-2 mb-4">

                  {[
                    "#F3E9D7",
                    "#F6E1E7",
                    "#DDEBF0",
                    "#DDE8DC",
                    "#E7DDF0",
                    "#F3DDC9",
                    "#E5E1DC",
                    "#D8D0C4",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackground(color)}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-110 transition"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}

                </div>

                <label className="flex items-center justify-between text-sm text-[#8B7355] mb-4">

                  Custom color

                  <input
                    type="color"
                    value={background}
                    onChange={(e) =>
                      setBackground(e.target.value)
                    }
                    className="w-10 h-8 cursor-pointer"
                  />

                </label>

                <label className="block text-sm text-[#8B7355] mb-2">
                  Wallpaper
                </label>

                <label className="flex items-center justify-center gap-2 border border-dashed border-[#C9B9A5] rounded-xl py-3 cursor-pointer hover:bg-[#F8F2E8] transition">

                  <ImagePlus size={18} />

                  <span className="text-sm text-[#6F5A47]">
                    Upload wallpaper
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWallpaperUpload}
                    className="hidden"
                  />

                </label>

                {wallpaper && (
                  <>
                    <label className="block text-sm text-[#8B7355] mt-4 mb-1">
                      Wallpaper opacity
                    </label>

                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={wallpaperOpacity}
                      onChange={(e) =>
                        setWallpaperOpacity(
                          Number(e.target.value)
                        )
                      }
                      className="w-full"
                    />

                    <label className="block text-sm text-[#8B7355] mt-3 mb-1">
                      Wallpaper blur
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={wallpaperBlur}
                      onChange={(e) =>
                        setWallpaperBlur(
                          Number(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                  </>
                )}

                <button
                  onClick={resetAppearance}
                  className="flex items-center gap-2 mt-5 text-sm text-[#8B7355] hover:text-[#5E4632] transition"
                >
                  <RotateCcw size={15} />
                  Reset appearance
                </button>

              </div>
            )}

          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="text-[#8B7355] hover:text-red-500 transition text-sm"
          >
            Log out
          </button>

        </div>

        {/* TITLE */}
        <h1
          className="text-5xl md:text-7xl text-center text-[#5E4632]"
          style={{
            fontFamily: "'Forum', serif",
          }}
        >
          TaskFlow
        </h1>

        <p className="text-center text-[#8A7562] italic mt-3 mb-10">
          Plan your day, one page at a time.
        </p>

        {/* DATE */}
        <p
          className="mt-2 text-center text-base text-[#8B7355]"
          style={{
            fontFamily: "'Forum', serif",
          }}
        >
          {today}
        </p>

        {/* COMPLETION COUNT */}
        <p
          className="mt-2 text-center text-base text-[#8B7355]"
          style={{
            fontFamily: "'Forum', serif",
          }}
        >
          {completedTasks} of {totalTasks} tasks completed
        </p>

        <hr className="border-[#D8C8B5] mb-8" />

        {/* ADD TASK */}
        <div className="mt-6">

          <input
            type="text"
            placeholder="What shall we accomplish today?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
            className="w-full bg-transparent text-xl md:text-2xl text-[#5E4632] placeholder:text-[#A08A75] focus:outline-none border-b border-[#D8C8B5] pb-3"
            style={{
              fontFamily: "'Forum', serif",
            }}
          />

          <div className="flex justify-end mt-4">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTask}
              className="bg-[#7A9E7E] hover:bg-[#688B6B] text-white px-5 md:px-6 py-2 rounded-full transition"            >
              Add Task
            </motion.button>

          </div>

          {/* TASK LIST */}
          <div className="mt-10">

            {tasks.length === 0 ? (

              <p
                className="text-center text-[#8B7355] text-lg mt-10"
                style={{
                  fontFamily: "'Forum', serif",
                }}
              >
                Your journal is empty. Add your first task to begin.
              </p>

            ) : (

              <AnimatePresence>

                {tasks.map((item, index) => (

                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 30,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className="group flex justify-between items-center gap-3 py-3 px-2 border-b border-[#D8C8B5] rounded-lg hover:bg-[#F8F2E8] transition-all duration-200"                  >

                    {/* TASK / EDIT */}
                    {editingIndex === index ? (

                      <input
                        type="text"
                        value={editedTask}
                        onChange={(e) =>
                          setEditedTask(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveTask();
                          }
                        }}
                        className="flex-1 bg-transparent border-b border-[#7A9E7E] outline-none text-xl text-[#5E4632]"
                        style={{
                          fontFamily: "'Forum', serif",
                        }}
                        autoFocus
                      />

                    ) : (

                      <p
                        onClick={() =>
                          toggleTask(index)
                        }
                        className={`text-xl cursor-pointer ${
                          item.completed
                            ? "line-through text-stone-400"
                            : "text-[#5E4632]"
                        }`}
                        style={{
                          fontFamily: "'Forum', serif",
                        }}
                      >
                        ✿ {item.text}
                      </p>

                    )}

                    {/* EDIT / DELETE */}
                    <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">

                      {editingIndex === index ? (

                        <>
                          <button
                            onClick={saveTask}
                            className="text-stone-500 hover:text-green-600"
                          >
                            <Check size={18} />
                          </button>

                          <button
                            onClick={() => {
                              setEditingIndex(null);
                              setEditedTask("");
                            }}
                            className="text-stone-500 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </>

                      ) : (

                        <>
                          <button
                            onClick={() => {
                              setEditingIndex(index);
                              setEditedTask(item.text);
                            }}
                            className="text-stone-500 hover:text-[#7A9E7E]"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() =>
                              deleteTask(index)
                            }
                            className="text-stone-500 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>

                      )}

                    </div>

                  </motion.div>

                ))}

              </AnimatePresence>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;