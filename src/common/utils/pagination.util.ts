import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PageInfo } from '../dto/page-info.dto';

/**
 * Applies generic page, size, and sort rules to any TypeORM QueryBuilder.
 * Mirrors your Quarkus Panache query configuration style.
 */
export function applyPagination<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  pageInfo: PageInfo,
  alias: string,
): void {
  // 1. Apply Skip and Take
  const page = pageInfo.page || 0;
  const size = pageInfo.size || 50;
  queryBuilder.skip(page * size).take(size);

  // 2. Parse and Apply Sorting Array (e.g., ['name', '-createdAt'])
  let hasAppliedFirstSort = false;

  if (pageInfo.sort && pageInfo.sort.length > 0) {
    for (const field of pageInfo.sort) {
      const isDescending = field.startsWith('-');
      const cleanField = isDescending ? field.substring(1) : field;
      const order = isDescending ? 'DESC' : 'ASC';
      const orderKey = `${alias}.${cleanField}`;

      if (!hasAppliedFirstSort) {
        queryBuilder.orderBy(orderKey, order);
        hasAppliedFirstSort = true;
      } else {
        queryBuilder.addOrderBy(orderKey, order);
      }
    }
  }

  // Fallback default sort if nothing was provided
  if (!hasAppliedFirstSort) {
    queryBuilder.orderBy(`${alias}.createdAt`, 'DESC');
  }
}
