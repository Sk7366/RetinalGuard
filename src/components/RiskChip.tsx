import React from 'react';
import { DRGrade } from '../types';
import { DR_GRADES } from '../data/benchmarks';

interface RiskChipProps {
  grade: DRGrade;
  size?: 'sm' | 'md' | 'lg';
  showGradeNumber?: boolean;
  className?: string;
}

export const RiskChip: React.FC<RiskChipProps> = ({
  grade,
  size = 'md',
  showGradeNumber = true,
  className = '',
}) => {
  const info = DR_GRADES[grade];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      id={`risk-chip-grade-${grade}`}
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap tracking-tight transition-colors ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: info.bgColor,
        borderColor: info.borderColor,
        color: info.color,
      }}
    >
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{
          width: size === 'lg' ? 8 : 6,
          height: size === 'lg' ? 8 : 6,
          backgroundColor: info.color,
        }}
      />
      <span>
        {showGradeNumber && <strong className="font-semibold mr-1">Grade {grade}:</strong>}
        {info.shortName}
      </span>
    </span>
  );
};
