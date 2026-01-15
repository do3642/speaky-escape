/**
 * defaultImageMap
 * - assets/default_images 안의 번들 이미지를 "파일명 → require"로 매핑
 * - RN Metro는 require 경로가 정적으로 확정돼야 번들에 포함됩니다.
 *
 * 운영 방식:
 * - 외부 교체 폴더에 같은 파일명이 있으면 그걸 우선 사용 (수동 갱신 불필요)
 * - 번들에 새 파일을 추가하면 여기 목록도 갱신 필요 (RN 번들 특성)
 */
export const defaultImageMap: Record<string, any> = {
  // =========================
  // HINTS: XH001 ~ XH032
  // =========================
  "XH001.png": require("../../../assets/default_images/XH001.png"),
  "XH002.png": require("../../../assets/default_images/XH002.png"),
  "XH003.png": require("../../../assets/default_images/XH003.png"),
  "XH004.png": require("../../../assets/default_images/XH004.png"),
  "XH005.png": require("../../../assets/default_images/XH005.png"),
  "XH006.png": require("../../../assets/default_images/XH006.png"),
  "XH007.png": require("../../../assets/default_images/XH007.png"),
  "XH008.png": require("../../../assets/default_images/XH008.png"),
  "XH009.png": require("../../../assets/default_images/XH009.png"),
  "XH010.png": require("../../../assets/default_images/XH010.png"),
  "XH011.png": require("../../../assets/default_images/XH011.png"),
  "XH012.png": require("../../../assets/default_images/XH012.png"),
  "XH013.png": require("../../../assets/default_images/XH013.png"),
  "XH014.png": require("../../../assets/default_images/XH014.png"),
  "XH015.png": require("../../../assets/default_images/XH015.png"),
  "XH016.png": require("../../../assets/default_images/XH016.png"),
  "XH017.png": require("../../../assets/default_images/XH017.png"),
  "XH018.png": require("../../../assets/default_images/XH018.png"),
  "XH019.png": require("../../../assets/default_images/XH019.png"),
  "XH020.png": require("../../../assets/default_images/XH020.png"),
  "XH021.png": require("../../../assets/default_images/XH021.png"),
  "XH022.png": require("../../../assets/default_images/XH022.png"),
  "XH023.png": require("../../../assets/default_images/XH023.png"),
  "XH024.png": require("../../../assets/default_images/XH024.png"),
  "XH025.png": require("../../../assets/default_images/XH025.png"),
  "XH026.png": require("../../../assets/default_images/XH026.png"),
  "XH027.png": require("../../../assets/default_images/XH027.png"),
  "XH028.png": require("../../../assets/default_images/XH028.png"),
  "XH029.png": require("../../../assets/default_images/XH029.png"),
  "XH030.png": require("../../../assets/default_images/XH030.png"),
  "XH031.png": require("../../../assets/default_images/XH031.png"),
  "XH032.png": require("../../../assets/default_images/XH032.png"),

  // =========================
  // ANSWERS: mapping.json에 있는 것만
  // =========================
  "XA001.png": require("../../../assets/default_images/XA001.png"),
  "XA002.png": require("../../../assets/default_images/XA002.png"),
  "XA003.png": require("../../../assets/default_images/XA003.png"),
  "XA005.png": require("../../../assets/default_images/XA005.png"),
  "XA006.png": require("../../../assets/default_images/XA006.png"),
  "XA007.png": require("../../../assets/default_images/XA007.png"),
  "XA008.png": require("../../../assets/default_images/XA008.png"),
  "XA009.png": require("../../../assets/default_images/XA009.png"),
  "XA010.png": require("../../../assets/default_images/XA010.png"),
  "XA012.png": require("../../../assets/default_images/XA012.png"),
  "XA013.png": require("../../../assets/default_images/XA013.png"),
  "XA014.png": require("../../../assets/default_images/XA014.png"),
  "XA015.png": require("../../../assets/default_images/XA015.png"),
  "XA017.png": require("../../../assets/default_images/XA017.png"),
  "XA021.png": require("../../../assets/default_images/XA021.png"),
  "XA029.png": require("../../../assets/default_images/XA029.png"),
  "XA030.png": require("../../../assets/default_images/XA030.png"),
  "XA031.png": require("../../../assets/default_images/XA031.png"),
};
