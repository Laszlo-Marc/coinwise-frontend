import { colors } from "@/constants/colors";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DocumentPickerComponent = () => {
  const [extractedText, setExtractedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleDocumentUpload = async () => {
    try {
      // Step 1: Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allows all file types
        copyToCacheDirectory: true, // Ensures the file is accessible
      });

      if (result.canceled) {
        console.log("User canceled document picker");
        return;
      }

      const document = result.assets[0];
      console.log("Picked document:", document);

      // Step 2: Show loading state
      setIsLoading(true);
      setUploadStatus("Preparing document for upload...");

      // Step 3: Prepare and upload the document
      const formData = new FormData();
      const file = {
        uri: document.uri,
        name: document.name || "upload.pdf",
        type: document.mimeType || "application/pdf",
      };

      setUploadStatus("Reading document contents...");
      const response = await fetch(file.uri);
      const blob = await response.blob();

      formData.append("file", blob, file.name);

      setUploadStatus("Uploading document to server...");
      const uploadResponse = await axios.post(
        "http://localhost:8000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Step 4: Handle success
      setExtractedText(uploadResponse.data.text);
      setUploadStatus("Document processed successfully!");
      console.log("Upload successful:", uploadResponse.data);

      // Reset loading state after a brief delay to show success message
      setTimeout(() => {
        setIsLoading(false);
        setUploadStatus("");
      }, 1500);
    } catch (error) {
      // Step 5: Handle errors
      console.error("Upload failed:", error);
      setIsLoading(false);
      setUploadStatus("");
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your document. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Document Upload</Text>

        {!isLoading ? (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleDocumentUpload}
          >
            <Text style={styles.uploadButtonText}>
              Select & Upload Document
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>{uploadStatus}</Text>
          </View>
        )}

        {extractedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Extracted Text</Text>
            <View style={styles.textContainer}>
              <Text style={styles.extractedText}>{extractedText}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.text,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  resultContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333333",
  },
  textContainer: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  extractedText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
});

export default DocumentPickerComponent;
