import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, typography, radius } from "../../theme";
import Card from "../../components/ui/Card";

const { width } = Dimensions.get("window");

export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [user?.id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/leaderboard");
      const data = response.leaderboard || response.data || [];
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading && leaderboard.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers</Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.leaderboardItem}>
            <View style={styles.rankContainer}>
              <Text
                style={[
                  styles.rankNumber,
                  index === 0 && styles.rankFirst,
                  index === 1 && styles.rankSecond,
                  index === 2 && styles.rankThird,
                ]}
              >
                #{index + 1}
              </Text>
            </View>
            <View style={styles.userInfo}>
              {item.avatar ? (
                <View style={styles.avatar}>
                  {/* In a real app, we would use an Image component */}
                  <Text style={styles.avatarText}>
                    {item.name?.charAt(0) || "U"}
                  </Text>
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.name?.charAt(0) || "U"}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>
                  {(item.role || "").charAt(0).toUpperCase() +
                    (item.role || "").slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Events</Text>
                <Text style={styles.statValue}>{item.events || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Jobs</Text>
                <Text style={styles.statValue}>{item.jobs || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Hours</Text>
                <Text style={styles.statValue}>{item.hours || 0}</Text>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Points</Text>
              <Text style={styles.pointsValue}>{item.points || 0}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No leaderboard data available</Text>
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    alignItems: "center",
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.gray900,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.gray500,
    marginTop: 4,
  },
  leaderboardItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.gray600,
  },
  rankFirst: {
    color: colors.primary,
  },
  rankSecond: {
    color: colors.gray400,
  },
  rankThird: {
    color: colors.warning,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.white,
  },
  userDetails: {
    // We can adjust if needed
  },
  userName: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.gray900,
  },
  userRole: {
    fontSize: typography.xs,
    color: colors.gray500,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 12,
  },
  statBox: {
    alignItems: "center",
    minWidth: 60,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.gray400,
  },
  statValue: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.gray900,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  pointsLabel: {
    fontSize: typography.sm,
    color: colors.gray600,
  },
  pointsValue: {
    fontSize: typography.lg,
    fontWeight: "700",
    color: colors.primary,
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
