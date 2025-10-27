import { Extender } from 'src/common/entities/common.entites';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'raw_material_batch' })
export class RawMaterialBatch extends Extender {
  @ManyToOne(() => RawMaterial, { eager: true })
  @JoinColumn({ name: 'rawMaterialId' })
  rawMaterial: RawMaterial;

  @Column()
  rawMaterialId: string;

  @Column('numeric')
  amount: number;

  @Column('numeric')
  buyPrice: number;
}
