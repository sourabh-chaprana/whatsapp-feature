import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubAdmins } from "../../store/slices/subAdmin/subAdminThunk";
import { assignUsersToSession } from "../../store/slices/chats/chatThunk";
import "./AgencyDropdown.css";

const AgencyDropdown = ({
  pendingAgents,
  assignedAgents = [],
  onAgentSelect,
  onAgentAdd,
  onAgentClear,
  currentSession,
}) => {
  const dispatch = useDispatch();
  const { subAdmins, loading } = useSelector((state) => state.subAdmins);
  const { loading: chatLoading } = useSelector((state) => state.chat);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchSubAdmins());
  }, [dispatch]);

  useEffect(() => {
    if (currentSession?.assignedUsers && subAdmins.length > 0) {
      const userIds = currentSession.assignedUsers
        .filter(assignment => assignment.isActive)
        .map(assignment => assignment.userId);
      
      const currentAssignedIds = assignedAgents.map(agent => agent._id);
      const needsUpdate = userIds.some(id => !currentAssignedIds.includes(id)) || 
                          currentAssignedIds.some(id => !userIds.includes(id));
      
      if (needsUpdate) {
        const assignedSubAdmins = subAdmins.filter(admin => 
          userIds.includes(admin._id)
        );
        
        onAgentSelect(assignedSubAdmins);
      }
    }
  }, [currentSession, subAdmins]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAgents = subAdmins.filter(
    (agent) =>
      agent.isActive &&
      (agent.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAgentToggle = (agent) => {
    const isSelected = pendingAgents.some(
      (selected) => selected._id === agent._id
    );

    if (isSelected) {
      const updatedSelection = pendingAgents.filter(
        (selected) => selected._id !== agent._id
      );
      onAgentSelect(updatedSelection);
    } else {
      const updatedSelection = [...pendingAgents, agent];
      onAgentSelect(updatedSelection);
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  const handleAdd = () => {
    if (pendingAgents.length > 0 && currentSession) {
      const userIds = pendingAgents.map((agent) => agent._id);

      dispatch(
        assignUsersToSession({
          sessionId: currentSession._id,
          userIds,
        })
      )
        .unwrap()
        .then((response) => {
          onAgentAdd();
          setIsOpen(false);
        })
        .catch((error) => {
          console.error("Failed to assign agents:", error);
          alert(
            "Failed to assign agents: " + (error.message || "Unknown error")
          );
        });
    } else {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onAgentSelect([]);
  };

  const isAgentSelected = (agent) => {
    return pendingAgents.some((selected) => selected._id === agent._id);
  };

  const isAgentAssigned = (agent) => {
    return assignedAgents.some((assigned) => assigned._id === agent._id);
  };

  return (
    <div className="agency-dropdown-container" ref={dropdownRef}>
      <button
        className="comm-channel-tab-btn agency-dropdown-btn"
        onClick={handleToggleDropdown}
        title={`Assign agents to ${currentSession?.phoneNumber || "chat"}`}
      >
        <i className="fas fa-building"></i>
        <span>Agents</span>
        <i
          className={`fas fa-chevron-${isOpen ? "up" : "down"} dropdown-arrow`}
        ></i>
      </button>

      {isOpen && (
        <div className="agency-dropdown-menu">
          <div className="agency-dropdown-header">
            <div className="agency-search-container">
              <i className="fas fa-search agency-search-icon"></i>
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="agency-search-input"
                autoFocus
              />
            </div>
          </div>

          <div className="agency-dropdown-list">
            {loading ? (
              <div className="agency-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading...</span>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="agency-no-results">
                <i className="fas fa-search"></i>
                <span>
                  {searchTerm
                    ? `No agents found for "${searchTerm}"`
                    : "No agents available"}
                </span>
              </div>
            ) : (
              filteredAgents.map((agent) => {
                const isSelected = isAgentSelected(agent);
                const isAssigned = isAgentAssigned(agent);
                return (
                  <div
                    key={agent._id}
                    className={`agency-dropdown-item ${
                      isSelected ? "selected" : ""
                    } ${isAssigned ? "assigned" : ""}`}
                    onClick={() => handleAgentToggle(agent)}
                  >
                    <div className="agency-checkbox">
                      <i
                        className={`fas ${
                          isSelected
                            ? "fa-check-square"
                            : "fa-square"
                        }`}
                      ></i>
                    </div>
                    <div className="agency-avatar">
                      {agent.fullName
                        ? agent.fullName.charAt(0).toUpperCase()
                        : "A"}
                    </div>
                    <div className="agency-info">
                      <div className="agency-name">{agent.fullName}</div>
                      <div className="agency-email">{agent.email}</div>
                    </div>
                    <div className="agency-status">
                      {isAssigned && (
                        <span className="assigned-badge">Assigned</span>
                      )}
                      <i
                        className={`fas fa-circle ${
                          agent.isActive ? "status-active" : "status-inactive"
                        }`}
                        title={agent.isActive ? "Active" : "Inactive"}
                      ></i>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="agency-dropdown-footer">
            <div className="selected-info">
              {pendingAgents.length > 0 && (
                <span className="selected-count">
                  {pendingAgents.length} selected
                </span>
              )}
              {assignedAgents.length > 0 && (
                <span className="assigned-count">
                  • {assignedAgents.length} assigned
                </span>
              )}
            </div>

            <div className="agency-actions">
              <button
                className="add-btn"
                onClick={handleAdd}
                disabled={pendingAgents.length === 0}
                title="Add selected agents"
              >
                <i className="fas fa-plus"></i>
                Add ({pendingAgents.length})
              </button>

              <button
                className="clear-btn"
                onClick={handleClear}
                disabled={pendingAgents.length === 0}
                title="Clear selection"
              >
                <i className="fas fa-times"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyDropdown;
