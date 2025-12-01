import { Controller, Param, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CcbGeneratorService } from '../services/ccb-generator.service';
import { SimulationsService } from '../services/simulations.service';

@ApiTags('simulations')
@ApiBearerAuth('JWT-auth')
@Controller('simulations')
export class CcbController {
  constructor(
    private readonly simulationsService: SimulationsService,
    private readonly ccbGeneratorService: CcbGeneratorService,
  ) {}

  @Post(':id/ccb')
  @ApiOperation({
    summary: 'Generate CCB HTML document',
    description: 'Generates CCB document in HTML format',
  })
  @ApiParam({
    name: 'id',
    description: 'Simulation UUID',
  })
  @ApiProduces('text/html')
  @ApiResponse({
    status: 200,
    description: 'HTML document generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async generateCcbHtml(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const simulation = await this.simulationsService.findOne(id);
    const html = await this.ccbGeneratorService.generateHtml(simulation);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
