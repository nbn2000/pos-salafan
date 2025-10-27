import { Extender } from 'src/common/entities/common.entites';
import { MeasurementType, Priority } from 'src/common/enums/enum';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'raw_material' })
export class RawMaterial extends Extender {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: MeasurementType })
  type: MeasurementType;

  @Column({ type: 'enum', enum: Priority, default: Priority.LOW })
  priority: Priority;

  @OneToMany(() => RawMaterialBatch, (b) => b.rawMaterial)
  batches: RawMaterialBatch[];
}
