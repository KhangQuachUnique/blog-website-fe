import PrivacySetting from "./components/PrivacySetting";
import ApprovePostToggle from "./components/ApprovePostToggle";
import ApproveMemberToggle from "./components/ApproveMemberToggle";
import ForumInfoForm from "./components/ForumInfoForm";

const ForumSetting = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Forum Settings</h3>

      <div className="community-card">
        <PrivacySetting />
      </div>

      <div className="community-card">
        <ApprovePostToggle />
      </div>

      <div className="community-card">
        <ApproveMemberToggle />
      </div>

      <div className="community-card">
        <ForumInfoForm />
      </div>
    </div>
  );
};

export default ForumSetting;
