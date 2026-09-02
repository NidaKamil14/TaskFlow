import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // TASK STATES
  // -----------------------------

  const [task, setTask] = useState("");

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");

  // -----------------------------
  // APPEARANCE STATES
  // -----------------------------

  const [showCustomizer, setShowCustomizer] = useState(false);

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
  // SAVE TASKS
  // -----------------------------

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

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

  function toggleTask(index) {
    const updatedTasks = [...tasks];

    updatedTasks[index].completed =
      !updatedTasks[index].completed;

    setTasks(updatedTasks);
  }

  const saveTask = () => {
    const updatedTasks = [...tasks];

    updatedTasks[editingIndex].text = editedTask;

    setTasks(updatedTasks);
    setEditingIndex(null);
    setEditedTask("");
  };

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  }

  function addTask() {
    if (task.trim() === "") return;

    setTasks([
      ...tasks,
      {
        text: task,
        completed: false,
      },
    ]);

    setTask("");
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
  // UI
  // -----------------------------

  return (
    <div
      className="min-h-screen flex justify-center py-10 px-6 relative overflow-hidden"
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
      <div className="journal-page relative z-10 w-full max-w-4xl min-h-[90vh] bg-[#FBF6EE] rounded-2xl shadow-xl p-12">

        {/* CUSTOMIZE BUTTON */}
        <div className="flex justify-end mb-2 relative">

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
            <div className="absolute right-0 top-8 z-20 w-72 bg-[#FBF6EE] border border-[#D8C8B5] rounded-2xl shadow-xl p-5">

              <h2
                className="text-xl text-[#5E4632] mb-4"
                style={{
                  fontFamily: "'Forum', serif",
                }}
              >
                Customize your page ✨
              </h2>

              {/* PRESET COLORS */}
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

              {/* CUSTOM COLOR */}
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

              {/* WALLPAPER */}
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

              {/* WALLPAPER CONTROLS */}
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

              {/* RESET */}
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

        {/* TITLE */}
        <h1
          className="text-7xl text-center text-[#5E4632]"
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
            className="w-full bg-transparent text-2xl text-[#5E4632] placeholder:text-[#A08A75] focus:outline-none border-b border-[#D8C8B5] pb-3"
            style={{
              fontFamily: "'Forum', serif",
            }}
          />

          <div className="flex justify-end mt-4">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTask}
              className="bg-[#7A9E7E] hover:bg-[#688B6B] text-white px-6 py-2 rounded-full transition"
            >
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
                    key={index}
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
                    className="group flex justify-between items-center py-3 px-2 border-b border-[#D8C8B5] rounded-lg hover:bg-[#F8F2E8] transition-all duration-200"
                  >

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
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

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