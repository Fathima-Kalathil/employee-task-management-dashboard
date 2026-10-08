import Modal, { btnGhost } from './Modal';

export default function ConfirmDialog({
  title = 'Confirm Delete',
  message,
  confirmText = 'Delete',
  loadingText = 'Deleting...',
  confirmClass = 'bg-red-600 hover:bg-red-700',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal title={title} onClose={onCancel} width="max-w-sm">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
          !
        </span>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${confirmClass}`}
        >
          {loading ? loadingText : confirmText}
        </button>
      </div>
    </Modal>
  );
}
