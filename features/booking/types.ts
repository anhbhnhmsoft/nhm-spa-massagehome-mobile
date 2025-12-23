import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _BookingStatus, _ServiceDuration } from '@/features/service/const';


export type BookingCheckItem = {
  booking_id: string;
  service_name: string;
  date: string;
  location: string;
  technician: string;
  total_price: string;
}

export type BookingCheckResponse = ResponseDataSuccessType<{
  status: 'waiting' | 'confirmed' | 'failed';
  data?: BookingCheckItem;
}>

export type ListBookingRequest = BaseSearchRequest<{
  status?: _BookingStatus;
}>

export type BookingItem = {
  "id": string,
  "service": {
    "id": string,
    "name": string
  },
  "ktv_user": {
    "id": string,
    "name": string,
    "avatar_url": string | null
  },
  "user": {
    "id": string,
    "name": string,
    "avatar_url": string | null
  },
  "address": string,
  "note_address": string | null,
  "booking_time": string,
  "start_time": string | null,
  "end_time": string | null,
  "note": string | null,
  "duration": _ServiceDuration,
  "status": _BookingStatus,
  "price": string,
  "has_reviews": boolean
}


export type ListBookingResponse = ResponseDataSuccessType<Paginator<BookingItem>>
