import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Simulation } from '@/types';

interface SimulationHeaderProps {
  simulation: Simulation;
  onDownload: () => void;
  isDownloading: boolean;
}

export function SimulationHeader({
  simulation,
  onDownload,
  isDownloading,
}: SimulationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/simulations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detalhes da Simulação
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Simulação #{simulation.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <Button onClick={onDownload} disabled={isDownloading}>
        <Download className="mr-2 h-4 w-4" />
        {isDownloading ? 'Baixando...' : 'Baixar CCB'}
      </Button>
    </div>
  );
}
