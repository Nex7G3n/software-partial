import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('logs')
export class LogEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	level: string;

	@Column()
	message: string;

	@Column({ nullable: true })
	context: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	timestamp: Date;
}
