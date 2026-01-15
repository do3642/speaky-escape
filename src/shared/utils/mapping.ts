// src/shared/utils/mapping.ts
import RNFS from "react-native-fs";
import { getOverrideDir } from "./imageResolver";

type MappingJson = {
  hints: Record<string, string>;
  answers: Record<string, string>;
};

let cachedMapping: MappingJson | null = null;

/**
 * getOverrideMappingPath()
 * - 운영자가 현장에서 매핑을 교체/추가할 수 있는 외부 매핑 파일 경로
 * - <externalFilesDir>/escape_images/mapping.json
 */
export const getOverrideMappingPath = () => {
  return `${getOverrideDir()}/mapping.json`;
};

/**
 * resetMappingCache()
 * - mapping.json 또는 외부 이미지 변경을 즉시 반영하기 위한 캐시 초기화
 */
export const resetMappingCache = () => {
  cachedMapping = null;
};

/**
 * ensureOverrideDir()
 * - escape_images 폴더가 없으면 생성
 */
export const ensureOverrideDir = async () => {
  const dir = getOverrideDir();
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
  return dir;
};

/**
 * loadBundledMapping()
 * - 번들 mapping.json 로드
 */
const loadBundledMapping = async (): Promise<MappingJson> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../../../assets/mapping.json") as MappingJson;
};

/**
 * loadOverrideMapping()
 * - 외부 mapping.json 로드
 */
const loadOverrideMapping = async (): Promise<MappingJson | null> => {
  const path = getOverrideMappingPath();
  if (!(await RNFS.exists(path))) return null;

  const raw = await RNFS.readFile(path, "utf8");
  const parsed = JSON.parse(raw) as MappingJson;

  return {
    hints: parsed?.hints ?? {},
    answers: parsed?.answers ?? {},
  };
};

/**
 * scanOverrideImages()
 * - escape_images 폴더에 있는 파일명 기반으로 자동 매핑 생성
 * - 운영자가 mapping.json을 안 만져도 XH001.png / XA001.png 넣으면 인식되도록
 */
const scanOverrideImages = async (): Promise<MappingJson> => {
  const dir = getOverrideDir();
  const exists = await RNFS.exists(dir);
  if (!exists) return { hints: {}, answers: {} };

  const files = await RNFS.readDir(dir);

  const hints: Record<string, string> = {};
  const answers: Record<string, string> = {};

  for (const f of files) {
    if (!f.isFile()) continue;

    const name = f.name;

    const hintMatch = /^XH(\d{3})\.png$/i.exec(name);
    if (hintMatch) {
      const code = `XH${hintMatch[1]}`.toUpperCase();
      hints[code] = name;
      continue;
    }

    const answerMatch = /^XA(\d{3})\.png$/i.exec(name);
    if (answerMatch) {
      const code = `XA${answerMatch[1]}`.toUpperCase();
      answers[code] = name;
      continue;
    }
  }

  return { hints, answers };
};

/**
 * mergeMapping()
 * - 우선순위: base(번들) <- override(외부 mapping.json) <- scanned(폴더 스캔)
 */
const mergeMapping = (
  base: MappingJson,
  override: MappingJson,
  scanned: MappingJson
): MappingJson => {
  return {
    hints: { ...base.hints, ...override.hints, ...scanned.hints },
    answers: { ...base.answers, ...override.answers, ...scanned.answers },
  };
};

/**
 * loadMapping()
 * - 최종 매핑 로드 (캐시 포함)
 */
export const loadMapping = async (): Promise<MappingJson> => {
  if (cachedMapping) return cachedMapping;

  const base = await loadBundledMapping();
  const override = (await loadOverrideMapping()) ?? { hints: {}, answers: {} };
  const scanned = await scanOverrideImages();

  const merged = mergeMapping(base, override, scanned);
  cachedMapping = merged;

  return merged;
};

export const getHintFileNameByCode = async (code: string) => {
  const mapping = await loadMapping();
  return mapping.hints[code] ?? null;
};

export const getAnswerFileNameByCode = async (code: string) => {
  const mapping = await loadMapping();
  return mapping.answers[code] ?? null;
};
