import React from "react";
import "./AgentAvatar.css";

const AgentAvatar = ({ agent, size = "small", showTooltip = true }) => {
  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getRandomColor = (name) => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const avatarStyle = {
    backgroundColor: getRandomColor(agent.fullName),
  };

  return (
    <div
      className={`agent-avatar ${size}`}
      title={showTooltip ? `${agent.fullName || "Agent"} - ${agent.email || ""}` : ""}
    >
      <div className="agent-avatar-circle" style={avatarStyle}>
        {getInitials(agent.fullName)}
      </div>
    </div>
  );
};

export default AgentAvatar;
