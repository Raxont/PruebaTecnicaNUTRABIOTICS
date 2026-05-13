import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Guard personalizado para rate limiting
 * Implementa throttling básico
 */
@Injectable()
export class ThrottleGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Usar IP del cliente
    return req.ip;
  }
}
