import { MdRefresh } from "react-icons/md";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-100">
      <div className="text-center p-8">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold mb-4 text-lg">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <MdRefresh className="text-lg" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
