interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
