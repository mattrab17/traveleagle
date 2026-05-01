import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../../constants/colors";
import { useAuth } from "../../(authentication)/Auth";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AccountSettings() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [usernameOverride, setUsernameOverride] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  const username = useMemo(() => {
    return (
      user?.user_metadata?.username ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Traveler"
    );
  }, [user]);

  const displayUsername = usernameOverride ?? username;



  const avatarLetter = displayUsername?.trim()?.[0]?.toUpperCase() || "T";

  async function handleSignOut() {
    await logOut();
    router.replace("/WelcomePage");
  }

  async function handlePasswordUpdate() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill out all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Weak password", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Success", "Password updated.");
  }

  function openEditModal() {
    setEditUsername(displayUsername);
    setEditPassword("");
    setEditConfirmPassword("");
    setIsEditModalVisible(true);
  }

  function closeEditModal() {
    if (isSavingEdit)
    {
      return;
    }
    setIsEditModalVisible(false);
  }

  async function handleSaveProfileEdits() {
    const trimmedUsername = editUsername.trim();
    if (!trimmedUsername) {
      Alert.alert("Invalid username", "Username cannot be empty.");
      return;
    }

    if (editPassword) {
      if (editPassword.length < 6) {
        Alert.alert("Weak password", "Password must be at least 6 characters.");
        return;
      }
      if (editPassword !== editConfirmPassword) {
        Alert.alert("Mismatch", "Password and confirmation do not match.");
        return;
      }
    }

    setIsSavingEdit(true);
    const updatePayload: { data: { username: string }; password?: string } = {
      data: { username: trimmedUsername },
    };
    if (editPassword) updatePayload.password = editPassword;

    const { error } = await supabase.auth.updateUser(updatePayload);
    setIsSavingEdit(false);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    setUsernameOverride(trimmedUsername);
    setIsEditModalVisible(false);
    Alert.alert("Success", "Account details saved.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="account-cog-outline" size={22} color={WHITE_TEXT_COLOR} />
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <TouchableOpacity style={styles.editAction} onPress={openEditModal}>
              <Feather name="edit-2" size={13} color={ORANGE_COLOR} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <Text style={styles.avatarName}>{displayUsername}</Text>
          </View>

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput value={displayUsername} editable={false} style={styles.readonlyInput} placeholderTextColor="#7D97BC" />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Email Address</Text>
          <TextInput
            value={user?.email || ""}
            editable={false}
            style={styles.readonlyInput}
            placeholderTextColor="#7D97BC"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About TravelEagle</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>

          <Text style={styles.fieldLabel}>Current Password</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            style={styles.editableInput}
            placeholder="Enter current password"
            placeholderTextColor="#7D97BC"
            secureTextEntry
          />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.editableInput}
            placeholder="Enter new password"
            placeholderTextColor="#7D97BC"
            secureTextEntry
          />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Confirm New Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.editableInput}
            placeholder="Re-enter new password"
            placeholderTextColor="#7D97BC"
            secureTextEntry
          />

          <TouchableOpacity style={styles.updateButton} onPress={handlePasswordUpdate}>
            <Text style={styles.updateButtonText}>Update Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={17} color={WHITE_TEXT_COLOR} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isEditModalVisible} transparent animationType="fade" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Account</Text>

            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={editUsername}
              onChangeText={setEditUsername}
              style={styles.editableInput}
              placeholder="Enter username"
              placeholderTextColor="#7D97BC"
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>New Password</Text>
            <TextInput
              value={editPassword}
              onChangeText={setEditPassword}
              style={styles.editableInput}
              placeholder="Leave blank to keep current password"
              placeholderTextColor="#7D97BC"
              secureTextEntry
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Confirm New Password</Text>
            <TextInput
              value={editConfirmPassword}
              onChangeText={setEditConfirmPassword}
              style={styles.editableInput}
              placeholder="Re-enter new password"
              placeholderTextColor="#7D97BC"
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal} disabled={isSavingEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfileEdits} disabled={isSavingEdit}>
                {isSavingEdit ? (
                  <ActivityIndicator color={WHITE_TEXT_COLOR} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  page: {
    flex: 1,
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 26,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
  },
  headerTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 29,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#0f2c58",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1c4a83",
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 8,
  },
  editAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    color: ORANGE_COLOR,
    fontWeight: "700",
    fontSize: 13,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2f57d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 28,
    fontWeight: "700",
  },
  avatarName: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 17,
  },
  fieldLabel: {
    color: "#9DB4D8",
    fontSize: 13,
    marginBottom: 5,
  },
  readonlyInput: {
    backgroundColor: "#1f3f6b",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
  },
  editableInput: {
    backgroundColor: "#1f3f6b",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoKey: {
    color: "#9DB4D8",
    fontSize: 17,
  },
  infoValue: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 17,
  },
  updateButton: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#2f57d0",
    paddingVertical: 12,
    alignItems: "center",
  },
  updateButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 15,
  },
  signOutButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#ff0d1f",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  signOutText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 21,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 12, 30, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: "#0f2c58",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1c4a83",
    padding: 16,
  },
  modalTitle: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#6e8ab4",
  },
  cancelButtonText: {
    color: "#bcd1ee",
    fontWeight: "700",
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 10,
    backgroundColor: "#2f57d0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 14,
  },
});
