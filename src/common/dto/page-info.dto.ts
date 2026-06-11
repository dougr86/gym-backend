import { IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PageInfo {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    // Check if it's already a number or a string before conversion
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10);
    return 0; // fallback if it's some unexpected object type
  })
  @Min(0)
  page: number = 0; // 0-indexed just like your Java standard

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    // Check if it's already a number or a string before conversion
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseInt(value, 10);
    return 0; // fallback if it's some unexpected object type
  })
  @Min(1)
  size: number = 50;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    // Handles ?sort=name&sort=-createdAt or ?sort=name,-createdAt
    const entries = Array.isArray(value) ? value : [value];
    return entries
      .flatMap((entry: string) => entry.split(','))
      .map((str: string) => str.trim())
      .filter((str: string) => str.length > 0);
  })
  sort: string[] = [];

  // Helper to convert the ['name', '-createdAt'] array directly into TypeORM's sort object
  getOrderBy(alias?: string): Record<string, 'ASC' | 'DESC'> {
    const orderBy: Record<string, 'ASC' | 'DESC'> = {};
    const prefix = alias ? `${alias}.` : '';

    for (const field of this.sort) {
      const isDescending = field.startsWith('-');
      const cleanField = isDescending ? field.substring(1) : field;
      orderBy[`${prefix}${cleanField}`] = isDescending ? 'DESC' : 'ASC';
    }

    // Default fallback if no sort array provided
    if (Object.keys(orderBy).length === 0) {
      orderBy[`${prefix}createdAt`] = 'DESC';
    }

    return orderBy;
  }

  getSkip(): number {
    return this.page * this.size;
  }
}
