import { useEffect, useState } from "react";

import PrivacySetting from "./components/PrivacySetting";
import ApprovePostToggle from "./components/ApprovePostToggle";
import ApproveMemberToggle from "./components/ApproveMemberToggle";
import ForumInfoForm from "./components/ForumInfoForm";

import {
  getCommunitySettings,
  updateCommunitySettings,
} from "./community.api";
import { useGetCommunitySettings } from "../../hooks/useCommunity";

const ForumSetting = () => {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    thumbnailUrl: "",
    isPublic: true,
    requirePostApproval: false,
    requireMemberApproval: false,
  });

  const { data, isLoading, isSuccess, isError } = useGetCommunitySettings(1);

  useEffect(() => {
    if (isSuccess && data) {
      setForm({
        name: data.name,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl : "",
        isPublic: data.isPublic,
        requirePostApproval: data.requirePostApproval,
        requireMemberApproval: data.requireMemberApproval,
      });
    }
  }, [isSuccess, data]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateCommunitySettings(form);
      alert("Đã lưu thay đổi!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu thay đổi!");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div>Đang tải dữ liệu...</div>;

  if (isError) return <div>Lỗi khi tải dữ liệu.</div>;

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Forum Settings</h3>

      <div className="community-card">
        <PrivacySetting
          isPublic={form.isPublic}
          onChange={(val: boolean) => updateField("isPublic", val)}
        />
      </div>

      <div className="community-card">
        <ApprovePostToggle
          value={form.requirePostApproval}
          onChange={(val: boolean) => updateField("requirePostApproval", val)}
        />
      </div>

      <div className="community-card">
        <ApproveMemberToggle
          value={form.requireMemberApproval}
          onChange={(val: boolean) =>
            updateField("requireMemberApproval", val)
          }
        />
      </div>

      <div className="community-card">
        <ForumInfoForm
          name={form.name}
          description={form.description}
          thumbnailUrl={form.thumbnailUrl}
          onChange={updateField}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default ForumSetting;
