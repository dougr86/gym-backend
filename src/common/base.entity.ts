import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class AuditableEntity {
  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  // Soft Delete column - TypeORM will automatically filter these out
  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @Column({ name: 'created_by', nullable: true, select: false })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true, select: false })
  updatedBy: string;

  @Column({ name: 'deleted_by', nullable: true, select: false })
  deletedBy: string;
}
