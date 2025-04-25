import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { Alert, Button, Text, View } from "react-native";

const DocumentPickerComponent: React.FC = () => {
  const [extractedText, setExtractedText] = React.useState("");

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allows all file types
        copyToCacheDirectory: true, // Ensures the file is accessible
      });

      if (result.canceled) {
        console.log("User canceled document picker");
        return;
      }

      console.log("Picked document:", result.assets[0]);
      return result.assets[0]; // `assets[0]` contains the selected file
    } catch (error) {
      console.error("DocumentPicker Error:", error);
    }
  };

  const uploadDocument = async () => {
    const document = await pickDocument();

    if (!document) {
      Alert.alert("No document selected");
      return;
    }

    const formData = new FormData();
    const file = {
      uri: document.uri,
      name: document.name || "upload.pdf",
      type: document.mimeType || "application/pdf",
    };

    const response = await fetch(file.uri);
    const blob = await response.blob();

    formData.append("file", blob, file.name);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setExtractedText(response.data.text);
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Pick Document" onPress={pickDocument} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Upload Document" onPress={uploadDocument} />
      <Text style={{ marginTop: 20, padding: 10, fontFamily: "" }}>
        {extractedText}
      </Text>
    </View>
  );
};

export default DocumentPickerComponent;
