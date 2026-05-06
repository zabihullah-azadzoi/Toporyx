import { CheckCircle } from 'lucide-react';

export function ExportPreviewModal({ previewImage, onClose }) {
  if (!previewImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-sm no-capture no-canvas-click">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="text-emerald-400" /> Image Generated!
        </h3>
        <p className="text-slate-300 text-sm bg-slate-800 p-3 rounded-lg border border-slate-700">
          The direct clipboard copy was blocked by the browser. <br />
          Please <strong>Right-Click the image below</strong> and select <strong>"Copy Image"</strong> or <strong>"Save Image As"</strong>.
        </p>
        <div className="overflow-auto border border-slate-700 rounded-lg max-h-[50vh] max-w-full shadow-inner bg-black/50">
          <img src={previewImage} alt="Exported Architecture" className="block max-w-full h-auto" />
        </div>
        <button onClick={onClose} className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg">
          Close
        </button>
      </div>
    </div>
  );
}
