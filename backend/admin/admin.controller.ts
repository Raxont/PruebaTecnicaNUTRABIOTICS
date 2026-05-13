import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { MetricsResponseDto } from './admin.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('metrics')
  @Roles('ADMIN')
  async getMetrics(): Promise<MetricsResponseDto> {
    return this.adminService.getMetrics();
  }
}
