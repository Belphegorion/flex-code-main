import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, 
  TouchableOpacity, StyleSheet, 
  Modal, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, typography, radius } from '../../theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put('/profile', formData);
      updateUser(response.data.user);
      setModalVisible(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>
      
      <View style={styles.profileCard}>
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'No Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'No Email'}</Text>
          <Text style={styles.profileRole}>
            Role: {(user?.role || '').charAt(0).toUpperCase() + (user?.role || '').slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel>Events Organized</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel>Jobs Worked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel>Hours Volunteered</Text>
        </View>
      </View>
      
      <View style={styles.editSection}>
        <Text style={styles.editTitle}>Edit Profile</Text>
        <View style={styles.editFields}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
          />
          <Input
            label="Phone Number"
            placeholder="Enter your phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <Button 
          title="Save Changes"
          onPress={handleSaveProfile}
          loading={loading}
          style={styles.saveButton}
        />
        <Button 
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
      
      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View>
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                />
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  keyboardType="phone-pad"
                />
                <View style={styles.modalActions}>
                  <Button 
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button 
                    title="Save"
                    onPress={handleSaveProfile}
                    loading={loading}
                    variant="primary"
                    style={styles.modalButton}
                  />
                </View>
              </View>
            )}
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: '700',
    color: colors.gray900,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    ...styles.shadowMd,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: typography.base,
    color: colors.gray600,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: typography.sm,
    color: colors.primary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    ...styles.shadowSm,
    minWidth: 80,
  },
  statNumber: {
    fontSize: typography['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.gray500,
    marginTop: 4,
  },
  editSection: {
    marginHorizontal: 20,
  },
  editTitle: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 16,
  },
  editFields: {
    gap: 16,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
  },
  saveButton: {
    flex: 1,
    marginRight: 12,
  },
  logoutButton: {
    flex: 1,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});