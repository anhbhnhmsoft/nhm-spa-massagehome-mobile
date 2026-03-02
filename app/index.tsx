import FullScreenLoading from '@/components/full-screen-loading';
import { View } from 'react-native';

const SplashScreen = () => {

  return (
    <View className="flex-1 bg-blue-100">
      <FullScreenLoading loading={true} />
    </View>
  );
};

export default SplashScreen;



