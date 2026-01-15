import RNFS from "react-native-fs";

/**
 * getOverrideDir()
 * - 운영자가 교체 이미지를 넣는 외부 폴더
 * - <externalFilesDir>/escape_images/
 */
export const getOverrideDir = () => {
  return `${RNFS.ExternalDirectoryPath}/escape_images`;
};

/**
 * has*
 * - 교체 폴더에 파일이 존재하는지 확인
 */
export const hasOverrideImage = async (fileName: string) => {
  const path = `${getOverrideDir()}/${fileName}`;
  return RNFS.exists(path);
};

/**
 * resolveImage()
 * - 최종 로딩 대상 URI를 결정
 * 우선순위:
 * 1) 외부 폴더(escape_images)에 동일 파일명이 있으면 file:// URI 반환
 * 2) 없으면 assets/default_images 번들 자산으로 fallback
 */
export const resolveImage = async (fileName: string) => {
  const overridePath = `${getOverrideDir()}/${fileName}`;

  if (await RNFS.exists(overridePath)) {
    return { type: "file" as const, uri: `file://${overridePath}` };
  }

  // 번들 이미지 fallback
  // 번들 이미지는 require가 필요해서, 호출측에서 require-map을 사용하도록 설계합니다.
  return { type: "asset" as const, fileName };
};
