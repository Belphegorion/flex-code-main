import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, typography, radius } from "../../theme";
import socketService from "../../services/socket";

const { width } = Dimensions.get("window");

export default function GroupChatScreen({ route }) {
  const { user } = useAuth();
  const { groupId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    // Join the group when screen mounts
    socketService.joinGroup(groupId);

    // Listen for new messages
    const onGroupMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    };

    socketService.onGroupMessage(onGroupMessage);

    // Fetch initial messages (simulated)
    loadInitialMessages();

    return () => {
      // Cleanup
      socketService.offGroupMessage();
    };
  }, [groupId]);

  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.get(`/groups/${groupId}/messages`);
      // For demo, we'll use mock data
      setMessages([
        {
          id: 1,
          text: "Welcome to the group chat!",
          userId: "system",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          text: "How is everyone doing?",
          userId: user?.id || "user1",
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      text: inputValue.trim(),
      userId: user?.id || "user1",
      createdAt: new Date().toISOString(),
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Send to server via Socket.IO
    socketService.socket?.emit("send-message", {
      chatId: groupId,
      message: newMessage,
    });

    // Scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === "Enter") {
      sendMessage();
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredLoader}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{groupName}</Text>
        <Text style={styles.subtitle}>Group Chat</Text>
      </View>

      <View style={styles.messagesContainer}>
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.userId === (user?.id || "user1")
                  ? styles.messageSent
                  : styles.messageReceived,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>
                {/* Format time in a real app */}
                Just now
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          ref={messageInputRef}
          style={styles.input}
          placeholder="Type a message..."
          value={inputValue}
          onChangeText={setInputValue}
          onKeyPress={handleKeyPress}
          placeholderTextColor={colors.gray400}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: "600",
    color: colors.white,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.primaryLight,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: radius.md,
  },
  messageSent: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  messageReceived: {
    backgroundColor: colors.gray200,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: typography.base,
    color: colors.white,
  },
  messageTime: {
    fontSize: typography.xs,
    color: colors.white,
    textAlign: "right",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: typography.base,
    color: colors.gray900,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: "600",
  },
  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.gray500,
  },
});
