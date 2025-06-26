import { Modal } from "./Modal";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <p className="text-gray-700 dark:text-slate-300">{message}</p>
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};
