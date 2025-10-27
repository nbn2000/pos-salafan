import { Extender } from 'src/common/entities/common.entites';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RawMaterialLogType } from 'src/common/enums/enum';

@Entity({ name: 'raw_material_log' })
export class RawMaterialLog extends Extender {
  @ManyToOne(() => RawMaterial, { eager: true })
  @JoinColumn({ name: 'rawMaterialId' })
  rawMaterial: RawMaterial;

  @Column()
  rawMaterialId: string;

  @ManyToOne(() => RawMaterialBatch, { eager: true })
  @JoinColumn({ name: 'rawMaterialBatchId' })
  rawMaterialBatch: RawMaterialBatch;

  @Column()
  rawMaterialBatchId: string;

  @Column({ type: 'enum', enum: RawMaterialLogType, default: RawMaterialLogType.CHANGE })
  type: RawMaterialLogType;

  @Column()
  comment: string;
}
