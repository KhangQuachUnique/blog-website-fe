interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-100">
      <div className="text-center p-8">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-gray-500 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
