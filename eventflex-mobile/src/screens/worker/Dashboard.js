import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, typography, radius } from "../../theme";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const { width } = Dimensions.get("window");

export default function WorkerDashboard({ navigation }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/discover");
      setJobs(response.jobs || response.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleJobPress = (job) => {
    navigation.navigate("JobDetails", { jobId: job.id });
  };

  const handleApplyPress = async (job) => {
    try {
      await api.post(`/jobs/${job.id}/apply`);
      alert("Application submitted successfully!");
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error("Failed to apply:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.jobContainer}>
            <Card
              title={item.title}
              subtitle={`${item.companyName} • ${item.location}`}
              onPress={() => handleJobPress(item)}
            >
              <View style={styles.jobDetails}>
                <Text style={styles.detailText}>💰 ${item.payRate}/hr</Text>
                <Text style={styles.detailText}>
                  ⏰ {item.shiftStart} - {item.shiftEnd}
                </Text>
                <Text style={styles.detailText}>📅 {item.date}</Text>
              </View>

              {!item.userApplied && (
                <Button
                  title="Apply Now"
                  onPress={() => handleApplyPress(item)}
                  variant="outline"
                  style={styles.applyButton}
                />
              )}

              {item.userApplied && (
                <Button
                  title="Applied"
                  disabled
                  variant="outline"
                  style={styles.applyButton}
                />
              )}
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No jobs available</Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
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
  jobContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  jobDetails: {
    marginTop: 12,
    gap: 4,
  },
  detailText: {
    fontSize: typography.sm,
    color: colors.gray600,
  },
  applyButton: {
    marginTop: 12,
    minWidth: 100,
    alignSelf: "flex-end",
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
});
