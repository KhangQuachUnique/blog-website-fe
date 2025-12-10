//import React from "react";

interface Props {
  community: {
    id: number;
    name: string;
    description: string;
    thumbnailUrl?: string;
    role: "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING";
  };
}

const CommunityHeader = ({ community }: Props) => {
  return (
    <div style={{ width: "100%", marginBottom: 20 }}>
      {/* Cover Image */}
      <div
        style={{
          width: "100%",
          height: 220,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#eee",
        }}
      >
        <img
          src={community.thumbnailUrl}
          alt="cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Main Info */}
      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700 }}>{community.name}</h2>
        <p style={{ color: "#555", maxWidth: 700 }}>{community.description}</p>

        <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
          <b>Vai trò của bạn:</b> {community.role}
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;
