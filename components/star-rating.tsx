import { View, TouchableOpacity } from 'react-native';
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

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}
export const StarRatingInput = ({ rating, onRatingChange }: StarRatingInputProps) => {
  return (
    <View className="flex-row justify-center my-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          activeOpacity={0.8}
          onPress={() => onRatingChange(star)}
          className="mx-1"
        >
          <Star
            size={40}
            fill={star <= rating ? "#FBBF24" : "transparent"}
            color={star <= rating ? "#FBBF24" : "#D1D5DB"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};