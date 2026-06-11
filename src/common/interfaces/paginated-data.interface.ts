export class PaginatedData<T> {
  items: T[];
  itemsSize: number;
  page: number;
  pageSize: number;
  totalCount: number;

  constructor(items: T[], page: number, size: number, totalCount: number) {
    this.items = items || [];
    this.itemsSize = this.items.length;
    this.page = page;
    this.pageSize = size;
    this.totalCount = totalCount;
  }
}
