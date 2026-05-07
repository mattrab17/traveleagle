import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView as RNScrollView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../../constants/colors";
import { useAuth } from "../../(authentication)/Auth";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

type UserPost = {
  id: string;
  place_name: string | null;
  address: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
};

export default function MyPostHistory() {
  const { user } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPlaceName, setEditPlaceName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  async function loadPreviousPosts() {
    if (!user?.id) {
      setUserPosts([]);
      return;
    }

    setIsLoadingPosts(true);

    const { data, error } = await supabase
      .from("user_posts")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    setIsLoadingPosts(false);

    if (error) {
      Alert.alert("Error", "Could not load previous posts.");
      console.error(error);
      return;
    }

    setUserPosts((data || []) as UserPost[]);
  }

  useEffect(() => {
    loadPreviousPosts();
  }, [user?.id]);

  function openEditPostModal(post: UserPost) {
    setEditingPostId(post.id);
    setEditPlaceName(post.place_name || "");
    setEditAddress(post.address || "");
    setEditDescription(post.description || "");
    setEditCategory(post.category || "");
    setEditImageUrl(post.image_url || "");
    setIsEditModalVisible(true);
  }

  async function saveEditedPost() {
    if (!editingPostId || !user?.id) return;
    if (!editPlaceName.trim() || !editAddress.trim()) {
      Alert.alert("Missing fields", "Place name and address are required.");
      return;
    }

    setIsSavingEdit(true);
    const { error } = await supabase
      .from("user_posts")
      .update({
        place_name: editPlaceName.trim(),
        address: editAddress.trim(),
        description: editDescription.trim() || null,
        category: editCategory.trim() || null,
        image_url: editImageUrl.trim() || null,
      })
      .eq("id", editingPostId)
      .eq("created_by", user.id);
    setIsSavingEdit(false);

    if (error) {
      Alert.alert("Error", "Could not update post.");
      console.error(error);
      return;
    }

    setUserPosts((prev) =>
      prev.map((post) =>
        post.id === editingPostId
          ? {
              ...post,
              place_name: editPlaceName.trim(),
              address: editAddress.trim(),
              description: editDescription.trim() || null,
              category: editCategory.trim() || null,
              image_url: editImageUrl.trim() || null,
            }
          : post
      )
    );
    setIsEditModalVisible(false);
    setEditingPostId(null);
    Alert.alert("Success", "Post updated.");
  }

  async function deletePost(postId: string) {
    if (!user?.id) return;

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("user_posts")
            .delete()
            .eq("id", postId)
            .eq("created_by", user.id);

          if (error) {
            Alert.alert("Error", "Could not delete post.");
            console.error(error);
            return;
          }

          setUserPosts((prev) => prev.filter((post) => post.id !== postId));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={WHITE_TEXT_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Post History</Text>
        </View>

        <View style={styles.card}>
          {isLoadingPosts ? (
            <ActivityIndicator color={WHITE_TEXT_COLOR} />
          ) : userPosts.length === 0 ? (
            <Text style={styles.emptyText}>You have not created any posts yet.</Text>
          ) : (
            userPosts.map((post) => (
              <View key={post.id} style={styles.postBox}>
                <Text style={styles.postTitle}>{post.place_name || "Unnamed Place"}</Text>
                <Text style={styles.postText}>{post.address || "No address"}</Text>
                <Text style={styles.postText}>{post.description || "No description"}</Text>
                <Text style={styles.postCategory}>{post.category || "No category"}</Text>

                <View style={styles.postActionsRow}>
                  <TouchableOpacity style={styles.editPostButton} onPress={() => openEditPostModal(post)}>
                    <Text style={styles.editPostText}>Edit Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deletePostButton} onPress={() => deletePost(post.id)}>
                    <Text style={styles.deletePostText}>Delete Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <RNScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalTitle}>Edit Post</Text>

              <Text style={styles.fieldLabel}>Place Name</Text>
              <TextInput value={editPlaceName} onChangeText={setEditPlaceName} style={styles.editableInput} />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Address</Text>
              <TextInput value={editAddress} onChangeText={setEditAddress} style={styles.editableInput} />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Description</Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                style={[styles.editableInput, styles.multilineInput]}
                multiline
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Category</Text>
              <TextInput value={editCategory} onChangeText={setEditCategory} style={styles.editableInput} />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Image URL</Text>
              <TextInput value={editImageUrl} onChangeText={setEditImageUrl} style={styles.editableInput} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditModalVisible(false)} disabled={isSavingEdit}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveEditedPost} disabled={isSavingEdit}>
                  {isSavingEdit ? <ActivityIndicator color={WHITE_TEXT_COLOR} /> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </RNScrollView>
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f3f6b",
    borderWidth: 1,
    borderColor: "#2a4d7e",
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
  emptyText: {
    color: "#9DB4D8",
    fontSize: 16,
  },
  postBox: {
    backgroundColor: "#1f3f6b",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  postTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  postText: {
    color: "#bcd1ee",
    fontSize: 14,
    marginBottom: 4,
  },
  postCategory: {
    color: ORANGE_COLOR,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  postActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  editPostButton: {
    flex: 1,
    backgroundColor: "#2f57d0",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  editPostText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 14,
  },
  deletePostButton: {
    flex: 1,
    backgroundColor: "#ff0d1f",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  deletePostText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 14,
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
    height: 560
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalTitle: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#9DB4D8",
    fontSize: 13,
    marginBottom: 5,
  },
  editableInput: {
    backgroundColor: "#1f3f6b",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1c4a83",
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
