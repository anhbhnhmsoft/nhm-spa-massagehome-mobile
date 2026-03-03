import {  View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';


export const ServiceCardSkeleton = () => {
  return (
    <View className="mb-3 flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <View className="mr-3 h-20 w-20">
        <Skeleton className="h-20 w-20 rounded-full bg-slate-200" />
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row items-start justify-between">
          <View>
            <Skeleton className="mb-2 h-5 w-32 rounded-lg bg-slate-200" />
            <Skeleton className="h-4 w-20 rounded-lg bg-slate-200" />
          </View>
        </View>

        <View className="mt-2 flex-row items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
        </View>

        <View className="mt-3 w-full flex-row items-center justify-between pt-2">
          <View />
          <Skeleton className="h-8 w-20 rounded-md bg-slate-200" />
        </View>
      </View>
    </View>
  );
};
