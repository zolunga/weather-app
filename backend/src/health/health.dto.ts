import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({ example: '2026-05-13T19:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 42 })
  uptimeSeconds: number;
}
