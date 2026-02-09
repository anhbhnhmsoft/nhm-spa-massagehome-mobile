import { create } from 'zustand';
import { PickBookingItem, PrepareBookingResponse, ServiceItem } from '@/features/service/types';


interface IServiceStore {
  service: ServiceItem | null;
  pick_service_booking: PrepareBookingResponse['data'] | null;


  setService: (service: ServiceItem | null) => void;
  setPickServiceBooking: (pick_service_booking: PrepareBookingResponse['data'] | null) => void,
}


const useServiceStore = create<IServiceStore>((set) => ({
  service: null,
  pick_service_booking: null,


  setService: (service) => set({ service }),
  setPickServiceBooking: (pick_service_booking) => set({ pick_service_booking }),
}));


export default useServiceStore;
