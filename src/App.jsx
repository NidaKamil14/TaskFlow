import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, Check, X } from "lucide-react";
function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState(() => {
  const savedTasks = localStorage.getItem("tasks");
  return savedTasks ? JSON.parse(savedTasks) : [];
});
const [editingIndex, setEditingIndex] = useState(null);
const [editedTask, setEditedTask] = useState("");
  useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);
  function toggleTask(index) {
  const updatedTasks = [...tasks];

  updatedTasks[index].completed = !updatedTasks[index].completed;

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

  setTasks([...tasks, {
    text: task,
    completed: false,
  },]);
  setTask("");
}
const completedTasks = tasks.filter(task => task.completed).length;
const totalTasks = tasks.length;
const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
  return (
    <div className="min-h-screen bg-[#F3E9D7] flex justify-center py-10 px-6">
      <div className="journal-page w-full max-w-4xl min-h-[90vh] bg-[#FBF6EE] rounded-2xl shadow-xl p-12">
        <h1
          className="text-7xl text-center text-[#5E4632]"
          style={{ fontFamily: "'Forum', serif" }}
        >
          TaskFlow
        </h1>

        <p className="text-center text-[#8A7562] italic mt-3 mb-10">
          Plan your day, one page at a time.
        </p>

        <p
          className="mt-2 text-center text-base text-[#8B7355]"
          style={{ fontFamily: "'Forum', serif" }} >
            {today}
        </p>

        <p
          className="mt-2 text-center text-base text-[#8B7355]"
          style={{ fontFamily: "'Forum', serif" }} >
           {completedTasks} of {totalTasks} tasks completed
        </p>

        <hr className="border-[#D8C8B5] mb-8" />

        <div className="mt-6">
          <input
            type="text"
            placeholder="What shall we accomplish today?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();  }
              }}
            className="w-full bg-transparent text-2xl text-[#5E4632] placeholder:text-[#A08A75] focus:outline-none border-b border-[#D8C8B5] pb-3"
            style={{ fontFamily: "'Forum', serif" }}
          />

          <div className="flex justify-end mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTask}
              className="bg-[#7A9E7E] hover:bg-[#688B6B] text-white px-6 py-2 rounded-full transition" >
                Add Task
            </motion.button>
          </div>
          <div className="mt-10">
  {tasks.length === 0 ? (
    <p
      className="text-center text-[#8B7355] text-lg mt-10"
      style={{ fontFamily: "'Forum', serif" }}
    >
      Your journal is empty. Add your first task to begin.
    </p>
  ) : (
    <AnimatePresence>
  {tasks.map((item, index) => (
  <motion.div
  key={index}
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: 30 }}
  transition={{
  duration: 0.25,
  ease: "easeInOut", }}
  className="group flex justify-between items-center py-3 px-2 border-b border-[#D8C8B5] rounded-lg hover:bg-[#F8F2E8] transition-all duration-200"
>
  {editingIndex === index ? (
  <input
    type="text"
    value={editedTask}
    onChange={(e) => setEditedTask(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        saveTask();
      }
}}

    className="flex-1 bg-transparent border-b border-[#7A9E7E] outline-none text-xl text-[#5E4632]"
    style={{ fontFamily: "'Forum', serif" }}
    autoFocus
  />
) : (
  <p
    onClick={() => toggleTask(index)}
    className={`text-xl cursor-pointer ${
      item.completed
        ? "line-through text-stone-400"
        : "text-[#5E4632]"
    }`}
    style={{ fontFamily: "'Forum', serif" }}
  >
    ✿ {item.text}
  </p>
)}

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
        onClick={() => deleteTask(index)}
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