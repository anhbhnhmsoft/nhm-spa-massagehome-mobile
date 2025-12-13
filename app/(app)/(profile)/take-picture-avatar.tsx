import {useCallback, useRef, useState} from "react";
import {CameraType, CameraView} from "expo-camera";
import {TouchableOpacity, View} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import {router} from "expo-router";

import { useEditAvatar } from '@/features/auth/hooks';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';


export default function TakePictureScreen(){
  // khai báo camera
  const cameraRef = useRef<CameraView>(null);
  const [facing,setFacing] = useState<CameraType>("back");
  const editAvatar = useEditAvatar();

  const takePicture = useCallback(async ()=>{
    const camera = cameraRef.current;
    if (!camera || !camera.takePictureAsync) return;
    const photo = await camera.takePictureAsync({
      quality: 0.5,
      base64: false,
      exif: false,
    });
    const form = new FormData();
    form.append('file',{
      uri: photo.uri,
      name: "avatar.jpg",
      type: "image/jpg"
    } as any);
    editAvatar(form)
  },[])

  return (
    <View className="flex-1">
      <FocusAwareStatusBar hidden={true} />
      <CameraView
        style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
        ref={cameraRef}
        facing={facing}
      />
      <View className="flex-row items-center justify-between px-10 py-10 bg-base-color-3">
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture}>
          <View className="border border-primary-color-1 items-center justify-center rounded-full w-10 h-10">
            <View className="bg-primary-color-1 rounded-full w-8 h-8"/>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (facing === "back"){
              setFacing("front")
            }
            if (facing === "front"){
              setFacing("back")
            }
          }}
        >
          <AntDesign name="sync" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

