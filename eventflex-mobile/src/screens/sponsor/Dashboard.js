import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, typography, radius } from "../../theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const { width } = Dimensions.get("window");

export default function SponsorDashboard({ navigation }) {
  const { user } = useAuth();
  const [sponsoredEvents, setSponsoredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    sponsorshipAmount: "",
    sponsorshipType: "general",
    contactPerson: "",
  });

  useEffect(() => {
    fetchSponsoredEvents();
  }, []);

  const fetchSponsoredEvents = async () => {
    try {
      setLoading(true);
      // Assuming there's an endpoint for sponsored events
      const response = await api.get(`/sponsors/events`);
      setSponsoredEvents(response.events || response.data || []);
    } catch (error) {
      console.error("Failed to fetch sponsored events:", error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSponsoredEvents();
  };

  const handleEventPress = (event) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  };

  const handleSponsorEvent = async () => {
    // Basic validation
    if (!formData.eventName || !formData.sponsorshipAmount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Assuming there's an endpoint for sponsoring events
      await api.post("/sponsorships", {
        ...formData,
        sponsorshipAmount: parseFloat(formData.sponsorshipAmount),
      });
      setModalVisible(false);
      // Reset form
      setFormData({
        eventName: "",
        sponsorshipAmount: "",
        sponsorshipType: "general",
        contactPerson: "",
      });
      fetchSponsoredEvents(); // Refresh the list
      alert("Sponsorship submitted successfully!");
    } catch (error) {
      console.error("Failed to submit sponsorship:", error);
      alert("Failed to submit sponsorship. Please try again.");
    }
  };

  if (loading && sponsoredEvents.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Sponsorships</Text>
        <Button
          title="+ Sponsor Event"
          onPress={() => setModalVisible(true)}
          variant="outline"
          style={styles.newEventButton}
        />
      </View>

      <FlatList
        data={sponsoredEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Card
              title={item.eventName}
              subtitle={`${item.organization} • ${item.eventDate}`}
              onPress={() => handleEventPress(item)}
            >
              <View style={styles.eventDetails}>
                <Text style={styles.detailText}>
                  💰 ${item.sponsorshipAmount} ({item.sponsorshipType})
                </Text>
                <Text style={styles.detailText}>📅 {item.eventDate}</Text>
              </View>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sponsorships yet</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Sponsor Event Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sponsor an Event</Text>

            <Input
              label="Event Name"
              placeholder="Enter event name"
              value={formData.eventName}
              onChangeText={(text) =>
                setFormData({ ...formData, eventName: text })
              }
            />

            <Input
              label="Sponsorship Amount ($)"
              placeholder="Enter amount"
              value={formData.sponsorshipAmount}
              onChangeText={(text) =>
                setFormData({ ...formData, sponsorshipAmount: text })
              }
              keyboardType="numeric"
            />

            <Input
              label="Sponsorship Type"
              placeholder="Select type"
              value={formData.sponsorshipType}
              onChangeText={(text) =>
                setFormData({ ...formData, sponsorshipType: text })
              }
            />

            <Input
              label="Contact Person"
              placeholder="Enter contact person"
              value={formData.contactPerson}
              onChangeText={(text) =>
                setFormData({ ...formData, contactPerson: text })
              }
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Submit Sponsorship"
                onPress={handleSponsorEvent}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.gray900,
  },
  newEventButton: {
    marginLeft: 12,
  },
  eventContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eventDetails: {
    marginTop: 12,
    gap: 4,
  },
  detailText: {
    fontSize: typography.sm,
    color: colors.gray600,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.gray500,
  },
  listFooter: {
    height: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.gray900,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
