import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

interface NotificationProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Notification({ message, type = "success", onClose }: NotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
        type === "success" 
          ? "bg-emerald-600 border-emerald-500 text-white" 
          : "bg-red-600 border-red-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <p className="font-bold text-sm tracking-wide">{message}</p>
      <button 
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
      >
        <XCircle size={16} />
      </button>
    </motion.div>
  );
}
