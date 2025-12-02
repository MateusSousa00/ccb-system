import { SimulationStatus, RiskCategory } from '@/types';

export function getStatusBadgeVariant(status: SimulationStatus) {
  switch (status) {
    case SimulationStatus.PENDING:
      return 'secondary';
    case SimulationStatus.APPROVED:
      return 'default';
    case SimulationStatus.REJECTED:
      return 'destructive';
    case SimulationStatus.CONVERTED:
      return 'default';
    default:
      return 'secondary';
  }
}

export function getStatusLabel(status: SimulationStatus): string {
  switch (status) {
    case SimulationStatus.PENDING:
      return 'Pendente';
    case SimulationStatus.APPROVED:
      return 'Aprovada';
    case SimulationStatus.REJECTED:
      return 'Rejeitada';
    case SimulationStatus.CONVERTED:
      return 'Convertida';
    default:
      return status;
  }
}

export function getRiskBadgeVariant(category: RiskCategory) {
  switch (category) {
    case RiskCategory.LOW:
      return 'default';
    case RiskCategory.MEDIUM:
      return 'secondary';
    case RiskCategory.HIGH:
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getRiskLabel(category: RiskCategory): string {
  switch (category) {
    case RiskCategory.LOW:
      return 'Baixo';
    case RiskCategory.MEDIUM:
      return 'Médio';
    case RiskCategory.HIGH:
      return 'Alto';
    default:
      return category;
  }
}
