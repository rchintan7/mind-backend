import { Type } from '@nestjs/common';
import { PageInfo } from './page-info.model';

export default function Paginated<TItem>(TItemClass: Type<TItem>) {
  abstract class EdgeType {
    cursor: string;
    node: TItem;
  }

  abstract class PaginatedType {
    edges: Array<EdgeType>;
    pageInfo: PageInfo;
    totalCount: number;
  }

  return PaginatedType;
}
