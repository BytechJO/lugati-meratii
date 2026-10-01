import { ReactNode } from 'react';

interface ExerciseLayoutProps {
  children: ReactNode;
}

export function ExerciseLayout({ children }: ExerciseLayoutProps) {
  return (
    <div 
      className="min-h-screen py-6"
      style={{ backgroundColor: '#ECEEEF' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
