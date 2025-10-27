import { PartialType } from '@nestjs/swagger';
import { CreateRawMaterialLogDto } from './create-raw-material-log.dto';

export class UpdateRawMaterialLogDto extends PartialType(
  CreateRawMaterialLogDto,
) {}
