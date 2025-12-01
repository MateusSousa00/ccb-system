import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SimulationWithDetails } from './simulations.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CcbGeneratorService {
  private readonly templatePath = path.join(
    __dirname,
    '..',
    'templates',
    'ccb-template.html',
  );

  async generateHtml(simulation: SimulationWithDetails): Promise<string> {
    const template = await fs.readFile(this.templatePath, 'utf-8');

    return template
      .replace(/{{simulationId}}/g, simulation.id)
      .replace(/{{createdAt}}/g, this.formatDate(simulation.createdAt))
      .replace(/{{status}}/g, simulation.status)
      .replace(/{{customerName}}/g, simulation.customer.name)
      .replace(/{{customerCpf}}/g, simulation.customer.cpf)
      .replace(/{{customerEmail}}/g, simulation.customer.email)
      .replace(
        /{{customerPhone}}/g,
        simulation.customer.phone || 'Não informado',
      )
      .replace(
        /{{customerCreditScore}}/g,
        simulation.customer.creditScore?.toString() || 'N/A',
      )
      .replace(
        /{{customerMonthlyIncome}}/g,
        this.formatCurrency(simulation.customer.monthlyIncome ?? 0),
      )
      .replace(
        /{{customerRiskCategory}}/g,
        simulation.customer.riskCategory || 'N/A',
      )
      .replace(
        /{{customerInterestRate}}/g,
        this.formatPercent(simulation.customer.interestRate) + ' a.a.',
      )
      .replace(
        /{{requestedAmount}}/g,
        this.formatCurrency(simulation.requestedAmount),
      )
      .replace(
        /{{installmentValue}}/g,
        this.formatCurrency(simulation.installmentValue),
      )
      .replace(/{{installments}}/g, simulation.installments.toString())
      .replace(
        /{{interestRate}}/g,
        this.formatPercent(simulation.interestRate) + ' a.a.',
      )
      .replace(
        /{{monthlyRate}}/g,
        this.formatPercent(parseFloat(simulation.interestRate.toString()) / 12),
      )
      .replace(/{{totalAmount}}/g, this.formatCurrency(simulation.totalAmount))
      .replace(
        /{{totalInterest}}/g,
        this.formatCurrency(simulation.totalInterest),
      )
      .replace(
        /{{scheduleRows}}/g,
        this.generateScheduleRows(simulation.schedule),
      )
      .replace(/{{creatorName}}/g, simulation.createdBy.name)
      .replace(
        /{{generatedAt}}/g,
        this.formatDate(new Date()) +
          ' às ' +
          new Date().toLocaleTimeString('pt-BR'),
      );
  }

  private generateScheduleRows(
    schedule: SimulationWithDetails['schedule'],
  ): string {
    return schedule
      .map(
        (item) => `
      <tr>
        <td>${item.installmentNumber}</td>
        <td>${this.formatDate(item.dueDate)}</td>
        <td class="number">${this.formatCurrency(item.principal)}</td>
        <td class="number">${this.formatCurrency(item.interest)}</td>
        <td class="number">${this.formatCurrency(item.total)}</td>
        <td class="number">${this.formatCurrency(item.balance)}</td>
      </tr>
    `,
      )
      .join('');
  }

  private formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private formatCurrency(value: Decimal | number): string {
    const num =
      typeof value === 'string'
        ? parseFloat(value)
        : parseFloat(value?.toString() || '0');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  }

  private formatPercent(value: Decimal | number): string {
    const num =
      typeof value === 'string'
        ? parseFloat(value)
        : parseFloat(value?.toString() || '0');
    return `${num.toFixed(2)}%`;
  }
}
