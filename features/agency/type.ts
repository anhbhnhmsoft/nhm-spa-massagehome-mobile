import { Paginator, ResponseDataSuccessType } from '@/lib/types';
import { ListKTVItem } from '../user/types';

export type ListKtvResponse = ResponseDataSuccessType<Paginator<ListKTVItem>>;
