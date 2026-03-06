import { _PartnerFileType } from '@/features/user/const';
import { ApplyTechnicalRequest, FileUploadItem } from '@/features/user/types';

export const countByType = (files: { type_upload: _PartnerFileType }[], type: _PartnerFileType) =>
  files.filter((f) => f.type_upload === type).length;

export const getFilesByType = (
  files: FileUploadItem[],
  type: _PartnerFileType,
) => files.filter((f) => f.type_upload === type);


export interface FileUploadForm<TFile = any, TType = string> {
  type_upload: TType;
  file: TFile;
}
/**
 * Thêm mới hoặc Cập nhật file (ghi đè nếu đã tồn tại cùng type_upload)
 */
export const addOrUpdateFile = <TFile, TType>(
  currentFiles: FileUploadForm<TFile, TType>[],
  typeUpload: TType,
  fileData: TFile
): FileUploadForm<TFile, TType>[] => {
  // 1. Lọc bỏ file cũ cùng type (nếu có)
  const filtered = currentFiles.filter((f) => f.type_upload !== typeUpload);
  // 2. Trả về mảng mới với file được chèn vào cuối
  return [
    ...filtered,
    {
      type_upload: typeUpload,
      file: fileData,
    },
  ];
};

/**
 * Xóa file dựa trên type_upload
 */
export const removeFileByType = <TFile, TType>(
  currentFiles: FileUploadForm<TFile, TType>[],
  typeUpload: TType
): FileUploadForm<TFile, TType>[] => {
  return currentFiles.filter((f) => f.type_upload !== typeUpload);
};


/**
 * THÊM MỚI (Append): Thêm một file vào mảng mà KHÔNG xóa các file cũ cùng type
 */
export const appendFile = <TFile, TType>(
  currentFiles: FileUploadForm<TFile, TType>[],
  typeUpload: TType,
  fileData: TFile
): FileUploadForm<TFile, TType>[] => {
  return [
    ...currentFiles,
    {
      type_upload: typeUpload,
      file: fileData,
    },
  ];
};
/**
 * CẬP NHẬT CỤ THỂ (Update Specific): Đổi một ảnh đã có thành ảnh khác
 */
export const updateSpecificFile = <TFile, TType>(
  currentFiles: FileUploadForm<TFile, TType>[],
  oldItem: FileUploadForm<TFile, TType>, // Truyền đúng cái item đang được click
  newFileData: TFile
): FileUploadForm<TFile, TType>[] => {
  return currentFiles.map((f) =>
    f === oldItem
      ? { ...f, file: newFileData } // Thay thế toàn bộ data file mới (uri, name, type)
      : f
  );
};

/**
 * XÓA CỤ THỂ (Remove Specific): Xóa đúng 1 ảnh khỏi Gallery
 */
export const removeSpecificFile = <TFile, TType>(
  currentFiles: FileUploadForm<TFile, TType>[],
  itemToRemove: FileUploadForm<TFile, TType>
): FileUploadForm<TFile, TType>[] => {
  return currentFiles.filter((f) => f !== itemToRemove); // Lọc bỏ đúng item đó
};