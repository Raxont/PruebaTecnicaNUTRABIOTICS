import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { MetricsResponseDto, MetricsFiltersDto } from './admin.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrescriptionFiltersDto } from '../common/dto/pagination.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('metrics')
  @Roles('ADMIN')
  async getMetrics(@Query() filters: MetricsFiltersDto): Promise<MetricsResponseDto> {
    return this.adminService.getMetrics(filters);
  }

  @Get('prescriptions')
  @Roles('ADMIN')
  async getPrescriptions(@Query() filters: PrescriptionFiltersDto) {
    return this.adminService.getPrescriptions(filters);
  }
}
