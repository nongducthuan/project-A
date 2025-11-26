import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Tự động tắt sau 3 giây

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-500",
  };

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl text-white ${bgColors[type]} animate-fadeInUp pointer-events-auto min-w-[300px] max-w-md`}>
        <i className={`fa-solid ${icons[type]} text-xl`}></i>
        <span className="font-medium text-lg">{message}</span>
        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
