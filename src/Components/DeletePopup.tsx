import React from "react";
import { X, Trash2 } from "lucide-react";

interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
}

const DeletePopup: React.FC<DeletePopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-primary rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-normal text-text-primary font-roboto">
              Delete {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-text-primary/80 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-secondary mb-4 font-roboto">
            Are you sure you want to delete this {title}?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-1.5 text-text-primary bg-secondary border border-secondary rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-roboto"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-1.5 bg-status-danger hover:bg-status-danger/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-roboto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
