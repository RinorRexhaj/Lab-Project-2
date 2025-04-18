import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: faExclamationTriangle,
          iconBg: "bg-red-100",
          iconColor: "text-red-500",
          confirmBg: "bg-red-500 hover:bg-red-600",
        };
      case "info":
        return {
          icon: faExclamationTriangle,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-500",
          confirmBg: "bg-blue-500 hover:bg-blue-600",
        };
      case "warning":
      default:
        return {
          icon: faExclamationTriangle,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-500",
          confirmBg: "bg-amber-500 hover:bg-amber-600",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
        <div className="flex items-start mb-4">
          <div className={`p-2 ${styles.iconBg} rounded-full mr-3`}>
            <FontAwesomeIcon
              icon={styles.icon}
              className={`w-5 h-5 ${styles.iconColor}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-white rounded-md ${styles.confirmBg}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
