import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard personalizado para rate limiting
 * Implementa throttling básico
 */
@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Usar IP del cliente
    return req.ip;
  }
}
