// hooks/useDocumentUpload.ts
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert } from "react-native";

export type ProcessingStage =
  | "anonymizing"
  | "extracting_sections"
  | "normalizing"
  | "extracting_transactions"
  | "done"
  | "";

export function useDocumentUpload(
  uploadBankStatement: (data: FormData) => Promise<any>
) {
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      if (!result.assets || result.assets.length === 0) {
        throw new Error("No file was selected.");
      }

      const document = result.assets[0];
      if (!document.uri) throw new Error("File URI is missing.");

      setIsLoading(true);
      setProcessingStage("anonymizing");
      await delay(1000);

      setProcessingStage("extracting_sections");
      await delay(1000);

      setProcessingStage("normalizing");
      await delay(1000);

      setProcessingStage("extracting_transactions");

      const formData = new FormData();
      formData.append("file", {
        uri: document.uri,
        name: document.name || "upload.pdf",
        type: document.mimeType || "application/pdf",
      } as any);

      const response = await uploadBankStatement(formData);
      console.log("Upload response:", response);

      setProcessingStage("done");
      setTimeout(() => {
        setIsLoading(false);
        setProcessingStage("");
      }, 1000);
    } catch (err) {
      console.error("Upload failed:", err);
      setIsLoading(false);
      setProcessingStage("");

      let message = "There was a problem uploading your document.";
      if (err instanceof Error && err.message) {
        message = err.message;
      }

      Alert.alert("Upload Failed", message);
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  return {
    uploadDocument,
    isLoading,
    processingStage,
  };
}
