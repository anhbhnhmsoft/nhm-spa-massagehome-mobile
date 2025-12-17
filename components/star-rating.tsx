import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Star } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';


export default function StarRating({
  rating,
  size = 24,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <View className="flex-row">
      {[...Array(5)].map((_, i) => (
        <Icon
          as={Star}
          key={i}
          size={size}
          fill={i < Math.floor(rating) ? DefaultColor.yellow[500] : DefaultColor.gray[300]}
          color={i < Math.floor(rating) ? DefaultColor.yellow[500] : DefaultColor.gray[300]}
        />
      ))}
    </View>
  );
}
