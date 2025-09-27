import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onUploadSuccess: (fileId: number, url?: string) => void;
}

const ImageUploader = ({ onUploadSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.length) return;

  const file = e.target.files[0];
  console.log("📤 [UPLOAD] Selected file:", file.name, file.size, file.type);

  const formData = new FormData();
  formData.append("file", file);

  console.log("📦 [UPLOAD] FormData created for:", file.name);

  setLoading(true);

  try {
    const res = await apiFetch("/media", {
      method: "POST",
      data: formData,
    });

    console.log("✅ [UPLOAD] Server response:", res);

    const uploaded = res?.data?.data;
    if (uploaded?.id) {
      console.log("🎉 [UPLOAD] File uploaded successfully with ID:", uploaded.id);
      onUploadSuccess(uploaded.id, uploaded.previewUrl || uploaded.fullUrl);
    } else {
      console.warn("⚠️ [UPLOAD] Upload finished but no ID returned");
    }
  } catch (err) {
    console.error("❌ [UPLOAD] Upload failed:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex gap-2 items-center">
      <input 
        type="file" 
        onChange={handleUpload} 
        disabled={loading} 
        accept="image/*"
      />
      {loading && <span>Uploading...</span>}
    </div>
  );
};

export default ImageUploader;
