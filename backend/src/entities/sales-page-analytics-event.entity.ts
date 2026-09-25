import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

export enum SalesPageAnalyticsEventType {
  VIEW = 'view',
  LEAD = 'lead',
  PURCHASE = 'purchase',
}

@Entity('sales_page_analytics_events')
@Index(['salesPageId', 'type', 'createdAt'])
@Index(['salesPageId', 'type', 'visitorKey', 'createdAt'])
export class SalesPageAnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  mentorId: string;

  @Column({ type: 'uuid' })
  salesPageId: string;

  @Column({ type: 'enum', enum: SalesPageAnalyticsEventType })
  type: SalesPageAnalyticsEventType;

  @Column({ type: 'varchar', length: 120, nullable: true })
  visitorKey?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
