// src/shared/utils/mappingTemplate.ts
import RNFS from "react-native-fs";
import { ensureOverrideDir, getOverrideMappingPath, resetMappingCache } from "./mapping";

/**
 * buildMappingTemplate()
 * - 외부 mapping.json 초기 템플릿(운영자가 수정하기 쉬운 형태)
 */
export const buildMappingTemplate = () => {
  return {
    hints: {
      // 예시:
      // "XH001": "XH001.png"
    },
    answers: {
      // 예시:
      // "XA001": "XA001.png"
    },
  };
};

/**
 * hasOverrideMappingFile()
 * - 외부 mapping.json 존재 여부
 */
export const hasOverrideMappingFile = async () => {
  const path = getOverrideMappingPath();
  return RNFS.exists(path);
};

/**
 * writeMappingTemplateIfMissing()
 * - escape_images/mapping.json이 없으면 생성
 * - 있으면 그대로 유지(덮어쓰기 안 함)
 */
export const writeMappingTemplateIfMissing = async () => {
  await ensureOverrideDir();

  const path = getOverrideMappingPath();
  const exists = await RNFS.exists(path);

  if (exists) {
    return { created: false, path };
  }

  const template = buildMappingTemplate();
  const json = JSON.stringify(template, null, 2);

  await RNFS.writeFile(path, json, "utf8");

  // 새 파일을 만들었으니 캐시 초기화
  resetMappingCache();

  return { created: true, path };
};

/**
 * writeMappingTemplateForce()
 * - 강제로 템플릿으로 덮어쓰기(주의용)
 */
export const writeMappingTemplateForce = async () => {
  await ensureOverrideDir();

  const path = getOverrideMappingPath();
  const template = buildMappingTemplate();
  const json = JSON.stringify(template, null, 2);

  await RNFS.writeFile(path, json, "utf8");
  resetMappingCache();

  return { created: true, path };
};
