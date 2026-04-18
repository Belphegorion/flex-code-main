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

export default function OrganizerDashboard({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.events || response.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (event) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  };

  const handleCreateEvent = async () => {
    // Basic validation
    if (!formData.title || !formData.date || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/events", formData);
      setModalVisible(false);
      // Reset form
      setFormData({
        title: "",
        date: "",
        location: "",
        description: "",
      });
      fetchEvents(); // Refresh the list
      alert("Event created successfully!");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <Button
          title="+ New Event"
          onPress={() => setModalVisible(true)}
          variant="outline"
          style={styles.newEventButton}
        />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Card
              title={item.title}
              subtitle={`${item.location} • ${item.date}`}
              onPress={() => handleEventPress(item)}
            >
              <View style={styles.eventDetails}>
                <Text style={styles.detailText}>
                  👥 {item.attendeesCount || 0} attendees
                </Text>
                <Text style={styles.detailText}>
                  💰 ${item.budget || 0} budget
                </Text>
              </View>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events created yet</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Create Event Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Event</Text>

            <Input
              label="Event Title"
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Input
              label="Date"
              placeholder="Select date"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <Input
              label="Location"
              placeholder="Enter location"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />

            <Input
              label="Description"
              placeholder="Enter description"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              // In a real implementation, we might use a TextInput with multiline
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Create Event"
                onPress={handleCreateEvent}
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
