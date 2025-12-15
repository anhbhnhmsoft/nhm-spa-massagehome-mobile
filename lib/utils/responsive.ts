import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

/** Kích thước chuẩn thiết kế (Figma thường 375 x 812) */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/** Scale theo chiều ngang */
export const scale = (size: number) => (width / guidelineBaseWidth) * size;

/** Scale theo chiều dọc */
export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

/** Scale ở mức vừa phải (thường dùng cho fontSize) */
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/** Lấy kích thước màn hình */
export const SCREEN = { width, height };

/** spacing theo chiều ngang */
export const responsiveSpacing = (value: number) => scale(value);

/** spacing theo chiều dọc */
export const responsiveSpacingVertical = (value: number) =>
  verticalScale(value);

/** font responsive */
export const responsiveFont = (value: number) => moderateScale(value, 0.4);

export const responsiveIcon = (size: number) => moderateScale(size, 0.5);
