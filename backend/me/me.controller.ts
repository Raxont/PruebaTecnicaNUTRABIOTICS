import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrescriptionFiltersDto } from '../common/dto/pagination.dto';

@Controller('me')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MeController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Get('prescriptions')
  @Roles('PATIENT')
  async getMyPrescriptions(@Request() req, @Query() filters: PrescriptionFiltersDto) {
    return this.prescriptionsService.getMyPrescriptions(req.user.userId, filters);
  }
}
