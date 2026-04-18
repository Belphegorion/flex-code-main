import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, typography } from "../../theme";
import Button from "../../components/ui/Button";

export default function QRScannerScreen({ navigation, route }) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [jobId, setJobId] = useState(route.params?.jobId);
  const [actionType, setActionType] = useState(
    route.params?.actionType || "check_in",
  ); // check_in or check_out

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    // In a real app, we would send this data to our backend to verify and process check-in/out
    processQRCode(data);
  };

  const processQRCode = async (data) => {
    try {
      // Assuming data contains some job or event identifier
      // In a real implementation, we would validate this against our backend
      const response = await api.post(`/jobs/${jobId}/${actionType}`, {
        qrData: data,
        userId: user.id,
      });

      if (response.success) {
        alert(
          `${actionType === "check_in" ? "Checked in" : "Checked out"} successfully!`,
        );
        // Navigate back or to a confirmation screen
        navigation.goBack();
      } else {
        alert("Failed to process QR code. Please try again.");
      }
    } catch (error) {
      console.error("QR processing error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {!scanned && (
        <View style={styles.overlay}>
          <Text style={styles.instructions}>
            Scan QR code to{" "}
            {actionType === "check_in" ? "check in" : "check out"}
          </Text>
          <Text style={styles.instructions}>for job #{jobId}</Text>
        </View>
      )}
      {scanned && (
        <View style={styles.confirmation}>
          <Text style={styles.confirmationText}>Processing...</Text>
          <Button title="Done" onPress={() => navigation.goBack()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 60,
  },
  instructions: {
    fontSize: typography.base,
    color: colors.white,
    marginBottom: 16,
    textAlign: "center",
  },
  confirmation: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationText: {
    fontSize: typography.lg,
    color: colors.white,
    marginBottom: 24,
  },
});
