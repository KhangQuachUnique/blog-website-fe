import PrivacySetting from "./components/PrivacySetting";
import ApprovePostToggle from "./components/ApprovePostToggle";
import ApproveMemberToggle from "./components/ApproveMemberToggle";
import ForumInfoForm from "./components/ForumInfoForm";

const ForumSetting = () => {
  return (
    <div style={{ paddingTop: 24 }}>
      <h3>Forum Settings</h3>

      <PrivacySetting />
      <ApprovePostToggle />
      <ApproveMemberToggle />
      <ForumInfoForm />
    </div>
  );
};

export default ForumSetting;
