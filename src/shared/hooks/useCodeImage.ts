import { useCallback, useMemo, useState } from "react";
import { getHintFileNameByCode, getAnswerFileNameByCode } from "../utils/mapping";
import { resolveImage } from "../utils/imageResolver";
import { defaultImageMap } from "../assets/defaultImageMap";

type ImageSource =
  | { type: "file"; uri: string }
  | { type: "asset"; source: any }
  | { type: "none" };

type CodeKind = "hint" | "answer";

export const useCodeImage = (kind: CodeKind) => {
  const [code, setCode] = useState("");
  const [image, setImage] = useState<ImageSource>({ type: "none" });
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => code.trim().length > 0 && !isLoading, [code, isLoading]);

  const reset = useCallback(() => {
    setCode("");
    setImage({ type: "none" });
    setErrorText(null);
    setIsLoading(false);
  }, []);

  const handleChangeCode = useCallback((text: string) => {
    setCode(text);
  }, []);

  const handleSubmitCode = useCallback(
    async (nextCode?: string) => {
      const trimmed = (nextCode ?? code).trim().toUpperCase();
      if (trimmed.length === 0) return;

      setIsLoading(true);
      setErrorText(null);

      try {
        const fileName =
          kind === "hint"
            ? await getHintFileNameByCode(trimmed)
            : await getAnswerFileNameByCode(trimmed);

        if (!fileName) {
          setImage({ type: "none" });
          setErrorText("매핑에 없는 코드입니다.");
          return;
        }

        const resolved = await resolveImage(fileName);

        if (resolved.type === "file") {
          setImage({ type: "file", uri: resolved.uri });
          return;
        }

        // ✅ 파일명 normalize (경로 포함 대비)
        const key = fileName.split("/").pop() ?? fileName;

        const asset = defaultImageMap[key];
        if (!asset) {
          setImage({ type: "none" });
          setErrorText(
            `번들 이미지 매핑이 없습니다. defaultImageMap을 확인하세요. (key=${key})`
          );
          return;
        }

        setImage({ type: "asset", source: asset });
      } catch (e) {
        setImage({ type: "none" });
        setErrorText("이미지 로딩 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [code, kind]
  );

  return {
    code,
    image,
    errorText,
    isLoading,
    canSubmit,
    handleChangeCode,
    handleSubmitCode, // 이제 (nextCode?: string) 지원
    reset,
  };
}